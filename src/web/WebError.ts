import { WebFormatter } from './WebFormatter.js';

export interface ErrorEntryWeb {
  error: Error;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export class WebErrorHandler {
  private errorCache: Map<string, ErrorEntryWeb> = new Map();
  private maxCacheSize = 100;

  constructor(private formatter: WebFormatter) {}

  handle(error: Error): { args: any[] } {
    const key = `${error.name}:${error.message}`;
    const now = new Date();

    const entry = this.errorCache.get(key);
    if (entry) {
      entry.count++;
      entry.lastSeen = now;
    } else {
      if (this.errorCache.size >= this.maxCacheSize) this.clearOldest();
      this.errorCache.set(key, { error, count: 1, firstSeen: now, lastSeen: now });
    }

    const base = this.formatter.formatError(error);
    if (this.errorCache.get(key)!.count > 1) {
      const extra = [`%c(This error occurred ${this.errorCache.get(key)!.count} times)`, 'color:#ffaaaa'];
      return { args: [ ...(base.args as any[]).concat(['\n' + extra[0], extra[1]]) ] };
    }
    return base;
  }

  getErrorStats(): Map<string, ErrorEntryWeb> {
    return new Map(this.errorCache);
  }

  clearCache(): void {
    this.errorCache.clear();
  }

  private clearOldest(): void {
    let oldestKey: string | null = null;
    let oldestDate: Date | null = null;
    for (const [k, v] of this.errorCache.entries()) {
      if (!oldestDate || v.firstSeen < oldestDate) {
        oldestDate = v.firstSeen;
        oldestKey = k;
      }
    }
    if (oldestKey) this.errorCache.delete(oldestKey);
  }
}
