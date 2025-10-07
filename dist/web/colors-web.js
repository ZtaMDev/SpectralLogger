"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCssColor = toCssColor;
exports.styleFor = styleFor;
// Convierte ColorInput a una propiedad CSS válida para console %c
function toCssColor(color) {
    if (!color)
        return undefined;
    // Acepta #hex, rgb(...), o nombres CSS
    return color;
}
function styleFor(color) {
    const cssColor = toCssColor(color);
    return cssColor ? `color: ${cssColor}` : '';
}
//# sourceMappingURL=colors-web.js.map