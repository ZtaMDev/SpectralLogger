// types.d.ts
export type LogLevel = 'log' | 'info' | 'success' | 'warn' | 'error' | 'debug';

export type ColorInput = string;

export interface SpectralConfigOptions {
  codec?: BufferEncoding;
  showTimestamp?: boolean;
  showLevel?: boolean;
  debugMode?: boolean;
  /** Enable buffered writes to stdout/stderr (Node). Default: true, but disabled in NODE_ENV=test */
  bufferWrites?: boolean;
  /** Experimental: attempt async stack stitching in Node (no-op in Web). Default: false. */
  asyncStacks?: boolean;
  colors?: {
    info?: string;
    success?: string;
    warn?: string;
    error?: string;
    log?: string;
    debug?: string;
  };
  timeFormat?: 'iso' | 'unix' | 'locale';
}

export interface LogOptions {
  color?: ColorInput;
  codec?: BufferEncoding;
  timestamp?: boolean;
  level?: boolean;
  context?: LoggerContext;
}

export interface FormattedMessage {
  text: string;
  ansiCode: string;
}

export interface LoggerContext {
  [key: string]: any;
}

export interface Plugin {
  name: string;
  init?: (logger: any) => void;
  beforeLog?: (message: string, level: LogLevel, options?: LogOptions) => string | void;
  afterLog?: (message: string, level: LogLevel, options?: LogOptions) => void;
}