import { LogLevel } from '../types';
import { SpectralConfig } from './SpectralConfig';
export declare class SpectralOutput {
    private buffer;
    private bufferSize;
    private flushTimer;
    private config;
    constructor(config: SpectralConfig);
    write(message: string, level: LogLevel, codec?: BufferEncoding): void;
    private shouldBuffer;
    private scheduleFlush;
    private flush;
    forceFlush(codec?: BufferEncoding): void;
}
//# sourceMappingURL=SpectralOutput.d.ts.map