export class PerformanceTrackerWeb {
    name = 'PerformanceTrackerWeb';
    stats = {
        totalLogs: 0,
        logsByLevel: { log: 0, info: 0, success: 0, warn: 0, error: 0, debug: 0 },
        averageTime: 0,
        totalTime: 0,
    };
    start;
    beforeLog(message, level) {
        this.start = performance.now();
        return message;
    }
    afterLog(_message, level) {
        if (this.start != null) {
            const end = performance.now();
            const dur = end - this.start;
            this.stats.totalLogs++;
            this.stats.logsByLevel[level]++;
            this.stats.totalTime += dur;
            this.stats.averageTime = this.stats.totalTime / this.stats.totalLogs;
            this.start = undefined;
        }
    }
    getStats() { return { ...this.stats, logsByLevel: { ...this.stats.logsByLevel } }; }
    reset() {
        this.stats = { totalLogs: 0, logsByLevel: { log: 0, info: 0, success: 0, warn: 0, error: 0, debug: 0 }, averageTime: 0, totalTime: 0 };
    }
    printStats() {
        // eslint-disable-next-line no-console
        console.log('\n=== Performance Statistics (Web) ===');
        // eslint-disable-next-line no-console
        console.log(`Total Logs: ${this.stats.totalLogs}`);
        // eslint-disable-next-line no-console
        console.log(`Total Time: ${this.stats.totalTime.toFixed(2)}ms`);
        // eslint-disable-next-line no-console
        console.log(`Average Time: ${this.stats.averageTime.toFixed(4)}ms per log`);
    }
}
//# sourceMappingURL=PerformanceTrackerWeb.js.map