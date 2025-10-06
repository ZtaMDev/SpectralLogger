"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralFormatter = void 0;
const colors_1 = require("../utils/colors");
const time_1 = require("../utils/time");
class SpectralFormatter {
    config;
    constructor(config) {
        this.config = config;
    }
    format(message, level, options) {
        const parts = [];
        const showTimestamp = options?.timestamp ?? this.config.showTimestamp;
        const showLevel = options?.level ?? this.config.showLevel;
        if (showTimestamp) {
            const timestamp = (0, time_1.getShortTimestamp)();
            parts.push((0, colors_1.colorize)(`[${timestamp}]`, '#888888'));
        }
        if (showLevel) {
            const levelColor = this.getLevelColor(level);
            const levelText = level.toUpperCase().padEnd(7);
            parts.push((0, colors_1.colorize)(`[${levelText}]`, levelColor));
        }
        const messageColor = options?.color ?? this.getLevelColor(level);
        const coloredMessage = (0, colors_1.colorize)(message, messageColor);
        parts.push(coloredMessage);
        return parts.join(' ');
    }
    getLevelColor(level) {
        return this.config.colors[level] || this.config.colors.log;
    }
    formatError(error) {
        const errorColor = this.config.colors.error;
        const parts = [];
        parts.push((0, colors_1.colorize)(`Error: ${error.name}`, errorColor));
        parts.push((0, colors_1.colorize)(`Message: ${error.message}`, errorColor));
        if (error.stack) {
            const cleanStack = this.cleanStackTrace(error.stack);
            parts.push((0, colors_1.colorize)('Stack Trace:', '#ff8888'));
            parts.push((0, colors_1.colorize)(cleanStack, '#ffaaaa'));
        }
        return parts.join('\n');
    }
    cleanStackTrace(stack) {
        const lines = stack.split('\n');
        return lines
            .slice(1)
            .map(line => line.trim())
            .filter(line => !line.includes('node_modules'))
            .join('\n  ');
    }
}
exports.SpectralFormatter = SpectralFormatter;
//# sourceMappingURL=SpectralFormatter.js.map