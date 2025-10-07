"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebErrorHandler = void 0;
class WebErrorHandler {
    formatter;
    errorCache = new Map();
    maxCacheSize = 100;
    constructor(formatter) {
        this.formatter = formatter;
    }
    handle(error) {
        const key = `${error.name}:${error.message}`;
        const now = new Date();
        const entry = this.errorCache.get(key);
        if (entry) {
            entry.count++;
            entry.lastSeen = now;
        }
        else {
            if (this.errorCache.size >= this.maxCacheSize)
                this.clearOldest();
            this.errorCache.set(key, { error, count: 1, firstSeen: now, lastSeen: now });
        }
        const base = this.formatter.formatError(error);
        if (this.errorCache.get(key).count > 1) {
            const extra = [`%c(This error occurred ${this.errorCache.get(key).count} times)`, 'color:#ffaaaa'];
            return { args: [...base.args.concat(['\n' + extra[0], extra[1]])] };
        }
        return base;
    }
    getErrorStats() {
        return new Map(this.errorCache);
    }
    clearCache() {
        this.errorCache.clear();
    }
    clearOldest() {
        let oldestKey = null;
        let oldestDate = null;
        for (const [k, v] of this.errorCache.entries()) {
            if (!oldestDate || v.firstSeen < oldestDate) {
                oldestDate = v.firstSeen;
                oldestKey = k;
            }
        }
        if (oldestKey)
            this.errorCache.delete(oldestKey);
    }
}
exports.WebErrorHandler = WebErrorHandler;
//# sourceMappingURL=WebError.js.map