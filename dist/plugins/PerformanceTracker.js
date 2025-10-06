"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTrackerPlugin = void 0;
const perf_hooks_1 = require("perf_hooks");
class PerformanceTrackerPlugin {
    name = 'PerformanceTracker';
    stats = {
        totalLogs: 0,
        logsByLevel: {
            log: 0,
            info: 0,
            success: 0,
            warn: 0,
            error: 0,
            debug: 0,
        },
        averageTime: 0,
        totalTime: 0,
    };
    logStartTime;
    beforeLog(message, level, options) {
        this.logStartTime = perf_hooks_1.performance.now();
        return message;
    }
    afterLog(message, level, options) {
        if (this.logStartTime) {
            const endTime = perf_hooks_1.performance.now();
            const duration = endTime - this.logStartTime;
            this.stats.totalLogs++;
            this.stats.logsByLevel[level]++;
            this.stats.totalTime += duration;
            this.stats.averageTime = this.stats.totalTime / this.stats.totalLogs;
            this.logStartTime = undefined;
        }
    }
    getStats() {
        return { ...this.stats };
    }
    reset() {
        this.stats = {
            totalLogs: 0,
            logsByLevel: {
                log: 0,
                info: 0,
                success: 0,
                warn: 0,
                error: 0,
                debug: 0,
            },
            averageTime: 0,
            totalTime: 0,
        };
    }
    printStats() {
        console.log('\n=== Performance Statistics ===');
        console.log(`Total Logs: ${this.stats.totalLogs}`);
        console.log(`Total Time: ${this.stats.totalTime.toFixed(2)}ms`);
        console.log(`Average Time: ${this.stats.averageTime.toFixed(4)}ms per log`);
        console.log('\nLogs by Level:');
        Object.entries(this.stats.logsByLevel).forEach(([level, count]) => {
            if (count > 0) {
                console.log(`  ${level}: ${count}`);
            }
        });
    }
}
exports.PerformanceTrackerPlugin = PerformanceTrackerPlugin;
//# sourceMappingURL=PerformanceTracker.js.map