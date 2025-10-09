import type { LogLevel, LogOptionsWeb, SpectralConfigOptionsWeb, PluginWeb } from './types.js';
import { WebFormatter } from './WebFormatter.js';
import { WebOutput } from './WebOutput.js';
import { WebErrorHandler } from './WebError.js';
import { addCustomColorWeb } from './colors-web.js';

/**
 * High-performance, browser-friendly logger.
 *
 * Uses CSS-styled segments with `%c`, optional batching to reduce console overhead,
 * and supports pluggable hooks before/after each log call. Designed for use via
 * the `spectrallogs/web` subpath import.
 */
export class SpectralLoggerWeb {
  private config = {
    showTimestamp: true,
    showLevel: true,
    debugMode: false,
    timeFormat: 'iso' as 'iso' | 'unix' | 'locale',
    colors: {
      info: '#00bfff',
      success: '#00ff88',
      warn: '#ffaa00',
      error: '#ff5555',
      log: '#dddddd',
      debug: '#cc66ff',
    },
  };

  private output: WebOutput;
  private formatter: WebFormatter;
  private errorHandler: WebErrorHandler;
  private plugins: PluginWeb[] = [];
  private scope?: string;

  /**
   * Inline color helper usable in template strings. Returns a marker that the formatter
   * will transform into a separate `%c` segment so only that span is colored.
   * Example: `${spec.color('Title', 'accent')} details`.
   */
  public readonly color: ((text: string, colorNameOrCode: string) => string) & {
    add: (name: string, color: string) => void;
  };

  /**
   * Create a web logger.
   * @param outputOptions Configure batching and/or a custom sink (e.g., DOM appender)
   */
  constructor(outputOptions: ConstructorParameters<typeof WebOutput>[0] = {}, scope?: string) {
    this.output = new WebOutput(outputOptions);
    this.formatter = new WebFormatter({
      showTimestamp: this.config.showTimestamp,
      showLevel: this.config.showLevel,
      colors: this.config.colors as any,
    });
    this.errorHandler = new WebErrorHandler(this.formatter);
    this.scope = scope;

    const colorFn = (text: string, colorNameOrCode: string) => {
      const levelMap = this.config.colors as Record<string, string>;
      const resolved = levelMap[colorNameOrCode] || colorNameOrCode;
      // wrap with markers consumed by WebFormatter
      return `<<c:${resolved}>>${text}<</c>>`;
    };
    (colorFn as any).add = (name: string, color: string) => addCustomColorWeb(name, color);
    this.color = colorFn as any;
  }

  /**
   * Update runtime configuration (colors, timestamp/level visibility, debug mode, etc.).
   * @param options Partial configuration to merge with current settings
   */
  public configure(options: SpectralConfigOptionsWeb): void {
    if (options.showTimestamp !== undefined) this.config.showTimestamp = options.showTimestamp;
    if (options.showLevel !== undefined) this.config.showLevel = options.showLevel;
    if (options.debugMode !== undefined) this.config.debugMode = options.debugMode;
    if (options.timeFormat !== undefined) this.config.timeFormat = options.timeFormat;
    if (options.colors) this.config.colors = { ...this.config.colors, ...options.colors } as any;
    // Re-crear formatter con nueva config visible
    this.formatter = new WebFormatter({
      showTimestamp: this.config.showTimestamp,
      showLevel: this.config.showLevel,
      colors: this.config.colors as any,
    });
    // ErrorHandler sigue usando el formatter actualizado por referencia
    this.errorHandler = new WebErrorHandler(this.formatter);
  }

  /**
   * Register a plugin to execute hooks before/after each log.
   * @param plugin Plugin with optional `init`, `beforeLog`, and `afterLog`
   */
  public use(plugin: PluginWeb): void {
    this.plugins.push(plugin);
    if (plugin.init) plugin.init(this);
  }

  private executePlugins(message: string, level: LogLevel, options?: LogOptionsWeb, phase: 'before' | 'after' = 'before'): string {
    let processed = message;
    for (const p of this.plugins) {
      if (phase === 'before' && p.beforeLog) {
        const res = p.beforeLog(message, level, options);
        if (res !== undefined) processed = res;
      } else if (phase === 'after' && p.afterLog) {
        p.afterLog(message, level, options);
      }
    }
    return processed;
  }

  private writeLog(message: any, level: LogLevel, color?: string): void {
    if (level === 'debug' && !this.config.debugMode) return;

    let messageStr: string;
    if (message instanceof Error) {
      const formatted = this.errorHandler.handle(message);
      this.output.writeConsoleArgs(formatted.args, level);
      return;
    } else if (typeof message === 'object') {
      messageStr = JSON.stringify(message, null, 2);
    } else {
      messageStr = String(message);
    }

    const options: LogOptionsWeb = { color };
    let before = this.executePlugins(messageStr, level, options, 'before');
    if (this.scope) before = `[${this.scope}] ${before}`;
    const formatted = this.formatter.format(before, level, options);
    this.output.writeConsoleArgs(formatted.args, level);
    this.executePlugins(before, level, options, 'after');
  }

  /** Create a child logger that prefixes messages with a scope and inherits config/plugins/output. */
  public child(scope: string): SpectralLoggerWeb {
    const child = new SpectralLoggerWeb({}, scope);
    // Inherit config
    child.config = { ...this.config, colors: { ...this.config.colors } } as any;
    // Recreate formatter with copied config
    child.formatter = new WebFormatter({
      showTimestamp: child.config.showTimestamp,
      showLevel: child.config.showLevel,
      colors: child.config.colors as any,
    });
    // Share same output and error handler base
    child.output = this.output;
    child.errorHandler = new WebErrorHandler(child.formatter);
    // Copy plugins
    child.plugins = [...this.plugins];
    return child;
  }

  /** Log a general message. */
  public log(message: any, color?: string): void { this.writeLog(message, 'log', color); }
  /** Log an informational message. */
  public info(message: any, color?: string): void { this.writeLog(message, 'info', color); }
  /** Log a success message. */
  public success(message: any, color?: string): void { this.writeLog(message, 'success', color); }
  /** Log a warning message. */
  public warn(message: any, color?: string): void { this.writeLog(message, 'warn', color); }
  /** Log an error. Accepts `Error` objects for rich stack formatting. */
  public error(message: any, color?: string): void { this.writeLog(message, 'error', color); }
  /** Log a debug message (emitted only when `debugMode` is enabled). */
  public debug(message: any, color?: string): void { this.writeLog(message, 'debug', color); }

  /** Force-flush any buffered output. */
  public flush(): void { this.output.flush(); }

  /** Get current resolved configuration. */
  public getConfig() { return { ...this.config, colors: { ...this.config.colors } }; }

  /** Get error cache and counters. */
  public getErrorStats() { return this.errorHandler.getErrorStats(); }
  /** Clear the internal error cache. */
  public clearErrorCache() { this.errorHandler.clearCache(); }
}
