import { LogOptions, Plugin, SpectralConfigOptions } from '../types';
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
    private globalQueue;
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
     * Prompt the user for input and return the entered string.
     */
    input(message: string, options?: LogOptions & {
        default?: string;
    }): Promise<string>;
    /**
     * Internal method that handles all logging with strict ordering
     */
    private processLog;
    /**
     * Public logging methods - all go through the global queue
     */
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
    /**
     * Enqueue a log operation in the global queue
     */
    private enqueueLog;
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
    /** Create a child logger that prefixes messages with a scope label and inherits config/plugins. */
    child(scope: string): SpectralLogger;
    flush(): void;
    /**
     * Awaitable flush — ensures it completes before continuing.
     * Use it in tests or during shutdown: `await logger.flushAsync()`.
   */
    flushAsync(): Promise<void>;
    getConfig(): Required<SpectralConfigOptions>;
    getErrorStats(): Map<string, import("./SpectralError").ErrorEntry>;
    clearErrorCache(): void;
}
//# sourceMappingURL=SpectralLogger.d.ts.map