import { SpectralFormatter } from './SpectralFormatter';

export interface ErrorEntry {
  error: Error;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export class SpectralError {
  private formatter: SpectralFormatter;
  private errorCache: Map<string, ErrorEntry> = new Map();
  private maxCacheSize: number = 100;

  constructor(formatter: SpectralFormatter) {
    this.formatter = formatter;
  }

  public handle(error: Error): string {
    const errorKey = this.getErrorKey(error);
    const now = new Date();

    if (this.errorCache.has(errorKey)) {
      const entry = this.errorCache.get(errorKey)!;
      entry.count++;
      entry.lastSeen = now;

      if (entry.count > 1) {
        return this.formatter.formatError(error) +
               `\n(This error occurred ${entry.count} times)`;
      }
    } else {
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

  private getErrorKey(error: Error): string {
    return `${error.name}:${error.message}`;
  }

  private clearOldestError(): void {
    let oldestKey: string | null = null;
    let oldestDate: Date | null = null;

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

  public getErrorStats(): Map<string, ErrorEntry> {
    return new Map(this.errorCache);
  }

  public clearCache(): void {
    this.errorCache.clear();
  }
}
