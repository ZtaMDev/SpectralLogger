import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';
/**
 * Thread-safe SpectralOutput.
 * - Colas separadas por stream (stdout / stderr)
 * - Buffers con flush adaptativo
 * - safeWrite que espera el callback del stream
 * - forceFlush awaitable
 * - Manejo de errores aislado (no rompe la cola)
 */
export declare class SpectralOutput {
    private stdoutQueue;
    private stderrQueue;
    private stdoutBuffer;
    private stderrBuffer;
    private bufferSize;
    private flushTimer;
    private isFlushing;
    private config;
    constructor(config: SpectralConfig);
    /** Encola el mensaje en la secuencia segura según el nivel. */
    write(message: string, level: LogLevel, codec?: BufferEncoding): void;
    private shouldBuffer;
    private scheduleFlush;
    private adaptiveDelay;
    private safeWrite;
    private safeFlushQueue;
    /** Volcado controlado del buffer actual (stream específico). */
    private flushStream;
    /** Fuerza un flush inmediato y espera a que las colas terminen */
    forceFlush(codec?: BufferEncoding): Promise<void>;
}
//# sourceMappingURL=SpectralOutput.d.ts.map