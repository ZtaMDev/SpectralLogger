export type LogLevel = 'log' | 'info' | 'success' | 'warn' | 'error' | 'debug';

export type ColorInput = string;

export interface SpectralConfigOptionsWeb {
  showTimestamp?: boolean;
  showLevel?: boolean;
  debugMode?: boolean;
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

export interface LogOptionsWeb {
  color?: ColorInput;
  timestamp?: boolean;
  level?: boolean;
}

export interface PluginWeb {
  name: string;
  init?: (logger: any) => void;
  beforeLog?: (message: string, level: LogLevel, options?: LogOptionsWeb) => string | void;
  afterLog?: (message: string, level: LogLevel, options?: LogOptionsWeb) => void;
}
