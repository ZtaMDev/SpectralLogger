"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralLoggerWeb = void 0;
const WebFormatter_js_1 = require("./WebFormatter.js");
const WebOutput_js_1 = require("./WebOutput.js");
const WebError_js_1 = require("./WebError.js");
/**
 * High-performance, browser-friendly logger.
 *
 * Uses CSS-styled segments with `%c`, optional batching to reduce console overhead,
 * and supports pluggable hooks before/after each log call. Designed for use via
 * the `spectrallogs/web` subpath import.
 */
class SpectralLoggerWeb {
    config = {
        showTimestamp: true,
        showLevel: true,
        debugMode: false,
        timeFormat: 'iso',
        colors: {
            info: '#00bfff',
            success: '#00ff88',
            warn: '#ffaa00',
            error: '#ff5555',
            log: '#dddddd',
            debug: '#cc66ff',
        },
    };
    output;
    formatter;
    errorHandler;
    plugins = [];
    scope;
    /**
     * Create a web logger.
     * @param outputOptions Configure batching and/or a custom sink (e.g., DOM appender)
     */
    constructor(outputOptions = {}, scope) {
        this.output = new WebOutput_js_1.WebOutput(outputOptions);
        this.formatter = new WebFormatter_js_1.WebFormatter({
            showTimestamp: this.config.showTimestamp,
            showLevel: this.config.showLevel,
            colors: this.config.colors,
        });
        this.errorHandler = new WebError_js_1.WebErrorHandler(this.formatter);
        this.scope = scope;
    }
    /**
     * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
     * @param options Partial configuration to merge with current settings
     */
    configure(options) {
        if (options.showTimestamp !== undefined)
            this.config.showTimestamp = options.showTimestamp;
        if (options.showLevel !== undefined)
            this.config.showLevel = options.showLevel;
        if (options.debugMode !== undefined)
            this.config.debugMode = options.debugMode;
        if (options.timeFormat !== undefined)
            this.config.timeFormat = options.timeFormat;
        if (options.colors)
            this.config.colors = { ...this.config.colors, ...options.colors };
        // Re-crear formatter con nueva config visible
        this.formatter = new WebFormatter_js_1.WebFormatter({
            showTimestamp: this.config.showTimestamp,
            showLevel: this.config.showLevel,
            colors: this.config.colors,
        });
        // ErrorHandler sigue usando el formatter actualizado por referencia
        this.errorHandler = new WebError_js_1.WebErrorHandler(this.formatter);
    }
    /**
     * Register a plugin to execute hooks before/after each log.
     * @param plugin Plugin with optional `init`, `beforeLog`, and `afterLog`
     */
    use(plugin) {
        this.plugins.push(plugin);
        if (plugin.init)
            plugin.init(this);
    }
    executePlugins(message, level, options, phase = 'before') {
        let processed = message;
        for (const p of this.plugins) {
            if (phase === 'before' && p.beforeLog) {
                const res = p.beforeLog(message, level, options);
                if (res !== undefined)
                    processed = res;
            }
            else if (phase === 'after' && p.afterLog) {
                p.afterLog(message, level, options);
            }
        }
        return processed;
    }
    writeLog(message, level, color) {
        if (level === 'debug' && !this.config.debugMode)
            return;
        let messageStr;
        if (message instanceof Error) {
            const formatted = this.errorHandler.handle(message);
            this.output.writeConsoleArgs(formatted.args, level);
            return;
        }
        else if (typeof message === 'object') {
            messageStr = JSON.stringify(message, null, 2);
        }
        else {
            messageStr = String(message);
        }
        const options = { color };
        let before = this.executePlugins(messageStr, level, options, 'before');
        if (this.scope)
            before = `[${this.scope}] ${before}`;
        const formatted = this.formatter.format(before, level, options);
        this.output.writeConsoleArgs(formatted.args, level);
        this.executePlugins(before, level, options, 'after');
    }
    /** Create a child logger that prefixes messages with a scope and inherits config/plugins/output. */
    child(scope) {
        const child = new SpectralLoggerWeb({}, scope);
        // Inherit config
        child.config = { ...this.config, colors: { ...this.config.colors } };
        // Recreate formatter with copied config
        child.formatter = new WebFormatter_js_1.WebFormatter({
            showTimestamp: child.config.showTimestamp,
            showLevel: child.config.showLevel,
            colors: child.config.colors,
        });
        // Share same output and error handler base
        child.output = this.output;
        child.errorHandler = new WebError_js_1.WebErrorHandler(child.formatter);
        // Copy plugins
        child.plugins = [...this.plugins];
        return child;
    }
    /** Log a general message. */
    log(message, color) { this.writeLog(message, 'log', color); }
    /** Log an informational message. */
    info(message, color) { this.writeLog(message, 'info', color); }
    /** Log a success message. */
    success(message, color) { this.writeLog(message, 'success', color); }
    /** Log a warning message. */
    warn(message, color) { this.writeLog(message, 'warn', color); }
    /** Log an error. Accepts `Error` objects for rich stack formatting. */
    error(message, color) { this.writeLog(message, 'error', color); }
    /** Log a debug message (emitted only when `debugMode` is enabled). */
    debug(message, color) { this.writeLog(message, 'debug', color); }
    /** Force-flush any buffered output. */
    flush() { this.output.flush(); }
    /** Get current resolved configuration. */
    getConfig() { return { ...this.config, colors: { ...this.config.colors } }; }
    /** Get error cache and counters. */
    getErrorStats() { return this.errorHandler.getErrorStats(); }
    /** Clear the internal error cache. */
    clearErrorCache() { this.errorHandler.clearCache(); }
}
exports.SpectralLoggerWeb = SpectralLoggerWeb;
//# sourceMappingURL=SpectralLoggerWeb.js.map