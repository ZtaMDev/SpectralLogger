"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralFormatter = void 0;
const colors_1 = require("../utils/colors");
const time_1 = require("../utils/time");
/**
 * Formats messages with timestamp, level, and colorization (ANSI) for Node.
 */
class SpectralFormatter {
    config;
    /**
     * @param config Global Spectral configuration used to determine colors and flags
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Build the final, colorized line to be written to the terminal.
     * @param message Plain message text (already stringified)
     * @param level Log level
     * @param options Per-call options (overrides)
     */
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
    /**
     * Resolve the color associated with a given log level.
     */
    getLevelColor(level) {
        return this.config.colors[level] || this.config.colors.log;
    }
    /**
     * Format an Error with name, message and a cleaned stack trace.
     */
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
    /**
     * Remove noisy frames (e.g., node_modules) and normalize spacing.
     */
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