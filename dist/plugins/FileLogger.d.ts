import { Plugin, LogLevel, LogOptions, LoggerContext } from '../types';
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
export declare class FileLoggerPlugin implements Plugin {
    name: string;
    private filePath;
    private maxSize;
    private rotate;
    private format;
    private includeContext;
    private handleScope;
    private writeStream?;
    private currentSize;
    private scope?;
    constructor(options?: FileLoggerOptions);
    init(logger: any): void;
    private rotateLog;
    afterLog(message: string, level: LogLevel, options?: LogOptions): void;
    private createLogEntry;
    private formatLogEntry;
    close(): void;
    createForChild(childScope: string): FileLoggerPlugin;
}
//# sourceMappingURL=FileLogger.d.ts.map