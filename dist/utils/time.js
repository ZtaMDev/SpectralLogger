"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestamp = formatTimestamp;
exports.getShortTimestamp = getShortTimestamp;
function formatTimestamp(format = 'iso') {
    const now = new Date();
    switch (format) {
        case 'iso':
            return now.toISOString();
        case 'unix':
            return Math.floor(now.getTime() / 1000).toString();
        case 'locale':
            return now.toLocaleString();
        default:
            return now.toISOString();
    }
}
function getShortTimestamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
//# sourceMappingURL=time.js.map