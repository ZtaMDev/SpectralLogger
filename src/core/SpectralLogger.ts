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

  private writeQueue: Promise<void> = Promise.resolve();
  private writeLog(
    message: any,
    level: LogLevel,
    color?: string,
    codec?: BufferEncoding
  ): void {
    // capturamos los argumentos para la closure
    const captured = { message, level, color, codec };

    // encadenamos la tarea en la cola
    this.writeQueue = this.writeQueue.then(async () => {
      // Si es debug y debugMode está deshabilitado, nos salimos pronto
      if (captured.level === 'debug' && !this.config.debugMode) {
        return;
      }

      let messageStr: string;
      if (captured.message instanceof Error) {
        messageStr = this.errorHandler.handle(captured.message);
      } else if (typeof captured.message === 'object') {
        messageStr = JSON.stringify(captured.message, null, 2);
      } else {
        messageStr = String(captured.message);
      }

      const options: LogOptions = {
        color: captured.color,
        codec: captured.codec ?? this.config.codec,
      };

      // Ejecutar plugins 'before' (síncrono como ya tienes)
      messageStr = this.executePlugins(messageStr, captured.level, options, 'before');

      // Prepend scope if present
      const scopedMessage = this.scope ? `[${this.scope}] ${messageStr}` : messageStr;

      // Formatear (síncrono)
      const formatted = this.formatter.format(scopedMessage, captured.level, options);

      // Escribir en la capa de salida (que a su vez tiene sus propias colas)
      this.output.write(formatted, captured.level, options.codec);

      // Ejecutar plugins 'after'
      this.executePlugins(messageStr, captured.level, options, 'after');
    }).catch(err => {
      // No romper la cola en caso de error; lo informamos a stderr
      try {
        process.stderr.write(`[SpectralLogger] writeQueue error: ${err?.stack || err}\n`);
      } catch (_) {}
    });
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

  /** Force-flush any buffered output to stdout/stderr (retrocompatible, no bloqueante). */
  public flush(): void {
    // Llamada no bloqueante: dejamos que la promesa se ejecute en background.
    // Usamos `void` para dejar explícito que intencionalmente no esperamos el resultado.
    // Además encadenamos un catch para evitar rejections sin manejar.
    void this.output.forceFlush(this.config.codec).catch((err) => {
      try {
        // Reportamos el error al stderr para no silenciar errores de flush.
        process.stderr.write(`[SpectralLogger] flush error: ${err?.stack || err}\n`);
      } catch (_) {}
    });
  }

 /**
   * Awaitable flush — ensures it completes before continuing.
   * Use it in tests or during shutdown: `await logger.flushAsync()`.
 */
  public async flushAsync(): Promise<void> {
    await this.output.forceFlush(this.config.codec);
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
