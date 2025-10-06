"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralLogger = void 0;
const SpectralConfig_1 = require("./SpectralConfig");
const SpectralOutput_1 = require("./SpectralOutput");
const SpectralFormatter_1 = require("./SpectralFormatter");
const SpectralError_1 = require("./SpectralError");
class SpectralLogger {
    config;
    output;
    formatter;
    errorHandler;
    plugins = [];
    constructor() {
        this.config = SpectralConfig_1.SpectralConfig.getInstance();
        this.output = new SpectralOutput_1.SpectralOutput();
        this.formatter = new SpectralFormatter_1.SpectralFormatter(this.config);
        this.errorHandler = new SpectralError_1.SpectralError(this.formatter);
    }
    configure(options) {
        this.config.configure(options);
    }
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
        const formatted = this.formatter.format(messageStr, level, options);
        this.output.write(formatted, level, options.codec);
        this.executePlugins(messageStr, level, options, 'after');
    }
    log(message, color, codec) {
        this.writeLog(message, 'log', color, codec);
    }
    info(message, color, codec) {
        this.writeLog(message, 'info', color, codec);
    }
    success(message, color, codec) {
        this.writeLog(message, 'success', color, codec);
    }
    warn(message, color, codec) {
        this.writeLog(message, 'warn', color, codec);
    }
    error(message, color, codec) {
        this.writeLog(message, 'error', color, codec);
    }
    debug(message, color, codec) {
        this.writeLog(message, 'debug', color, codec);
    }
    flush() {
        this.output.forceFlush(this.config.codec);
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