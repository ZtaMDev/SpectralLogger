import { ColorInput } from '../types';

interface RGB {
  r: number;
  g: number;
  b: number;
}

const DEFAULT_COLOR_NAMES: Record<string, string> = {
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
const COLOR_REGISTRY: Record<string, string> = { ...DEFAULT_COLOR_NAMES };

/** Add or override a named color in the registry. */
export function addCustomColor(name: string, color: string): void {
  if (!name || !color) return;
  COLOR_REGISTRY[name.toLowerCase()] = color;
  // Invalidate cache for this color key and the resolved hex
  colorCache.delete(name);
  colorCache.delete(color);
}

/** Check if a color name exists in the registry. */
export function hasColor(name: string): boolean {
  return !!COLOR_REGISTRY[name.toLowerCase()];
}

let supportsTrueColor: boolean | null = null;

export function detectColorSupport(): boolean {
  if (supportsTrueColor !== null) return supportsTrueColor;

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

export function hexToRgb(hex: string): RGB | null {
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

export function parseRgbString(rgb: string): RGB | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

export function rgbToAnsi(rgb: RGB): string {
  return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
}

export function rgbToAnsi256(rgb: RGB): string {
  const r = Math.round((rgb.r / 255) * 5);
  const g = Math.round((rgb.g / 255) * 5);
  const b = Math.round((rgb.b / 255) * 5);
  const code = 16 + 36 * r + 6 * g + b;
  return `\x1b[38;5;${code}m`;
}

const colorCache = new Map<string, string>();

export function parseColor(color: ColorInput): string {
  if (colorCache.has(color)) {
    return colorCache.get(color)!;
  }

  if (!detectColorSupport()) {
    colorCache.set(color, '');
    return '';
  }

  let rgb: RGB | null = null;

  if (color.startsWith('#')) {
    rgb = hexToRgb(color);
  } else if (color.startsWith('rgb(')) {
    rgb = parseRgbString(color);
  } else {
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

export const RESET = '\x1b[0m';

export function colorize(text: string, color: ColorInput): string {
  const ansiCode = parseColor(color);
  if (!ansiCode) return text;
  return `${ansiCode}${text}${RESET}`;
}
