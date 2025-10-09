"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralLogger = void 0;
const SpectralConfig_1 = require("./SpectralConfig");
const SpectralOutput_1 = require("./SpectralOutput");
const SpectralFormatter_1 = require("./SpectralFormatter");
const SpectralError_1 = require("./SpectralError");
const colors_1 = require("../utils/colors");
/**
 * High-performance logger for Node.js environments.
 *
 * Provides colorized output, timestamps, levels, error formatting,
 * plugin hooks, and buffered stdout/stderr writes for speed.
 */
class SpectralLogger {
    config;
    output;
    formatter;
    errorHandler;
    plugins = [];
    scope;
    /**
     * Inline color helper usable in template strings.
     * Example: `spec.log(`${this.color('Title', 'warn')} details`)`
     * Also exposes `spec.color.add(name, color)` to register custom colors.
     */
    color;
    /**
     * Create a new Spectral logger instance using the global configuration
     * (`SpectralConfig.getInstance()`).
     */
    constructor(scope) {
        this.config = SpectralConfig_1.SpectralConfig.getInstance();
        this.output = new SpectralOutput_1.SpectralOutput(this.config);
        this.formatter = new SpectralFormatter_1.SpectralFormatter(this.config);
        this.errorHandler = new SpectralError_1.SpectralError(this.formatter);
        this.scope = scope;
        // Bind color helper
        const colorFn = (text, colorNameOrCode) => {
            const cfg = this.config.getConfig();
            const levelMap = cfg.colors;
            const resolved = levelMap[colorNameOrCode] || colorNameOrCode;
            return (0, colors_1.colorize)(text, resolved);
        };
        colorFn.add = (name, color) => (0, colors_1.addCustomColor)(name, color);
        this.color = colorFn;
    }
    /**
     * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
     * @param options Partial configuration to merge with current settings
     */
    configure(options) {
        this.config.configure(options);
    }
    /**
     * Register a plugin to execute hooks before/after each log.
     * @param plugin Plugin implementation providing optional `init`, `beforeLog`, and `afterLog` hooks
     */
    use(plugin) {
        this.plugins.push(plugin);
        if (plugin.init) {
            plugin.init(this);
        }
    }
    executePlugins(message, level, options, phase = 'before') {
        let processedMessage = message;
        for (const plugin of this.plugins) {
            if (phase === 'before' && plugin.beforeLog) {
                const result = plugin.beforeLog(message, level, options);
                if (result !== undefined) {
                    processedMessage = result;
                }
            }
            else if (phase === 'after' && plugin.afterLog) {
                plugin.afterLog(message, level, options);
            }
        }
        return processedMessage;
    }
    writeLog(message, level, color, codec) {
        if (level === 'debug' && !this.config.debugMode) {
            return;
        }
        let messageStr;
        if (message instanceof Error) {
            messageStr = this.errorHandler.handle(message);
        }
        else if (typeof message === 'object') {
            messageStr = JSON.stringify(message, null, 2);
        }
        else {
            messageStr = String(message);
        }
        const options = {
            color,
            codec: codec ?? this.config.codec,
        };
        messageStr = this.executePlugins(messageStr, level, options, 'before');
        // Prepend scope if present
        const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;
        const formatted = this.formatter.format(scopedMessage, level, options);
        this.output.write(formatted, level, options.codec);
        this.executePlugins(messageStr, level, options, 'after');
    }
    /** Create a child logger that prefixes messages with a scope label and inherits config/plugins. */
    child(scope) {
        const child = new SpectralLogger(scope);
        // Inherit plugins (shallow copy reference is fine; plugins are usually stateless or singletons)
        for (const p of this.plugins)
            child.use(p);
        return child;
    }
    /** Log a general message. */
    log(message, color, codec) {
        this.writeLog(message, 'log', color, codec);
    }
    /** Log an informational message. */
    info(message, color, codec) {
        this.writeLog(message, 'info', color, codec);
    }
    /** Log a success message. */
    success(message, color, codec) {
        this.writeLog(message, 'success', color, codec);
    }
    /** Log a warning message. */
    warn(message, color, codec) {
        this.writeLog(message, 'warn', color, codec);
    }
    /** Log an error. Accepts `Error` objects for rich stack formatting. */
    error(message, color, codec) {
        this.writeLog(message, 'error', color, codec);
    }
    /** Log a debug message (emitted only when `debugMode` is enabled). */
    debug(message, color, codec) {
        this.writeLog(message, 'debug', color, codec);
    }
    /** Force-flush any buffered output to stdout/stderr. */
    flush() {
        this.output.forceFlush(this.config.codec);
    }
    /** Get the current, fully-resolved configuration. */
    getConfig() {
        return this.config.getConfig();
    }
    /** Get the internal error cache and counters (diagnostics). */
    getErrorStats() {
        return this.errorHandler.getErrorStats();
    }
    /** Clear the internal error cache. */
    clearErrorCache() {
        this.errorHandler.clearCache();
    }
}
exports.SpectralLogger = SpectralLogger;
//# sourceMappingURL=SpectralLogger.js.map