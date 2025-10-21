"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralLogger = void 0;
const SpectralConfig_1 = require("./SpectralConfig");
const SpectralOutput_1 = require("./SpectralOutput");
const SpectralFormatter_1 = require("./SpectralFormatter");
const SpectralError_1 = require("./SpectralError");
const colors_1 = require("../utils/colors");
const readline = __importStar(require("readline"));
const FileLogger_1 = require("../plugins/FileLogger");
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
    // Single queue for all operations to maintain strict order
    globalQueue = Promise.resolve();
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
     * Prompt the user for input and return the entered string.
     */
    async input(message, options) {
        // Wait for all pending operations to complete
        await this.globalQueue;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const inputOptions = {
            timestamp: false,
            level: false,
            ...options
        };
        const formattedMessage = this.formatter.format(message, 'log', inputOptions);
        return new Promise((resolve) => {
            rl.question(formattedMessage, (answer) => {
                rl.close();
                resolve(answer.trim() || options?.default || '');
            });
        });
    }
    /**
     * Internal method that handles all logging with strict ordering
     */
    async processLog(message, level, color, codec) {
        // Skip debug messages if debug mode is disabled
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
            color: color,
            codec: codec ?? this.config.codec,
        };
        // Execute 'before' plugins
        messageStr = this.executePlugins(messageStr, level, options, 'before');
        // Prepend scope if present
        const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;
        // Format the message
        const formatted = this.formatter.format(scopedMessage, level, options);
        // Write to output (this is now synchronous within the queue)
        await this.output.write(formatted, level, options.codec);
        // Execute 'after' plugins
        this.executePlugins(messageStr, level, options, 'after');
    }
    /**
     * Public logging methods - all go through the global queue
     */
    /** Log a general message. */
    log(message, color, codec) {
        this.enqueueLog(message, 'log', color, codec);
    }
    /** Log an informational message. */
    info(message, color, codec) {
        this.enqueueLog(message, 'info', color, codec);
    }
    /** Log a success message. */
    success(message, color, codec) {
        this.enqueueLog(message, 'success', color, codec);
    }
    /** Log a warning message. */
    warn(message, color, codec) {
        this.enqueueLog(message, 'warn', color, codec);
    }
    /** Log an error. Accepts `Error` objects for rich stack formatting. */
    error(message, color, codec) {
        this.enqueueLog(message, 'error', color, codec);
    }
    /** Log a debug message (emitted only when `debugMode` is enabled). */
    debug(message, color, codec) {
        this.enqueueLog(message, 'debug', color, codec);
    }
    /**
     * Enqueue a log operation in the global queue
     */
    enqueueLog(message, level, color, codec) {
        this.globalQueue = this.globalQueue
            .then(() => this.processLog(message, level, color, codec))
            .catch(err => {
            // Error handling without breaking the queue
            try {
                process.stderr.write(`[SpectralLogger] Error: ${err?.stack || err}\n`);
            }
            catch (_) { }
        });
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
        // Verificar si ya existe un plugin con el mismo nombre
        const existingIndex = this.plugins.findIndex(p => p.name === plugin.name);
        if (existingIndex >= 0) {
            // Reemplazar el plugin existente
            this.plugins[existingIndex] = plugin;
        }
        else {
            // Agregar nuevo plugin
            this.plugins.push(plugin);
        }
        if (plugin.init) {
            plugin.init(this);
        }
    }
    /**
     * Remove a plugin by name
     */
    removePlugin(pluginName) {
        const index = this.plugins.findIndex(p => p.name === pluginName);
        if (index >= 0) {
            this.plugins.splice(index, 1);
        }
    }
    /**
     * Get all current plugins
     */
    getPlugins() {
        return [...this.plugins];
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
    /**
     * Create a child logger that prefixes messages with a scope label.
     * Por defecto NO hereda los plugins del parent.
     */
    child(scope, inheritPlugins = false) {
        const child = new SpectralLogger(scope);
        if (inheritPlugins) {
            // Solo copiar los plugins si se solicita explícitamente
            for (const plugin of this.plugins) {
                // Para FileLoggerPlugin, crear una instancia específica para el child
                if (plugin instanceof FileLogger_1.FileLoggerPlugin) {
                    const fileLoggerPlugin = plugin;
                    child.use(fileLoggerPlugin.createForChild(scope));
                }
                else {
                    // Para otros plugins, copiar la referencia (puede necesitar ajustes según el plugin)
                    child.use(plugin);
                }
            }
        }
        return child;
    }
    flush() {
        void this.flushAsync().catch((err) => {
            try {
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
        await this.globalQueue; // Wait for all pending logs
        await this.output.forceFlush(this.config.codec);
    }
    getConfig() {
        return this.config.getConfig();
    }
    getErrorStats() {
        return this.errorHandler.getErrorStats();
    }
    clearErrorCache() {
        this.errorHandler.clearCache();
    }
}
exports.SpectralLogger = SpectralLogger;
//# sourceMappingURL=SpectralLogger.js.map