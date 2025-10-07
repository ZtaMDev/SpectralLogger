import type { ColorInput } from './types.js';

// Convierte ColorInput a una propiedad CSS válida para console %c
export function toCssColor(color?: ColorInput): string | undefined {
  if (!color) return undefined;
  // Acepta #hex, rgb(...), o nombres CSS
  return color;
}

export function styleFor(color?: ColorInput): string {
  const cssColor = toCssColor(color);
  return cssColor ? `color: ${cssColor}` : '';
}
