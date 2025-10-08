"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralConfig = void 0;
/**
 * Global configuration singleton for Spectral (Node build).
 */
class SpectralConfig {
    static instance;
    /** Default text encoding for stdout/stderr writes. */
    codec = 'utf-8';
    /** Show short timestamp (HH:MM:SS) before each message. */
    showTimestamp = true;
    /** Show level label (e.g., [INFO]) before each message. */
    showLevel = true;
    /** Emit debug-level logs when enabled. */
    debugMode = false;
    /** Timestamp format used in some helpers. */
    timeFormat = 'iso';
    colors = {
        info: '#00bfff',
        success: '#00ff88',
        warn: '#ffaa00',
        error: '#ff5555',
        log: '#dddddd',
        debug: '#cc66ff',
    };
    constructor() { }
    /**
     * Access the global configuration instance.
     */
    static getInstance() {
        if (!SpectralConfig.instance) {
            SpectralConfig.instance = new SpectralConfig();
        }
        return SpectralConfig.instance;
    }
    /**
     * Merge the provided partial options into the current configuration.
     */
    configure(options) {
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
    /** Reset all options to their defaults. */
    reset() {
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
    /** Get a full, frozen-like copy of the current configuration. */
    getConfig() {
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
exports.SpectralConfig = SpectralConfig;
//# sourceMappingURL=SpectralConfig.js.map