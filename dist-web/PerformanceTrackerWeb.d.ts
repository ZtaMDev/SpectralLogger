import type { LogLevel } from './types.js';
export interface PerformanceStatsWeb {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    averageTime: number;
    totalTime: number;
}
export declare class PerformanceTrackerWeb {
    name: string;
    private stats;
    private start?;
    beforeLog(message: string, level: LogLevel): string | void;
    afterLog(_message: string, level: LogLevel): void;
    getStats(): PerformanceStatsWeb;
    reset(): void;
    printStats(): void;
}
//# sourceMappingURL=PerformanceTrackerWeb.d.ts.map