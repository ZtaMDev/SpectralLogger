import { SpectralConfigOptions } from '../types';

// Cache env once to avoid repeated lookups
const CACHED_NODE_ENV = process.env.NODE_ENV;

/**
 * Global configuration singleton for Spectral (Node build).
 */
export class SpectralConfig {
  private static instance: SpectralConfig;

  /** Default text encoding for stdout/stderr writes. */
  public codec: BufferEncoding = 'utf-8';
  /** Show short timestamp (HH:MM:SS) before each message. */
  public showTimestamp: boolean = true;
  /** Show level label (e.g., [INFO]) before each message. */
  public showLevel: boolean = true;
  /** Emit debug-level logs when enabled. */
  public debugMode: boolean = false;
  /** Timestamp format used in some helpers. */
  public timeFormat: 'iso' | 'unix' | 'locale' = 'iso';
  /** Override for buffering behavior. When undefined, falls back to env default. */
  public bufferWrites: boolean | undefined = undefined;
  /** Experimental: attempt async stack stitching in Node. */
  public asyncStacks: boolean = false;

  public colors = {
    info: '#00bfff',
    success: '#00ff88',
    warn: '#ffaa00',
    error: '#ff5555',
    log: '#dddddd',
    debug: '#cc66ff',
  };

  private constructor() {}

  /**
   * Access the global configuration instance.
   */
  public static getInstance(): SpectralConfig {
    if (!SpectralConfig.instance) {
      SpectralConfig.instance = new SpectralConfig();
    }
    return SpectralConfig.instance;
  }

  /**
   * Merge the provided partial options into the current configuration.
   */
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
    if (options.bufferWrites !== undefined) {
      this.bufferWrites = options.bufferWrites;
    }
    if (options.asyncStacks !== undefined) {
      this.asyncStacks = options.asyncStacks;
    }
    if (options.timeFormat !== undefined) {
      this.timeFormat = options.timeFormat;
    }
    if (options.colors) {
      this.colors = { ...this.colors, ...options.colors };
    }
  }

  /** Reset all options to their defaults. */
  public reset(): void {
    this.codec = 'utf-8';
    this.showTimestamp = true;
    this.showLevel = true;
    this.debugMode = false;
    this.timeFormat = 'iso';
    this.bufferWrites = undefined;
    this.asyncStacks = false;
    this.colors = {
      info: '#00bfff',
      success: '#00ff88',
      warn: '#ffaa00',
      error: '#ff5555',
      log: '#dddddd',
      debug: '#cc66ff',
    };
  }

  /** Get a full, frozen-like copy of the current configuration. */
  public getConfig(): Required<SpectralConfigOptions> {
    const resolvedBufferWrites = this.bufferWrites ?? (CACHED_NODE_ENV !== 'test');
    return {
      codec: this.codec,
      showTimestamp: this.showTimestamp,
      showLevel: this.showLevel,
      debugMode: this.debugMode,
      timeFormat: this.timeFormat,
      bufferWrites: resolvedBufferWrites,
      asyncStacks: this.asyncStacks,
      colors: { ...this.colors },
    };
  }
}
