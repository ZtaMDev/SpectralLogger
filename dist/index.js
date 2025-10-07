"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralConfig = exports.SpectralLogger = void 0;
const SpectralLogger_1 = require("./core/SpectralLogger");
// Crear una instancia del logger
const logger = new SpectralLogger_1.SpectralLogger();
// Exportar la instancia directamente
exports.default = logger;
// Exportar la clase para crear nuevas instancias si es necesario
var SpectralLogger_2 = require("./core/SpectralLogger");
Object.defineProperty(exports, "SpectralLogger", { enumerable: true, get: function () { return SpectralLogger_2.SpectralLogger; } });
// Exportar otras clases y tipos
var SpectralConfig_1 = require("./core/SpectralConfig");
Object.defineProperty(exports, "SpectralConfig", { enumerable: true, get: function () { return SpectralConfig_1.SpectralConfig; } });
__exportStar(require("./plugins"), exports);
// Para compatibilidad con CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
    module.exports.default = logger;
    // Asegurar que los métodos estén disponibles directamente
    Object.assign(module.exports, logger);
}
//# sourceMappingURL=index.js.map