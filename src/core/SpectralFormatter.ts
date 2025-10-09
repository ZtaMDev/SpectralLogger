import { LogLevel, LogOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
import { colorize, RESET, parseColor } from '../utils/colors';
import { getShortTimestamp } from '../utils/time';

/**
 * Formats messages with timestamp, level, and colorization (ANSI) for Node.
 */
export class SpectralFormatter {
  private config: SpectralConfig;

  /**
   * @param config Global Spectral configuration used to determine colors and flags
   */
  constructor(config: SpectralConfig) {
    this.config = config;
  }

  /**
   * Build the final, colorized line to be written to the terminal.
   * @param message Plain message text (already stringified)
   * @param level Log level
   * @param options Per-call options (overrides)
   */
  public format(
    message: string,
    level: LogLevel,
    options?: LogOptions
  ): string {
    const parts: string[] = [];

    const showTimestamp = options?.timestamp ?? this.config.showTimestamp;
    const showLevel = options?.level ?? this.config.showLevel;

    if (showTimestamp) {
      const timestamp = getShortTimestamp();
      parts.push(colorize(`[${timestamp}]`, '#888888'));
    }

    if (showLevel) {
      const levelColor = this.getLevelColor(level);
      const levelText = level.toUpperCase().padEnd(7);
      parts.push(colorize(`[${levelText}]`, levelColor));
    }

    const messageColor = options?.color ?? this.getLevelColor(level);
    // Compute outer ANSI and make inline RESETs re-apply outer color to avoid losing it
    const outerAnsi = parseColor(messageColor);
    if (outerAnsi) {
      const preserved = `${outerAnsi}${message.replaceAll(RESET, RESET + outerAnsi)}${RESET}`;
      parts.push(preserved);
    } else {
      parts.push(message);
    }

    return parts.join(' ');
  }

  /**
   * Resolve the color associated with a given log level.
   */
  private getLevelColor(level: LogLevel): string {
    return this.config.colors[level] || this.config.colors.log;
  }

  /**
   * Format an Error with name, message and a cleaned stack trace.
   */
  public formatError(error: Error): string {
    const errorColor = this.config.colors.error;
    const parts: string[] = [];

    parts.push(colorize(`Error: ${error.name}`, errorColor));
    parts.push(colorize(`Message: ${error.message}`, errorColor));

    if (error.stack) {
      const cleanStack = this.cleanStackTrace(error.stack);
      parts.push(colorize('Stack Trace:', '#ff8888'));
      parts.push(colorize(cleanStack, '#ffaaaa'));
    }

    return parts.join('\n');
  }

  /**
   * Remove noisy frames (e.g., node_modules) and normalize spacing.
   */
  private cleanStackTrace(stack: string): string {
    const lines = stack.split('\n');
    return lines
      .slice(1)
      .map(line => line.trim())
      .filter(line => !line.includes('node_modules'))
      .join('\n  ');
  }
}
