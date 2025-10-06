import { Plugin, SpectralConfigOptions } from '../types';
export declare class SpectralLogger {
    private config;
    private output;
    private formatter;
    private errorHandler;
    private plugins;
    constructor();
    configure(options: SpectralConfigOptions): void;
    use(plugin: Plugin): void;
    private executePlugins;
    private writeLog;
    log(message: any, color?: string, codec?: BufferEncoding): void;
    info(message: any, color?: string, codec?: BufferEncoding): void;
    success(message: any, color?: string, codec?: BufferEncoding): void;
    warn(message: any, color?: string, codec?: BufferEncoding): void;
    error(message: any, color?: string, codec?: BufferEncoding): void;
    debug(message: any, color?: string, codec?: BufferEncoding): void;
    flush(): void;
    getConfig(): Required<SpectralConfigOptions>;
    getErrorStats(): Map<string, import("./SpectralError").ErrorEntry>;
    clearErrorCache(): void;
}
//# sourceMappingURL=SpectralLogger.d.ts.map