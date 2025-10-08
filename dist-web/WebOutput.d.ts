import type { LogLevel } from './types.js';
type Sink = (args: any[]) => void;
/** Options to control WebOutput behavior. */
export interface WebOutputOptions {
    /** Enable message batching to reduce console overhead. */
    batching?: boolean;
    /** Max messages in buffer before a forced flush. */
    maxBatchSize?: number;
    /** Max latency before an automatic flush (in ms). */
    maxLatencyMs?: number;
    /** Alternate sink for messages (e.g., append to DOM). */
    sink?: Sink;
}
/**
 * Buffered output for browsers with optional batching.
 *
 * Default sink is `console.log`. You can provide a custom `sink` to send
 * messages to the DOM or elsewhere.
 */
export declare class WebOutput {
    private buffer;
    private options;
    private scheduled;
    private channel?;
    /**
     * @param options Configure batching thresholds and custom sink
     */
    constructor(options?: WebOutputOptions);
    /**
     * Queue or immediately write a pre-formatted set of console arguments.
     * @param args Arguments array suitable for `console.log(...args)`
     * @param _level Log level (currently unused for routing)
     */
    writeConsoleArgs(args: any[], _level: LogLevel): void;
    private scheduleFlush;
    /** Flush any buffered messages via the configured sink. */
    flush(): void;
    private defaultSink;
}
export {};
//# sourceMappingURL=WebOutput.d.ts.map