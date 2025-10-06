import { ColorInput } from '../types';
interface RGB {
    r: number;
    g: number;
    b: number;
}
export declare function detectColorSupport(): boolean;
export declare function hexToRgb(hex: string): RGB | null;
export declare function parseRgbString(rgb: string): RGB | null;
export declare function rgbToAnsi(rgb: RGB): string;
export declare function rgbToAnsi256(rgb: RGB): string;
export declare function parseColor(color: ColorInput): string;
export declare const RESET = "\u001B[0m";
export declare function colorize(text: string, color: ColorInput): string;
export {};
//# sourceMappingURL=colors.d.ts.map