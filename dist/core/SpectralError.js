"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralError = void 0;
class SpectralError {
    formatter;
    errorCache = new Map();
    maxCacheSize = 100;
    constructor(formatter) {
        this.formatter = formatter;
    }
    handle(error) {
        const errorKey = this.getErrorKey(error);
        const now = new Date();
        if (this.errorCache.has(errorKey)) {
            const entry = this.errorCache.get(errorKey);
            entry.count++;
            entry.lastSeen = now;
            if (entry.count > 1) {
                return this.formatter.formatError(error) +
                    `\n(This error occurred ${entry.count} times)`;
            }
        }
        else {
            if (this.errorCache.size >= this.maxCacheSize) {
                this.clearOldestError();
            }
            this.errorCache.set(errorKey, {
                error,
                count: 1,
                firstSeen: now,
                lastSeen: now,
            });
        }
        return this.formatter.formatError(error);
    }
    getErrorKey(error) {
        return `${error.name}:${error.message}`;
    }
    clearOldestError() {
        let oldestKey = null;
        let oldestDate = null;
        for (const [key, entry] of this.errorCache.entries()) {
            if (!oldestDate || entry.firstSeen < oldestDate) {
                oldestDate = entry.firstSeen;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.errorCache.delete(oldestKey);
        }
    }
    getErrorStats() {
        return new Map(this.errorCache);
    }
    clearCache() {
        this.errorCache.clear();
    }
}
exports.SpectralError = SpectralError;
//# sourceMappingURL=SpectralError.js.map