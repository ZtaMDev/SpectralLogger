import { LogLevel, LogOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
/**
 * Formats messages with timestamp, level, and colorization (ANSI) for Node.
 */
export declare class SpectralFormatter {
    private config;
    /**
     * @param config Global Spectral configuration used to determine colors and flags
     */
    constructor(config: SpectralConfig);
    /**
     * Build the final, colorized line to be written to the terminal.
     * @param message Plain message text (already stringified)
     * @param level Log level
     * @param options Per-call options (overrides)
     */
    format(message: string, level: LogLevel, options?: LogOptions): string;
    /**
     * Resolve the color associated with a given log level.
     */
    private getLevelColor;
    /**
     * Format an Error with name, message and a cleaned stack trace.
     */
    formatError(error: Error): string;
    /**
     * Remove noisy frames (e.g., node_modules) and normalize spacing.
     */
    private cleanStackTrace;
}
//# sourceMappingURL=SpectralFormatter.d.ts.map