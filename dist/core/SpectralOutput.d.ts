import { LogLevel } from '../types';
export declare class SpectralOutput {
    private buffer;
    private bufferSize;
    private flushTimer;
    write(message: string, level: LogLevel, codec?: BufferEncoding): void;
    private shouldBuffer;
    private scheduleFlush;
    private flush;
    forceFlush(codec?: BufferEncoding): void;
}
//# sourceMappingURL=SpectralOutput.d.ts.map