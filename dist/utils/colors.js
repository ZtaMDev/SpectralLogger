"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESET = void 0;
exports.addCustomColor = addCustomColor;
exports.hasColor = hasColor;
exports.detectColorSupport = detectColorSupport;
exports.hexToRgb = hexToRgb;
exports.parseRgbString = parseRgbString;
exports.rgbToAnsi = rgbToAnsi;
exports.rgbToAnsi256 = rgbToAnsi256;
exports.parseColor = parseColor;
exports.colorize = colorize;
const DEFAULT_COLOR_NAMES = {
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0000ff',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    white: '#ffffff',
    gray: '#808080',
    grey: '#808080',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    brown: '#a52a2a',
    lime: '#00ff00',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
    maroon: '#800000',
};
// Mutable registry that starts with defaults and can be extended at runtime
const COLOR_REGISTRY = { ...DEFAULT_COLOR_NAMES };
/** Add or override a named color in the registry. */
function addCustomColor(name, color) {
    if (!name || !color)
        return;
    COLOR_REGISTRY[name.toLowerCase()] = color;
    // Invalidate cache for this color key and the resolved hex
    colorCache.delete(name);
    colorCache.delete(color);
}
/** Check if a color name exists in the registry. */
function hasColor(name) {
    return !!COLOR_REGISTRY[name.toLowerCase()];
}
let supportsTrueColor = null;
function detectColorSupport() {
    if (supportsTrueColor !== null)
        return supportsTrueColor;
    const { COLORTERM, TERM } = process.env;
    if (COLORTERM === 'truecolor' || COLORTERM === '24bit') {
        supportsTrueColor = true;
        return true;
    }
    if (TERM && (TERM.includes('256') || TERM.includes('color'))) {
        supportsTrueColor = true;
        return true;
    }
    supportsTrueColor = process.stdout.isTTY ?? false;
    return supportsTrueColor;
}
function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    if (normalized.length === 3) {
        const r = parseInt(normalized[0] + normalized[0], 16);
        const g = parseInt(normalized[1] + normalized[1], 16);
        const b = parseInt(normalized[2] + normalized[2], 16);
        return { r, g, b };
    }
    if (normalized.length === 6) {
        const r = parseInt(normalized.substring(0, 2), 16);
        const g = parseInt(normalized.substring(2, 4), 16);
        const b = parseInt(normalized.substring(4, 6), 16);
        return { r, g, b };
    }
    return null;
}
function parseRgbString(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match)
        return null;
    return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
    };
}
function rgbToAnsi(rgb) {
    return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
}
function rgbToAnsi256(rgb) {
    const r = Math.round((rgb.r / 255) * 5);
    const g = Math.round((rgb.g / 255) * 5);
    const b = Math.round((rgb.b / 255) * 5);
    const code = 16 + 36 * r + 6 * g + b;
    return `\x1b[38;5;${code}m`;
}
const colorCache = new Map();
function parseColor(color) {
    if (colorCache.has(color)) {
        return colorCache.get(color);
    }
    if (!detectColorSupport()) {
        colorCache.set(color, '');
        return '';
    }
    let rgb = null;
    if (color.startsWith('#')) {
        rgb = hexToRgb(color);
    }
    else if (color.startsWith('rgb(')) {
        rgb = parseRgbString(color);
    }
    else {
        const namedColor = COLOR_REGISTRY[color.toLowerCase()];
        if (namedColor) {
            rgb = hexToRgb(namedColor);
        }
    }
    if (!rgb) {
        colorCache.set(color, '');
        return '';
    }
    const ansiCode = supportsTrueColor ? rgbToAnsi(rgb) : rgbToAnsi256(rgb);
    colorCache.set(color, ansiCode);
    return ansiCode;
}
exports.RESET = '\x1b[0m';
function colorize(text, color) {
    const ansiCode = parseColor(color);
    if (!ansiCode)
        return text;
    return `${ansiCode}${text}${exports.RESET}`;
}
//# sourceMappingURL=colors.js.map