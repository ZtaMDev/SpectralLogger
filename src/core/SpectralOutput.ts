import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';

// Cache environment flags once at module load to avoid per-log lookups
const CACHED_NODE_ENV = process.env.NODE_ENV;
const IS_TEST_ENV = CACHED_NODE_ENV === 'test';

export class SpectralOutput {
  private buffer: string[] = [];
  private bufferSize: number = 10;
  private flushTimer: NodeJS.Timeout | null = null;
  private config: SpectralConfig;

  constructor(config: SpectralConfig) {
    this.config = config;
  }

  public write(message: string, level: LogLevel, codec: BufferEncoding = 'utf-8'): void {
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    const finalMessage = message.endsWith('\n') ? message : `${message}\n`;

    if (this.shouldBuffer()) {
      this.buffer.push(finalMessage);

      if (this.buffer.length >= this.bufferSize) {
        this.flush(stream, codec);
      } else {
        this.scheduleFlush(stream, codec);
      }
    } else {
      stream.write(finalMessage, codec);
    }
  }

  private shouldBuffer(): boolean {
    // Prefer explicit config; fallback to env-based default
    const resolved = this.config.getConfig().bufferWrites;
    return resolved;
  }

  private scheduleFlush(stream: NodeJS.WriteStream, codec: BufferEncoding): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush(stream, codec);
    }, 10);
  }

  private flush(stream: NodeJS.WriteStream, codec: BufferEncoding): void {
    if (this.buffer.length === 0) return;

    const content = this.buffer.join('');
    stream.write(content, codec);
    this.buffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  public forceFlush(codec: BufferEncoding = 'utf-8'): void {
    if (this.buffer.length > 0) {
      this.flush(process.stdout, codec);
    }
  }
}
