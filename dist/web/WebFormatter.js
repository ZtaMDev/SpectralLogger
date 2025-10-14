"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebFormatter = void 0;
const colors_web_js_1 = require("./colors-web.js");
class WebFormatter {
    config;
    colors = {
        info: '#00bfff',
        success: '#00ff88',
        warn: '#ffaa00',
        error: '#ff5555',
        log: '#dddddd',
        debug: '#cc66ff',
    };
    constructor(config) {
        this.config = config;
    }
    format(message, level, options) {
        const parts = [];
        const styles = [];
        const showTimestamp = options?.timestamp ?? this.config.showTimestamp;
        const showLevel = options?.level ?? this.config.showLevel;
        if (showTimestamp) {
            const now = new Date();
            const hh = now.getHours().toString().padStart(2, '0');
            const mm = now.getMinutes().toString().padStart(2, '0');
            const ss = now.getSeconds().toString().padStart(2, '0');
            parts.push('%c[' + `${hh}:${mm}:${ss}` + ']');
            styles.push('color:#888888');
        }
        if (showLevel) {
            const color = this.getLevelColor(level);
            const lvlText = level.toUpperCase();
            const padded = `[${lvlText}]`.padEnd(9);
            parts.push('%c' + padded);
            styles.push(`color:${color};font-weight:600`);
        }
        const msgColor = options?.color ?? this.getLevelColor(level);
        // Parse inline markers: <<c:COLOR>>text<</c>> to segmented %c parts
        const segments = [];
        const regex = /<<c:([^>]+)>>([\s\S]*?)<<\/c>>/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(message)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ text: message.slice(lastIndex, match.index) });
            }
            segments.push({ text: match[2], color: match[1] });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < message.length) {
            segments.push({ text: message.slice(lastIndex) });
        }
        if (segments.length === 0) {
            parts.push('%c' + message);
            styles.push((0, colors_web_js_1.styleFor)(msgColor));
        }
        else {
            for (const seg of segments) {
                parts.push('%c' + seg.text);
                styles.push((0, colors_web_js_1.styleFor)(seg.color ?? msgColor));
            }
        }
        return { args: [parts.join(' '), ...styles] };
    }
    formatError(error) {
        const color = this.config.colors.error;
        const parts = [];
        const styles = [];
        parts.push('%cError: ' + error.name);
        styles.push(`color:${color};font-weight:700`);
        parts.push('%cMessage: ' + error.message);
        styles.push(`color:${color}`);
        if (error.stack) {
            parts.push('%cStack Trace:');
            styles.push('color:#ff8888');
            parts.push('%c' + this.cleanStackTrace(error.stack));
            styles.push('color:#ffaaaa');
        }
        return { args: [parts.join('\n'), ...styles] };
    }
    getLevelColor(level) {
        return this.config.colors[level] || this.config.colors.log;
    }
    cleanStackTrace(stack) {
        return stack
            .split('\n')
            .map((l) => l.trim())
            .join('\n  ');
    }
}
exports.WebFormatter = WebFormatter;
//# sourceMappingURL=WebFormatter.js.map