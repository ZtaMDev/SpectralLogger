import { Plugin, LogLevel, LogOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface FileLoggerOptions {
  filePath?: string;
  maxSize?: number;
  rotate?: boolean;
}

export class FileLoggerPlugin implements Plugin {
  public name = 'FileLogger';
  private filePath: string;
  private maxSize: number;
  private rotate: boolean;
  private writeStream?: fs.WriteStream;

  constructor(options: FileLoggerOptions = {}) {
    this.filePath = options.filePath || path.join(process.cwd(), '.spectral', 'logs.txt');
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.rotate = options.rotate ?? true;
  }

  public init(): void {
    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (this.rotate && fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      if (stats.size > this.maxSize) {
        this.rotateLog();
      }
    }

    this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
  }

  private rotateLog(): void {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const rotatedPath = this.filePath.replace('.txt', `-${timestamp}.txt`);

    try {
      fs.renameSync(this.filePath, rotatedPath);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  public afterLog(message: string, level: LogLevel, options?: LogOptions): void {
    if (!this.writeStream) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    this.writeStream.write(logEntry);
  }

  public close(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }
}
