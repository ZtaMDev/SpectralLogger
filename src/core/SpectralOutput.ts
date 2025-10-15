import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';

const CACHED_NODE_ENV = process.env.NODE_ENV;
const IS_TEST_ENV = CACHED_NODE_ENV === 'test';

/**
 * Thread-safe SpectralOutput.
 * - Colas separadas por stream (stdout / stderr)
 * - Buffers con flush adaptativo
 * - safeWrite que espera el callback del stream
 * - forceFlush awaitable
 * - Manejo de errores aislado (no rompe la cola)
 */
export class SpectralOutput {
  private stdoutQueue: Promise<void> = Promise.resolve();
  private stderrQueue: Promise<void> = Promise.resolve();

  private stdoutBuffer: string[] = [];
  private stderrBuffer: string[] = [];

  private bufferSize = 10;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  private config: SpectralConfig;

  constructor(config: SpectralConfig) {
    this.config = config;

    // Aseguramos flush final al salir del proceso para no perder logs.
    if (!IS_TEST_ENV) {
      process.once('beforeExit', () => {
        // fire-and-forget: no queremos bloquear shutdown excesivamente,
        // pero intentaremos vaciar buffers sin lanzar errores.
        this.forceFlush().catch(() => {});
      });
    }
  }

  /** Encola el mensaje en la secuencia segura según el nivel. */
  public write(message: string, level: LogLevel, codec: BufferEncoding = 'utf-8'): void {
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    const queueKey = stream === process.stderr ? 'stderrQueue' : 'stdoutQueue';
    const bufferKey = stream === process.stderr ? 'stderrBuffer' : 'stdoutBuffer';

    const finalMessage = message.endsWith('\n') ? message : `${message}\n`;

    // Encadenar operaciones en la cola correspondiente
    (this as any)[queueKey] = (this as any)[queueKey]
      .then(async () => {
        try {
          if (this.shouldBuffer()) {
            (this as any)[bufferKey].push(finalMessage);

            // si el buffer está lleno hacemos flush inmediatamente
            if ((this as any)[bufferKey].length >= this.bufferSize) {
              await this.flushStream(stream, codec, bufferKey);
            } else {
              this.scheduleFlush(stream, codec, bufferKey);
            }
          } else {
            await this.safeWrite(stream, finalMessage, codec);
          }
        } catch (err: any) {
          // No romper la cola; escribir error al stderr de forma síncrona segura
          try {
            process.stderr.write(`[SpectralOutput] write error: ${err?.stack || err}\n`);
          } catch (_) {
            // swallow
          }
        }
      })
      .catch((err: { stack: any; }) => {
        // Nunca dejar que una excepción rompa la cadena de promesas.
        try {
          process.stderr.write(`[SpectralOutput] queue error: ${err?.stack || err}\n`);
        } catch (_) {}
      });
  }

  private shouldBuffer(): boolean {
    return !!this.config.getConfig().bufferWrites;
  }

  private scheduleFlush(stream: NodeJS.WriteStream, codec: BufferEncoding, bufferKey: string): void {
    if (this.flushTimer) return;

    const size = (this as any)[bufferKey].length || 0;
    const delay = this.adaptiveDelay(size);
    this.flushTimer = setTimeout(() => {
      // Programamos el flush en la cola correspondiente
      const queueKey = stream === process.stderr ? 'stderrQueue' : 'stdoutQueue';
      (this as any)[queueKey] = (this as any)[queueKey].then(() => this.safeFlushQueue(stream, codec, bufferKey));
    }, delay);
  }

  private adaptiveDelay(size: number): number {
    if (size >= this.bufferSize) return 1;
    if (size > this.bufferSize * 0.6) return 3;
    if (size > this.bufferSize * 0.3) return 6;
    return 10;
  }

  private async safeWrite(stream: NodeJS.WriteStream, data: string, codec: BufferEncoding): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // stream.write acepta callback con (err?) en algunos entornos; lo manejamos
      try {
        const ok = stream.write(data, codec, (err?) => {
          if (err) return reject(err);
          resolve();
        });
        // En caso de que write no invoque callback (rare), resolvemos igual
        // cuando write devolvió true/false no indica fallo.
        if (ok === undefined) {
          // no-op
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  private async safeFlushQueue(stream: NodeJS.WriteStream, codec: BufferEncoding, bufferKey: string): Promise<void> {
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      await this.flushStream(stream, codec, bufferKey);
    } catch (err: any) {
      try {
        process.stderr.write(`[SpectralOutput] flush error: ${err?.stack || err}\n`);
      } catch (_) {}
    } finally {
      this.isFlushing = false;
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }
    }
  }

  /** Volcado controlado del buffer actual (stream específico). */
  private async flushStream(stream: NodeJS.WriteStream, codec: BufferEncoding, bufferKey: string): Promise<void> {
    const buffer: string[] = (this as any)[bufferKey];
    if (!buffer || buffer.length === 0) return;

    const content = buffer.join('');
    (this as any)[bufferKey] = [];

    await this.safeWrite(stream, content, codec);
  }

  /** Fuerza un flush inmediato y espera a que las colas terminen */
  public async forceFlush(codec: BufferEncoding = 'utf-8'): Promise<void> {
    // Esperar a que todas las colas se vacíen
    await Promise.all([this.stdoutQueue, this.stderrQueue].map(p => p.catch(() => {})));

    // Limpiar timers
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Volcar ambos buffers si tienen contenido
    await Promise.all([
      this.flushStream(process.stdout, codec, 'stdoutBuffer').catch(() => {}),
      this.flushStream(process.stderr, codec, 'stderrBuffer').catch(() => {}),
    ]);
  }
}
