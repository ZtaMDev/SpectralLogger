import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';
/**
 * SpectralOutput simplificado y sincronizado
 */
export declare class SpectralOutput {
    private config;
    private pendingWrites;
    private writeLock;
    constructor(config: SpectralConfig);
    /**
     * Escritura sincronizada que mantiene el orden estricto
     */
    write(message: string, level: LogLevel, codec?: BufferEncoding): Promise<void>;
    private shouldBuffer;
    private bufferedWrite;
    private directWrite;
    /** Fuerza flush esperando a todas las escrituras pendientes */
    forceFlush(codec?: BufferEncoding): Promise<void>;
}
//# sourceMappingURL=SpectralOutput.d.ts.map