import type { ColorInput } from './types.js';

// Default color names (CSS keywords or hex). Can be extended at runtime.
const DEFAULT_COLORS: Record<string, string> = {
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

const COLOR_REGISTRY: Record<string, string> = { ...DEFAULT_COLORS };

export function addCustomColorWeb(name: string, color: string) {
  if (!name || !color) return;
  COLOR_REGISTRY[name.toLowerCase()] = color;
}

// Convierte ColorInput a una propiedad CSS válida para console %c
export function toCssColor(color?: ColorInput): string | undefined {
  if (!color) return undefined;
  if (color.startsWith('#') || color.startsWith('rgb(')) return color;
  const named = COLOR_REGISTRY[color.toLowerCase()];
  return named || color; // fallback to provided token
}

export function styleFor(color?: ColorInput): string {
  const cssColor = toCssColor(color);
  return cssColor ? `color: ${cssColor}` : '';
}
