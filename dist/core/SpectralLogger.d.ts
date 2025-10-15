import { Plugin, SpectralConfigOptions } from '../types';
/**
 * High-performance logger for Node.js environments.
 *
 * Provides colorized output, timestamps, levels, error formatting,
 * plugin hooks, and buffered stdout/stderr writes for speed.
 */
export declare class SpectralLogger {
    private config;
    private output;
    private formatter;
    private errorHandler;
    private plugins;
    private scope?;
    /**
     * Inline color helper usable in template strings.
     * Example: `spec.log(`${this.color('Title', 'warn')} details`)`
     * Also exposes `spec.color.add(name, color)` to register custom colors.
     */
    readonly color: ((text: string, colorNameOrCode: string) => string) & {
        add: (name: string, color: string) => void;
    };
    /**
     * Create a new Spectral logger instance using the global configuration
     * (`SpectralConfig.getInstance()`).
     */
    constructor(scope?: string);
    /**
     * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
     * @param options Partial configuration to merge with current settings
     */
    configure(options: SpectralConfigOptions): void;
    /**
     * Register a plugin to execute hooks before/after each log.
     * @param plugin Plugin implementation providing optional `init`, `beforeLog`, and `afterLog` hooks
     */
    use(plugin: Plugin): void;
    private executePlugins;
    private writeQueue;
    private writeLog;
    /** Create a child logger that prefixes messages with a scope label and inherits config/plugins. */
    child(scope: string): SpectralLogger;
    /** Log a general message. */
    log(message: any, color?: string, codec?: BufferEncoding): void;
    /** Log an informational message. */
    info(message: any, color?: string, codec?: BufferEncoding): void;
    /** Log a success message. */
    success(message: any, color?: string, codec?: BufferEncoding): void;
    /** Log a warning message. */
    warn(message: any, color?: string, codec?: BufferEncoding): void;
    /** Log an error. Accepts `Error` objects for rich stack formatting. */
    error(message: any, color?: string, codec?: BufferEncoding): void;
    /** Log a debug message (emitted only when `debugMode` is enabled). */
    debug(message: any, color?: string, codec?: BufferEncoding): void;
    /** Force-flush any buffered output to stdout/stderr (retrocompatible, no bloqueante). */
    flush(): void;
    /**
      * Awaitable flush — ensures it completes before continuing.
      * Use it in tests or during shutdown: `await logger.flushAsync()`.
    */
    flushAsync(): Promise<void>;
    /** Get the current, fully-resolved configuration. */
    getConfig(): Required<SpectralConfigOptions>;
    /** Get the internal error cache and counters (diagnostics). */
    getErrorStats(): Map<string, import("./SpectralError").ErrorEntry>;
    /** Clear the internal error cache. */
    clearErrorCache(): void;
}
//# sourceMappingURL=SpectralLogger.d.ts.map