import { SpectralLogger } from './core/SpectralLogger';
import type { LogLevel, ColorInput, SpectralConfigOptions, LogOptions, FormattedMessage, Plugin } from './types';

const spec = new SpectralLogger();

export default spec;

export { SpectralLogger } from './core/SpectralLogger';
export { SpectralConfig } from './core/SpectralConfig';
export { ErrorEntry } from './core/SpectralError';
export * from './plugins';
export type { LogLevel, ColorInput, SpectralConfigOptions, LogOptions, FormattedMessage, Plugin };
