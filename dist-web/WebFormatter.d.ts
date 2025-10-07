import type { LogLevel, LogOptionsWeb } from './types.js';
export declare class WebFormatter {
    private config;
    private colors;
    constructor(config: {
        showTimestamp: boolean;
        showLevel: boolean;
        colors: Record<LogLevel | 'log', string>;
    });
    format(message: string, level: LogLevel, options?: LogOptionsWeb): {
        args: any[];
    };
    formatError(error: Error): {
        args: any[];
    };
    private getLevelColor;
    private cleanStackTrace;
}
//# sourceMappingURL=WebFormatter.d.ts.map