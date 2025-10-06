import { LogLevel, LogOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
import { colorize } from '../utils/colors';
import { getShortTimestamp } from '../utils/time';

export class SpectralFormatter {
  private config: SpectralConfig;

  constructor(config: SpectralConfig) {
    this.config = config;
  }

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
    const coloredMessage = colorize(message, messageColor);
    parts.push(coloredMessage);

    return parts.join(' ');
  }

  private getLevelColor(level: LogLevel): string {
    return this.config.colors[level] || this.config.colors.log;
  }

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

  private cleanStackTrace(stack: string): string {
    const lines = stack.split('\n');
    return lines
      .slice(1)
      .map(line => line.trim())
      .filter(line => !line.includes('node_modules'))
      .join('\n  ');
  }
}
