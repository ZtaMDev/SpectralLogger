"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralConfig = void 0;
class SpectralConfig {
    static instance;
    codec = 'utf-8';
    showTimestamp = true;
    showLevel = true;
    debugMode = false;
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
    static getInstance() {
        if (!SpectralConfig.instance) {
            SpectralConfig.instance = new SpectralConfig();
        }
        return SpectralConfig.instance;
    }
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