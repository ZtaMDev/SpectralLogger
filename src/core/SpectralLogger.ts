import { LogLevel, LogOptions, Plugin, SpectralConfigOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
import { SpectralOutput } from './SpectralOutput';
import { SpectralFormatter } from './SpectralFormatter';
import { SpectralError } from './SpectralError';
import { colorize, addCustomColor } from '../utils/colors';
import * as readline from 'readline';

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

  // Single queue for all operations to maintain strict order
  private globalQueue: Promise<void> = Promise.resolve();

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
   * Prompt the user for input and return the entered string.
   */
  public async input(
    message: string, 
    options?: LogOptions & { default?: string }
  ): Promise<string> {
    // Wait for all pending operations to complete
    await this.globalQueue;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const inputOptions: LogOptions = {
      timestamp: false,
      level: false,
      ...options
    };

    const formattedMessage = this.formatter.format(message, 'log', inputOptions);

    return new Promise((resolve) => {
      rl.question(formattedMessage, (answer) => {
        rl.close();
        resolve(answer.trim() || options?.default || '');
      });
    });
  }

  /**
   * Internal method that handles all logging with strict ordering
   */
  private async processLog(
    message: any,
    level: LogLevel,
    color?: string,
    codec?: BufferEncoding
  ): Promise<void> {
    // Skip debug messages if debug mode is disabled
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
      color: color,
      codec: codec ?? this.config.codec,
    };

    // Execute 'before' plugins
    messageStr = this.executePlugins(messageStr, level, options, 'before');

    // Prepend scope if present
    const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;

    // Format the message
    const formatted = this.formatter.format(scopedMessage, level, options);

    // Write to output (this is now synchronous within the queue)
    await this.output.write(formatted, level, options.codec);

    // Execute 'after' plugins
    this.executePlugins(messageStr, level, options, 'after');
  }

  /**
   * Public logging methods - all go through the global queue
   */

   /** Log a general message. */
  public log(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'log', color, codec);
  }

  /** Log an informational message. */
  public info(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'info', color, codec);
  }

  /** Log a success message. */
  public success(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'success', color, codec);
  }

   /** Log a warning message. */
  public warn(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'warn', color, codec);
  }

  /** Log an error. Accepts `Error` objects for rich stack formatting. */
  public error(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'error', color, codec);
  }

  /** Log a debug message (emitted only when `debugMode` is enabled). */
  public debug(message: any, color?: string, codec?: BufferEncoding): void {
    this.enqueueLog(message, 'debug', color, codec);
  }

  /**
   * Enqueue a log operation in the global queue
   */
  private enqueueLog(
    message: any,
    level: LogLevel,
    color?: string,
    codec?: BufferEncoding
  ): void {
    this.globalQueue = this.globalQueue
      .then(() => this.processLog(message, level, color, codec))
      .catch(err => {
        // Error handling without breaking the queue
        try {
          process.stderr.write(`[SpectralLogger] Error: ${err?.stack || err}\n`);
        } catch (_) {}
      });
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
  
  /** Create a child logger that prefixes messages with a scope label and inherits config/plugins. */
  public child(scope: string): SpectralLogger {
    const child = new SpectralLogger(scope);
    for (const p of this.plugins) child.use(p);
    return child;
  }

  public flush(): void {
    void this.flushAsync().catch((err) => {
      try {
        process.stderr.write(`[SpectralLogger] flush error: ${err?.stack || err}\n`);
      } catch (_) {}
    });
  }

  /**
   * Awaitable flush — ensures it completes before continuing.
   * Use it in tests or during shutdown: `await logger.flushAsync()`.
 */
  public async flushAsync(): Promise<void> {
    await this.globalQueue; // Wait for all pending logs
    await this.output.forceFlush(this.config.codec);
  }

  public getConfig(): Required<SpectralConfigOptions> {
    return this.config.getConfig();
  }

  public getErrorStats() {
    return this.errorHandler.getErrorStats();
  }

  public clearErrorCache(): void {
    this.errorHandler.clearCache();
  }
}