import { Plugin, LogLevel, LogOptions } from '../types';
export interface PerformanceStats {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    averageTime: number;
    totalTime: number;
}
export declare class PerformanceTrackerPlugin implements Plugin {
    name: string;
    private stats;
    private logStartTime?;
    beforeLog(message: string, level: LogLevel, options?: LogOptions): string | void;
    afterLog(message: string, level: LogLevel, options?: LogOptions): void;
    getStats(): PerformanceStats;
    reset(): void;
    printStats(): void;
}
//# sourceMappingURL=PerformanceTracker.d.ts.map