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
    writeQueue = Promise.resolve();
    writeLog(message, level, color, codec) {
        // capturamos los argumentos para la closure
        const captured = { message, level, color, codec };
        // encadenamos la tarea en la cola
        this.writeQueue = this.writeQueue.then(async () => {
            // Si es debug y debugMode está deshabilitado, nos salimos pronto
            if (captured.level === 'debug' && !this.config.debugMode) {
                return;
            }
            let messageStr;
            if (captured.message instanceof Error) {
                messageStr = this.errorHandler.handle(captured.message);
            }
            else if (typeof captured.message === 'object') {
                messageStr = JSON.stringify(captured.message, null, 2);
            }
            else {
                messageStr = String(captured.message);
            }
            const options = {
                color: captured.color,
                codec: captured.codec ?? this.config.codec,
            };
            // Ejecutar plugins 'before' (síncrono como ya tienes)
            messageStr = this.executePlugins(messageStr, captured.level, options, 'before');
            // Prepend scope if present
            const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;
            // Formatear (síncrono)
            const formatted = this.formatter.format(scopedMessage, captured.level, options);
            // Escribir en la capa de salida (que a su vez tiene sus propias colas)
            this.output.write(formatted, captured.level, options.codec);
            // Ejecutar plugins 'after'
            this.executePlugins(messageStr, captured.level, options, 'after');
        }).catch(err => {
            // No romper la cola en caso de error; lo informamos a stderr
            try {
                process.stderr.write(`[SpectralLogger] writeQueue error: ${err?.stack || err}\n`);
            }
            catch (_) { }
        });
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
    /** Force-flush any buffered output to stdout/stderr (retrocompatible, no bloqueante). */
    flush() {
        // Llamada no bloqueante: dejamos que la promesa se ejecute en background.
        // Usamos `void` para dejar explícito que intencionalmente no esperamos el resultado.
        // Además encadenamos un catch para evitar rejections sin manejar.
        void this.output.forceFlush(this.config.codec).catch((err) => {
            try {
                // Reportamos el error al stderr para no silenciar errores de flush.
                process.stderr.write(`[SpectralLogger] flush error: ${err?.stack || err}\n`);
            }
            catch (_) { }
        });
    }
    /**
      * Awaitable flush — ensures it completes before continuing.
      * Use it in tests or during shutdown: `await logger.flushAsync()`.
    */
    async flushAsync() {
        await this.output.forceFlush(this.config.codec);
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