import { WebFormatter } from './WebFormatter.js';
import { WebOutput } from './WebOutput.js';
import { WebErrorHandler } from './WebError.js';
export class SpectralLoggerWeb {
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
    constructor(outputOptions = {}) {
        this.output = new WebOutput(outputOptions);
        this.formatter = new WebFormatter({
            showTimestamp: this.config.showTimestamp,
            showLevel: this.config.showLevel,
            colors: this.config.colors,
        });
        this.errorHandler = new WebErrorHandler(this.formatter);
    }
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
        this.formatter = new WebFormatter({
            showTimestamp: this.config.showTimestamp,
            showLevel: this.config.showLevel,
            colors: this.config.colors,
        });
        // ErrorHandler sigue usando el formatter actualizado por referencia
        this.errorHandler = new WebErrorHandler(this.formatter);
    }
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
        const before = this.executePlugins(messageStr, level, options, 'before');
        const formatted = this.formatter.format(before, level, options);
        this.output.writeConsoleArgs(formatted.args, level);
        this.executePlugins(before, level, options, 'after');
    }
    log(message, color) { this.writeLog(message, 'log', color); }
    info(message, color) { this.writeLog(message, 'info', color); }
    success(message, color) { this.writeLog(message, 'success', color); }
    warn(message, color) { this.writeLog(message, 'warn', color); }
    error(message, color) { this.writeLog(message, 'error', color); }
    debug(message, color) { this.writeLog(message, 'debug', color); }
    flush() { this.output.flush(); }
    getConfig() { return { ...this.config, colors: { ...this.config.colors } }; }
    getErrorStats() { return this.errorHandler.getErrorStats(); }
    clearErrorCache() { this.errorHandler.clearCache(); }
}
//# sourceMappingURL=SpectralLoggerWeb.js.map