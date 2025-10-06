import { LogLevel, LogOptions } from '../types';
import { SpectralConfig } from './SpectralConfig';
export declare class SpectralFormatter {
    private config;
    constructor(config: SpectralConfig);
    format(message: string, level: LogLevel, options?: LogOptions): string;
    private getLevelColor;
    formatError(error: Error): string;
    private cleanStackTrace;
}
//# sourceMappingURL=SpectralFormatter.d.ts.map