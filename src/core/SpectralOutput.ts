import { LogLevel } from '../types';

export class SpectralOutput {
  private buffer: string[] = [];
  private bufferSize: number = 10;
  private flushTimer: NodeJS.Timeout | null = null;

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
    return process.env.NODE_ENV !== 'test';
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
