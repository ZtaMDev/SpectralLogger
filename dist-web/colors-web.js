// Convierte ColorInput a una propiedad CSS válida para console %c
export function toCssColor(color) {
    if (!color)
        return undefined;
    // Acepta #hex, rgb(...), o nombres CSS
    return color;
}
export function styleFor(color) {
    const cssColor = toCssColor(color);
    return cssColor ? `color: ${cssColor}` : '';
}
//# sourceMappingURL=colors-web.js.map