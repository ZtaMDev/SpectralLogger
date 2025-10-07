"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTrackerPlugin = exports.FileLoggerPlugin = exports.SpectralConfig = exports.SpectralLogger = void 0;
const SpectralLogger_1 = require("./core/SpectralLogger");
Object.defineProperty(exports, "SpectralLogger", { enumerable: true, get: function () { return SpectralLogger_1.SpectralLogger; } });
const SpectralConfig_1 = require("./core/SpectralConfig");
Object.defineProperty(exports, "SpectralConfig", { enumerable: true, get: function () { return SpectralConfig_1.SpectralConfig; } });
const plugins_1 = require("./plugins");
Object.defineProperty(exports, "FileLoggerPlugin", { enumerable: true, get: function () { return plugins_1.FileLoggerPlugin; } });
Object.defineProperty(exports, "PerformanceTrackerPlugin", { enumerable: true, get: function () { return plugins_1.PerformanceTrackerPlugin; } });
// Crear una instancia del logger
const logger = new SpectralLogger_1.SpectralLogger();
// Exportar la instancia directamente
exports.default = logger;
// Para compatibilidad con CommonJS
if (typeof module !== 'undefined' && module.exports) {
    // Crear un objeto con todas las exportaciones
    const allExports = {
        // Instancia por defecto
        default: logger,
        // Clases principales
        SpectralLogger: SpectralLogger_1.SpectralLogger,
        SpectralConfig: SpectralConfig_1.SpectralConfig,
        // Plugins
        FileLoggerPlugin: plugins_1.FileLoggerPlugin,
        PerformanceTrackerPlugin: plugins_1.PerformanceTrackerPlugin,
        // Métodos de la instancia
        ...Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(logger)))
            .filter(([key]) => key !== 'constructor')
            .reduce((acc, [key, desc]) => {
            if (typeof desc.value === 'function') {
                acc[key] = desc.value.bind(logger);
            }
            return acc;
        }, {})
    };
    // Asignar al module.exports
    module.exports = allExports;
    // Asegurar que la exportación por defecto también esté disponible directamente
    Object.assign(module.exports, logger);
}
//# sourceMappingURL=index.js.map