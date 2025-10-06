import { SpectralConfigOptions } from '../types';
export declare class SpectralConfig {
    private static instance;
    codec: BufferEncoding;
    showTimestamp: boolean;
    showLevel: boolean;
    debugMode: boolean;
    timeFormat: 'iso' | 'unix' | 'locale';
    colors: {
        info: string;
        success: string;
        warn: string;
        error: string;
        log: string;
        debug: string;
    };
    private constructor();
    static getInstance(): SpectralConfig;
    configure(options: SpectralConfigOptions): void;
    reset(): void;
    getConfig(): Required<SpectralConfigOptions>;
}
//# sourceMappingURL=SpectralConfig.d.ts.map