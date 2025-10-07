import { WebFormatter } from './WebFormatter.js';
export interface ErrorEntryWeb {
    error: Error;
    count: number;
    firstSeen: Date;
    lastSeen: Date;
}
export declare class WebErrorHandler {
    private formatter;
    private errorCache;
    private maxCacheSize;
    constructor(formatter: WebFormatter);
    handle(error: Error): {
        args: any[];
    };
    getErrorStats(): Map<string, ErrorEntryWeb>;
    clearCache(): void;
    private clearOldest;
}
//# sourceMappingURL=WebError.d.ts.map