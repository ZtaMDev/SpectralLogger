import { SpectralConfigOptions } from '../types';

export class SpectralConfig {
  private static instance: SpectralConfig;

  public codec: BufferEncoding = 'utf-8';
  public showTimestamp: boolean = true;
  public showLevel: boolean = true;
  public debugMode: boolean = false;
  public timeFormat: 'iso' | 'unix' | 'locale' = 'iso';

  public colors = {
    info: '#00bfff',
    success: '#00ff88',
    warn: '#ffaa00',
    error: '#ff5555',
    log: '#dddddd',
    debug: '#cc66ff',
  };

  private constructor() {}

  public static getInstance(): SpectralConfig {
    if (!SpectralConfig.instance) {
      SpectralConfig.instance = new SpectralConfig();
    }
    return SpectralConfig.instance;
  }

  public configure(options: SpectralConfigOptions): void {
    if (options.codec !== undefined) {
      this.codec = options.codec;
    }
    if (options.showTimestamp !== undefined) {
      this.showTimestamp = options.showTimestamp;
    }
    if (options.showLevel !== undefined) {
      this.showLevel = options.showLevel;
    }
    if (options.debugMode !== undefined) {
      this.debugMode = options.debugMode;
    }
    if (options.timeFormat !== undefined) {
      this.timeFormat = options.timeFormat;
    }
    if (options.colors) {
      this.colors = { ...this.colors, ...options.colors };
    }
  }

  public reset(): void {
    this.codec = 'utf-8';
    this.showTimestamp = true;
    this.showLevel = true;
    this.debugMode = false;
    this.timeFormat = 'iso';
    this.colors = {
      info: '#00bfff',
      success: '#00ff88',
      warn: '#ffaa00',
      error: '#ff5555',
      log: '#dddddd',
      debug: '#cc66ff',
    };
  }

  public getConfig(): Required<SpectralConfigOptions> {
    return {
      codec: this.codec,
      showTimestamp: this.showTimestamp,
      showLevel: this.showLevel,
      debugMode: this.debugMode,
      timeFormat: this.timeFormat,
      colors: { ...this.colors },
    };
  }
}
