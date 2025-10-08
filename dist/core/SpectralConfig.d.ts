import { SpectralConfigOptions } from '../types';
/**
 * Global configuration singleton for Spectral (Node build).
 */
export declare class SpectralConfig {
    private static instance;
    /** Default text encoding for stdout/stderr writes. */
    codec: BufferEncoding;
    /** Show short timestamp (HH:MM:SS) before each message. */
    showTimestamp: boolean;
    /** Show level label (e.g., [INFO]) before each message. */
    showLevel: boolean;
    /** Emit debug-level logs when enabled. */
    debugMode: boolean;
    /** Timestamp format used in some helpers. */
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
    /**
     * Access the global configuration instance.
     */
    static getInstance(): SpectralConfig;
    /**
     * Merge the provided partial options into the current configuration.
     */
    configure(options: SpectralConfigOptions): void;
    /** Reset all options to their defaults. */
    reset(): void;
    /** Get a full, frozen-like copy of the current configuration. */
    getConfig(): Required<SpectralConfigOptions>;
}
//# sourceMappingURL=SpectralConfig.d.ts.map