import type { LogLevel, LogOptionsWeb, SpectralConfigOptionsWeb, PluginWeb } from './types.js';
import { WebFormatter } from './WebFormatter.js';
import { WebOutput } from './WebOutput.js';
import { WebErrorHandler } from './WebError.js';

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

  constructor(outputOptions: ConstructorParameters<typeof WebOutput>[0] = {}) {
    this.output = new WebOutput(outputOptions);
    this.formatter = new WebFormatter({
      showTimestamp: this.config.showTimestamp,
      showLevel: this.config.showLevel,
      colors: this.config.colors as any,
    });
    this.errorHandler = new WebErrorHandler(this.formatter);
  }

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
    const before = this.executePlugins(messageStr, level, options, 'before');
    const formatted = this.formatter.format(before, level, options);
    this.output.writeConsoleArgs(formatted.args, level);
    this.executePlugins(before, level, options, 'after');
  }

  public log(message: any, color?: string): void { this.writeLog(message, 'log', color); }
  public info(message: any, color?: string): void { this.writeLog(message, 'info', color); }
  public success(message: any, color?: string): void { this.writeLog(message, 'success', color); }
  public warn(message: any, color?: string): void { this.writeLog(message, 'warn', color); }
  public error(message: any, color?: string): void { this.writeLog(message, 'error', color); }
  public debug(message: any, color?: string): void { this.writeLog(message, 'debug', color); }

  public flush(): void { this.output.flush(); }

  public getConfig() { return { ...this.config, colors: { ...this.config.colors } }; }

  public getErrorStats() { return this.errorHandler.getErrorStats(); }
  public clearErrorCache() { this.errorHandler.clearCache(); }
}
