import type { LogLevel } from './types.js';
type Sink = (args: any[]) => void;
export interface WebOutputOptions {
    batching?: boolean;
    maxBatchSize?: number;
    maxLatencyMs?: number;
    sink?: Sink;
}
export declare class WebOutput {
    private buffer;
    private options;
    private scheduled;
    private channel?;
    constructor(options?: WebOutputOptions);
    writeConsoleArgs(args: any[], _level: LogLevel): void;
    private scheduleFlush;
    flush(): void;
    private defaultSink;
}
export {};
//# sourceMappingURL=WebOutput.d.ts.map