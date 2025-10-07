import { SpectralLogger } from './core/SpectralLogger';
import type { LogLevel, ColorInput, SpectralConfigOptions, LogOptions, FormattedMessage, Plugin } from './types';

// Crear una instancia del logger
const logger = new SpectralLogger();

// Exportar la instancia directamente
export default logger;

// Exportar la clase para crear nuevas instancias si es necesario
export { SpectralLogger } from './core/SpectralLogger';

// Exportar otras clases y tipos
export { SpectralConfig } from './core/SpectralConfig';
export { ErrorEntry } from './core/SpectralError';
export * from './plugins';
export type { LogLevel, ColorInput, SpectralConfigOptions, LogOptions, FormattedMessage, Plugin };

// Para compatibilidad con CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logger;
  module.exports.default = logger;
  // Asegurar que los métodos estén disponibles directamente
  Object.assign(module.exports, logger);
}
