import type { SpectralConfigOptionsWeb, PluginWeb } from './types.js';
import { WebOutput } from './WebOutput.js';
export declare class SpectralLoggerWeb {
    private config;
    private output;
    private formatter;
    private errorHandler;
    private plugins;
    constructor(outputOptions?: ConstructorParameters<typeof WebOutput>[0]);
    configure(options: SpectralConfigOptionsWeb): void;
    use(plugin: PluginWeb): void;
    private executePlugins;
    private writeLog;
    log(message: any, color?: string): void;
    info(message: any, color?: string): void;
    success(message: any, color?: string): void;
    warn(message: any, color?: string): void;
    error(message: any, color?: string): void;
    debug(message: any, color?: string): void;
    flush(): void;
    getConfig(): {
        colors: {
            info: string;
            success: string;
            warn: string;
            error: string;
            log: string;
            debug: string;
        };
        showTimestamp: boolean;
        showLevel: boolean;
        debugMode: boolean;
        timeFormat: "iso" | "unix" | "locale";
    };
    getErrorStats(): Map<string, import("./WebError.js").ErrorEntryWeb>;
    clearErrorCache(): void;
}
//# sourceMappingURL=SpectralLoggerWeb.d.ts.map