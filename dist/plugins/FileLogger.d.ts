import { Plugin, LogLevel, LogOptions } from '../types';
export interface FileLoggerOptions {
    filePath?: string;
    maxSize?: number;
    rotate?: boolean;
}
export declare class FileLoggerPlugin implements Plugin {
    name: string;
    private filePath;
    private maxSize;
    private rotate;
    private writeStream?;
    constructor(options?: FileLoggerOptions);
    init(): void;
    private rotateLog;
    afterLog(message: string, level: LogLevel, options?: LogOptions): void;
    close(): void;
}
//# sourceMappingURL=FileLogger.d.ts.map