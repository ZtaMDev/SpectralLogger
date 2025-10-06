import { LogLevel, LogOptions, Plugin, SpectralConfigOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
import { SpectralOutput } from './SpectralOutput';
import { SpectralFormatter } from './SpectralFormatter';
import { SpectralError } from './SpectralError';

export class SpectralLogger {
  private config: SpectralConfig;
  private output: SpectralOutput;
  private formatter: SpectralFormatter;
  private errorHandler: SpectralError;
  private plugins: Plugin[] = [];

  constructor() {
    this.config = SpectralConfig.getInstance();
    this.output = new SpectralOutput();
    this.formatter = new SpectralFormatter(this.config);
    this.errorHandler = new SpectralError(this.formatter);
  }

  public configure(options: SpectralConfigOptions): void {
    this.config.configure(options);
  }

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

    const formatted = this.formatter.format(messageStr, level, options);

    this.output.write(formatted, level, options.codec);

    this.executePlugins(messageStr, level, options, 'after');
  }

  public log(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'log', color, codec);
  }

  public info(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'info', color, codec);
  }

  public success(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'success', color, codec);
  }

  public warn(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'warn', color, codec);
  }

  public error(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'error', color, codec);
  }

  public debug(message: any, color?: string, codec?: BufferEncoding): void {
    this.writeLog(message, 'debug', color, codec);
  }

  public flush(): void {
    this.output.forceFlush(this.config.codec);
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
