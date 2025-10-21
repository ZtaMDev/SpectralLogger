// FileLogger.ts
import { Plugin, LogLevel, LogOptions, LoggerContext } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface FileLoggerOptions {
  filePath?: string;
  maxSize?: number;
  rotate?: boolean;
  format?: 'json' | 'text';
  includeContext?: boolean;
  handleScope?: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LoggerContext;
  metadata?: Record<string, any>;
  scope?: string;
}

export class FileLoggerPlugin implements Plugin {
  public name = 'FileLogger';
  private filePath: string;
  private maxSize: number;
  private rotate: boolean;
  private format: 'json' | 'text';
  private includeContext: boolean;
  private handleScope: boolean;
  private writeStream?: fs.WriteStream;
  private currentSize: number = 0;
  private scope?: string;

  constructor(options: FileLoggerOptions = {}) {
    this.filePath = options.filePath || path.join(process.cwd(), '.spectral', 'logs.json');
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.rotate = options.rotate ?? true;
    this.format = options.format || 'json';
    this.includeContext = options.includeContext ?? true;
    this.handleScope = options.handleScope ?? true;
    this.name = `FileLogger-${Math.random().toString(36).substring(2, 9)}`;
  }

  public init(logger: any): void {
    this.scope = logger.scope;
    
    const dir = path.dirname(this.filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      this.currentSize = stats.size;
      
      if (this.rotate && this.currentSize > this.maxSize) {
        this.rotateLog();
      }
    }

    this.writeStream = fs.createWriteStream(this.filePath, { 
      flags: 'a',
      encoding: 'utf8'
    });
  }

  private rotateLog(): void {
    if (!this.writeStream) return;

    this.writeStream.end();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(this.filePath);
    const baseName = path.basename(this.filePath, ext);
    const dir = path.dirname(this.filePath);
    const rotatedPath = path.join(dir, `${baseName}-${timestamp}${ext}`);

    try {
      fs.renameSync(this.filePath, rotatedPath);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }

    this.writeStream = fs.createWriteStream(this.filePath, { 
      flags: 'a',
      encoding: 'utf8'
    });
    this.currentSize = 0;
  }

  public afterLog(message: string, level: LogLevel, options?: LogOptions): void {
    if (!this.writeStream) return;

    const logEntry = this.createLogEntry(message, level, options);
    const logLine = this.formatLogEntry(logEntry);

    if (this.rotate && (this.currentSize + Buffer.byteLength(logLine, 'utf8')) > this.maxSize) {
      this.rotateLog();
    }

    this.writeStream.write(logLine);
    this.currentSize += Buffer.byteLength(logLine, 'utf8');
  }

  private createLogEntry(message: string, level: LogLevel, options?: LogOptions): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };

    if (this.handleScope && this.scope) {
      entry.scope = this.scope;
    }

    if (this.includeContext && options?.context) {
      entry.context = options.context;
    }

    if (options) {
      const metadata = { ...options };
      delete metadata.context;
      
      if (Object.keys(metadata).length > 0) {
        entry.metadata = metadata;
      }
    }

    return entry;
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify(entry) + '\n';
    } else {
      const timestamp = entry.timestamp;
      const level = entry.level.toUpperCase().padEnd(7);
      const scope = entry.scope ? `[${entry.scope}]` : '';
      const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      
      return `[${timestamp}] ${level}${scope} ${entry.message}${context}${metadata}\n`;
    }
  }

  public close(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }

  public createForChild(childScope: string): FileLoggerPlugin {
    const childOptions: FileLoggerOptions = {
      filePath: this.filePath,
      maxSize: this.maxSize,
      rotate: this.rotate,
      format: this.format,
      includeContext: this.includeContext,
      handleScope: this.handleScope
    };

    const childPlugin = new FileLoggerPlugin(childOptions);
    const originalInit = childPlugin.init.bind(childPlugin);
    childPlugin.init = (logger: any) => {
      originalInit(logger);
    };

    return childPlugin;
  }
}