import { LogLevel, LogOptions, Plugin, SpectralConfigOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
import { SpectralOutput } from './SpectralOutput';
import { SpectralFormatter } from './SpectralFormatter';
import { SpectralError } from './SpectralError';
import { colorize, addCustomColor } from '../utils/colors';

/**
 * High-performance logger for Node.js environments.
 *
 * Provides colorized output, timestamps, levels, error formatting,
 * plugin hooks, and buffered stdout/stderr writes for speed.
 */
export class SpectralLogger {
  private config: SpectralConfig;
  private output: SpectralOutput;
  private formatter: SpectralFormatter;
  private errorHandler: SpectralError;
  private plugins: Plugin[] = [];
  private scope?: string;

  /**
   * Inline color helper usable in template strings.
   * Example: `spec.log(`${this.color('Title', 'warn')} details`)`
   * Also exposes `spec.color.add(name, color)` to register custom colors.
   */
  public readonly color: ((text: string, colorNameOrCode: string) => string) & {
    add: (name: string, color: string) => void;
  };

  /**
   * Create a new Spectral logger instance using the global configuration
   * (`SpectralConfig.getInstance()`).
   */
  constructor(scope?: string) {
    this.config = SpectralConfig.getInstance();
    this.output = new SpectralOutput(this.config);
    this.formatter = new SpectralFormatter(this.config);
    this.errorHandler = new SpectralError(this.formatter);
    this.scope = scope;

    // Bind color helper
    const colorFn = (text: string, colorNameOrCode: string) => {
      const cfg = this.config.getConfig();
      const levelMap = cfg.colors as Record<string, string>;
      const resolved = levelMap[colorNameOrCode] || colorNameOrCode;
      return colorize(text, resolved);
    };
    (colorFn as any).add = (name: string, color: string) => addCustomColor(name, color);
    this.color = colorFn as any;
  }

  /**
   * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
   * @param options Partial configuration to merge with current settings
   */
  public configure(options: SpectralConfigOptions): void {
    this.config.configure(options);
  }

  /**
   * Register a plugin to execute hooks before/after each log.
   * @param plugin Plugin implementation providing optional `init`, `beforeLog`, and `afterLog` hooks
   */
  public use(plugin: Plugin): void {
    this.plugins.push(plugin);
    if (plugin.init) {
      plugin.init(this);
    }
  }

  private executePlugins(
    message: string,
    level: LogLevel,
    options?: LogOptions,
    phase: 'before' | 'after' = 'before'
  ): string {
    let processedMessage = message;

    for (const plugin of this.plugins) {
      if (phase === 'before' && plugin.beforeLog) {
        const result = plugin.beforeLog(message, level, options);
        if (result !== undefined) {
          processedMessage = result;
        }
      } else if (phase === 'after' && plugin.afterLog) {
        plugin.afterLog(message, level, options);
      }
    }

    return processedMessage;
  }

  private writeLog(
    message: any,
    level: LogLevel,
    color?: string,
    codec?: BufferEncoding
  ): void {
    if (level === 'debug' && !this.config.debugMode) {
      return;
    }

    let messageStr: string;

    if (message instanceof Error) {
      messageStr = this.errorHandler.handle(message);
    } else if (typeof message === 'object') {
      messageStr = JSON.stringify(message, null, 2);
    } else {
      messageStr = String(message);
    }

    const options: LogOptions = {
      color,
      codec: codec ?? this.config.codec,
    };

    messageStr = this.executePlugins(messageStr, level, options, 'before');

    // Prepend scope if present
    const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;

    const formatted = this.formatter.format(scopedMessage, level, options);

    this.output.write(formatted, level, options.codec);

    this.executePlugins(messageStr, level, options, 'after');
  }

  /** Create a child logger that prefixes messages with a scope label and inherits config/plugins. */
  public child(scope: string): SpectralLogger {
    const child = new SpectralLogger(scope);
    // Inherit plugins (shallow copy reference is fine; plugins are usually stateless or singletons)
    for (const p of this.plugins) child.use(p);
    return child;
  }

  /** Log a general message. */
  public log(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'log', color, codec);
  }

  /** Log an informational message. */
  public info(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'info', color, codec);
  }

  /** Log a success message. */
  public success(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'success', color, codec);
  }

  /** Log a warning message. */
  public warn(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'warn', color, codec);
  }

  /** Log an error. Accepts `Error` objects for rich stack formatting. */
  public error(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'error', color, codec);
  }

  /** Log a debug message (emitted only when `debugMode` is enabled). */
  public debug(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'debug', color, codec);
  }

  /** Force-flush any buffered output to stdout/stderr. */
  public flush(): void {
    this.output.forceFlush(this.config.codec);
  }

  /** Get the current, fully-resolved configuration. */
  public getConfig(): Required<SpectralConfigOptions> {
    return this.config.getConfig();
  }

  /** Get the internal error cache and counters (diagnostics). */
  public getErrorStats() {
    return this.errorHandler.getErrorStats();
  }

  /** Clear the internal error cache. */
  public clearErrorCache(): void {
    this.errorHandler.clearCache();
  }
}
