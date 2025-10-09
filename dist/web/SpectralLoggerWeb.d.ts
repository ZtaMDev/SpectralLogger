import type { SpectralConfigOptionsWeb, PluginWeb } from './types.js';
import { WebOutput } from './WebOutput.js';
/**
 * High-performance, browser-friendly logger.
 *
 * Uses CSS-styled segments with `%c`, optional batching to reduce console overhead,
 * and supports pluggable hooks before/after each log call. Designed for use via
 * the `spectrallogs/web` subpath import.
 */
export declare class SpectralLoggerWeb {
    private config;
    private output;
    private formatter;
    private errorHandler;
    private plugins;
    private scope?;
    /**
     * Inline color helper usable in template strings. Returns a marker that the formatter
     * will transform into a separate `%c` segment so only that span is colored.
     * Example: `${spec.color('Title', 'accent')} details`.
     */
    readonly color: ((text: string, colorNameOrCode: string) => string) & {
        add: (name: string, color: string) => void;
    };
    /**
     * Create a web logger.
     * @param outputOptions Configure batching and/or a custom sink (e.g., DOM appender)
     */
    constructor(outputOptions?: ConstructorParameters<typeof WebOutput>[0], scope?: string);
    /**
     * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
     * @param options Partial configuration to merge with current settings
     */
    configure(options: SpectralConfigOptionsWeb): void;
    /**
     * Register a plugin to execute hooks before/after each log.
     * @param plugin Plugin with optional `init`, `beforeLog`, and `afterLog`
     */
    use(plugin: PluginWeb): void;
    private executePlugins;
    private writeLog;
    /** Create a child logger that prefixes messages with a scope and inherits config/plugins/output. */
    child(scope: string): SpectralLoggerWeb;
    /** Log a general message. */
    log(message: any, color?: string): void;
    /** Log an informational message. */
    info(message: any, color?: string): void;
    /** Log a success message. */
    success(message: any, color?: string): void;
    /** Log a warning message. */
    warn(message: any, color?: string): void;
    /** Log an error. Accepts `Error` objects for rich stack formatting. */
    error(message: any, color?: string): void;
    /** Log a debug message (emitted only when `debugMode` is enabled). */
    debug(message: any, color?: string): void;
    /** Force-flush any buffered output. */
    flush(): void;
    /** Get current resolved configuration. */
    getConfig(): {
        colors: {
            info: string;
            success: string;
            warn: string;
            error: string;
            log: string;
            debug: string;
        };
        showTimestamp: boolean;
        showLevel: boolean;
        debugMode: boolean;
        timeFormat: "iso" | "unix" | "locale";
    };
    /** Get error cache and counters. */
    getErrorStats(): Map<string, import("./WebError.js").ErrorEntryWeb>;
    /** Clear the internal error cache. */
    clearErrorCache(): void;
}
//# sourceMappingURL=SpectralLoggerWeb.d.ts.map