import { SpectralFormatter } from './SpectralFormatter';
export interface ErrorEntry {
    error: Error;
    count: number;
    firstSeen: Date;
    lastSeen: Date;
}
export declare class SpectralError {
    private formatter;
    private errorCache;
    private maxCacheSize;
    constructor(formatter: SpectralFormatter);
    handle(error: Error): string;
    private getErrorKey;
    private clearOldestError;
    getErrorStats(): Map<string, ErrorEntry>;
    clearCache(): void;
}
//# sourceMappingURL=SpectralError.d.ts.map