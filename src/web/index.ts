import { SpectralLoggerWeb } from './SpectralLoggerWeb.js';
export { SpectralLoggerWeb } from './SpectralLoggerWeb.js';
export { PerformanceTrackerWeb, type PerformanceStatsWeb } from './PerformanceTrackerWeb.js';
export type { LogLevel, LogOptionsWeb, SpectralConfigOptionsWeb, PluginWeb } from './types.js';

const logger = new SpectralLoggerWeb();
export default logger;
