import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';

const CACHED_NODE_ENV = process.env.NODE_ENV;
const IS_TEST_ENV = CACHED_NODE_ENV === 'test';

/**
 * SpectralOutput simplificado y sincronizado
 */
export class SpectralOutput {
  private config: SpectralConfig;
  private pendingWrites: Promise<void> = Promise.resolve();
  private writeLock: Promise<void> = Promise.resolve();

  constructor(config: SpectralConfig) {
    this.config = config;

    if (!IS_TEST_ENV) {
      process.once('beforeExit', async () => {
        await this.forceFlush().catch(() => {});
      });
    }
  }

  /**
   * Escritura sincronizada que mantiene el orden estricto
   */
  public async write(message: string, level: LogLevel, codec: BufferEncoding = 'utf-8'): Promise<void> {
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    const finalMessage = message.endsWith('\n') ? message : `${message}\n`;

    // Usamos un lock para garantizar orden estricto
    this.pendingWrites = this.pendingWrites.then(async () => {
      await this.writeLock;
      
      if (this.shouldBuffer()) {
        // Buffering mínimo con flush inmediato para mantener orden
        await this.bufferedWrite(stream, finalMessage, codec);
      } else {
        await this.directWrite(stream, finalMessage, codec);
      }
    });

    return this.pendingWrites;
  }

  private shouldBuffer(): boolean {
    return !!this.config.getConfig().bufferWrites;
  }

  private async bufferedWrite(stream: NodeJS.WriteStream, data: string, codec: BufferEncoding): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const ok = stream.write(data, codec, (err?) => {
        if (err) reject(err);
        else resolve();
      });
      
      if (!ok) {
        stream.once('drain', () => resolve());
      } else if (ok === undefined) {
        // Para streams que no llaman el callback
        setImmediate(resolve);
      }
    });
  }

  private async directWrite(stream: NodeJS.WriteStream, data: string, codec: BufferEncoding): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const ok = stream.write(data, codec, (err?) => {
          if (err) reject(err);
          else resolve();
        });
        
        if (!ok) {
          stream.once('drain', () => resolve());
        } else if (ok === undefined) {
          setImmediate(resolve);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Fuerza flush esperando a todas las escrituras pendientes */
  public async forceFlush(codec: BufferEncoding = 'utf-8'): Promise<void> {
    // Esperar a que todas las escrituras pendientes terminen
    await this.pendingWrites;
    
    // Forzar drain de ambos streams
    await new Promise<void>((resolve) => {
      if (process.stdout.writableNeedDrain || process.stderr.writableNeedDrain) {
        const checkDrain = () => {
          if (!process.stdout.writableNeedDrain && !process.stderr.writableNeedDrain) {
            resolve();
          } else {
            setImmediate(checkDrain);
          }
        };
        checkDrain();
      } else {
        resolve();
      }
    });
  }
}