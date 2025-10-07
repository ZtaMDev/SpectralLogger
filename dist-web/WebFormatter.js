import { styleFor } from './colors-web.js';
export class WebFormatter {
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
            const lvlText = level.toUpperCase().padEnd(7);
            parts.push('%c[' + lvlText + ']');
            styles.push(`color:${color};font-weight:600`);
        }
        const msgColor = options?.color ?? this.getLevelColor(level);
        parts.push('%c' + message);
        styles.push(styleFor(msgColor));
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
//# sourceMappingURL=WebFormatter.js.map