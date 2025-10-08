import type { LogLevel } from './types.js';

// Minimal structural types to avoid depending on DOM lib typings
type AnyMessagePort = {
  postMessage?: (value: any) => void;
  addEventListener?: (type: 'message', listener: () => void) => void;
  onmessage?: ((ev: any) => void) | null;
  start?: () => void;
};

type AnyMessageChannel = {
  port1: AnyMessagePort;
  port2: AnyMessagePort;
};

interface BatchItem { args: any[] }

type Sink = (args: any[]) => void;

/** Options to control WebOutput behavior. */
export interface WebOutputOptions {
  /** Enable message batching to reduce console overhead. */
  batching?: boolean;
  /** Max messages in buffer before a forced flush. */
  maxBatchSize?: number; // número de mensajes antes de flush
  /** Max latency before an automatic flush (in ms). */
  maxLatencyMs?: number; // tiempo máximo antes de flush
  /** Alternate sink for messages (e.g., append to DOM). */
  sink?: Sink; // destino alternativo
}

/**
 * Buffered output for browsers with optional batching.
 *
 * Default sink is `console.log`. You can provide a custom `sink` to send
 * messages to the DOM or elsewhere.
 */
export class WebOutput {
  private buffer: BatchItem[] = [];
  private options: Required<WebOutputOptions>;
  private scheduled = false;
  private channel?: AnyMessageChannel;

  /**
   * @param options Configure batching thresholds and custom sink
   */
  constructor(options: WebOutputOptions = {}) {
    this.options = {
      batching: options.batching ?? true,
      maxBatchSize: options.maxBatchSize ?? 16,
      maxLatencyMs: options.maxLatencyMs ?? 8,
      sink: options.sink ?? this.defaultSink,
    };

    if (this.options.batching && typeof MessageChannel !== 'undefined') {
      this.channel = new (MessageChannel as any)();
      if (this.channel && this.channel.port1) {
        if (this.channel.port1.addEventListener) {
          this.channel.port1.addEventListener('message', () => this.flush());
          this.channel.port1.start?.();
        } else if (typeof this.channel.port1.onmessage !== 'undefined') {
          this.channel.port1.onmessage = () => this.flush();
        }
      }
    }
  }

  /**
   * Queue or immediately write a pre-formatted set of console arguments.
   * @param args Arguments array suitable for `console.log(...args)`
   * @param _level Log level (currently unused for routing)
   */
  public writeConsoleArgs(args: any[], _level: LogLevel): void {
    if (!this.options.batching) {
      this.options.sink(args);
      return;
    }

    this.buffer.push({ args });
    if (this.buffer.length >= this.options.maxBatchSize) {
      this.scheduleFlush(true);
    } else {
      this.scheduleFlush(false);
    }
  }

  private scheduleFlush(immediate: boolean): void {
    if (immediate) {
      this.flush();
      return;
    }
    if (this.scheduled) return;
    this.scheduled = true;

    // Usa MessageChannel para microtask-like, y un timeout de seguridad
    this.channel?.port2.postMessage?.(null);
    setTimeout(() => this.flush(), this.options.maxLatencyMs);
  }

  /** Flush any buffered messages via the configured sink. */
  public flush(): void {
    if (!this.buffer.length) { this.scheduled = false; return; }
    const items = this.buffer;
    this.buffer = [];
    this.scheduled = false;

    // Combinar en una sola salida si el sink lo maneja; por defecto iteramos
    for (const it of items) {
      this.options.sink(it.args);
    }
  }

  private defaultSink = (args: any[]) => {
    // args ya incluye formato %c y estilos
    // eslint-disable-next-line no-console
    console.log.apply(console, args as any);
  };
}
