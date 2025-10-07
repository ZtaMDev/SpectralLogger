import type { LogLevel } from './types.js';

export interface PerformanceStatsWeb {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  averageTime: number;
  totalTime: number;
}

export class PerformanceTrackerWeb {
  public name = 'PerformanceTrackerWeb';
  private stats: PerformanceStatsWeb = {
    totalLogs: 0,
    logsByLevel: { log: 0, info: 0, success: 0, warn: 0, error: 0, debug: 0 },
    averageTime: 0,
    totalTime: 0,
  };
  private start?: number;

  public beforeLog(message: string, level: LogLevel): string | void {
    this.start = performance.now();
    return message;
  }

  public afterLog(_message: string, level: LogLevel): void {
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

  public getStats(): PerformanceStatsWeb { return { ...this.stats, logsByLevel: { ...this.stats.logsByLevel } }; }
  public reset(): void {
    this.stats = { totalLogs: 0, logsByLevel: { log: 0, info: 0, success: 0, warn: 0, error: 0, debug: 0 }, averageTime: 0, totalTime: 0 };
  }
  public printStats(): void {
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
