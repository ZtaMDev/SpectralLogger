import { Plugin, LogLevel, LogOptions } from '../types';
import { performance } from 'perf_hooks';

export interface PerformanceStats {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  averageTime: number;
  totalTime: number;
}

export class PerformanceTrackerPlugin implements Plugin {
  public name = 'PerformanceTracker';

  private stats: PerformanceStats = {
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

  private logStartTime?: number;

  public beforeLog(message: string, level: LogLevel, options?: LogOptions): string | void {
    this.logStartTime = performance.now();
    return message;
  }

  public afterLog(message: string, level: LogLevel, options?: LogOptions): void {
    if (this.logStartTime) {
      const endTime = performance.now();
      const duration = endTime - this.logStartTime;

      this.stats.totalLogs++;
      this.stats.logsByLevel[level]++;
      this.stats.totalTime += duration;
      this.stats.averageTime = this.stats.totalTime / this.stats.totalLogs;

      this.logStartTime = undefined;
    }
  }

  public getStats(): PerformanceStats {
    return { ...this.stats };
  }

  public reset(): void {
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

  public printStats(): void {
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
