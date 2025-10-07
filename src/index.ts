import { SpectralLogger } from './core/SpectralLogger';
import { SpectralConfig } from './core/SpectralConfig';
import { ErrorEntry } from './core/SpectralError';
import { 
  FileLoggerPlugin, 
  PerformanceTrackerPlugin,
  type FileLoggerOptions,
  type PerformanceStats 
} from './plugins';
import type { 
  LogLevel, 
  ColorInput, 
  SpectralConfigOptions, 
  LogOptions, 
  FormattedMessage, 
  Plugin 
} from './types';

// Crear una instancia del logger
const logger = new SpectralLogger();

// Exportar la instancia directamente
export default logger;

// Re-exportar todo lo necesario
export { 
  SpectralLogger,
  SpectralConfig,
  ErrorEntry,
  FileLoggerPlugin,
  PerformanceTrackerPlugin,
  type FileLoggerOptions,
  type PerformanceStats,
  type LogLevel,
  type ColorInput,
  type SpectralConfigOptions,
  type LogOptions,
  type FormattedMessage,
  type Plugin
};

// Para compatibilidad con CommonJS
if (typeof module !== 'undefined' && module.exports) {
  // Crear un objeto con todas las exportaciones
  const allExports = {
    // Instancia por defecto
    default: logger,
    
    // Clases principales
    SpectralLogger,
    SpectralConfig,
    
    // Plugins
    FileLoggerPlugin,
    PerformanceTrackerPlugin,
    
    // Métodos de la instancia
    ...Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(logger)))
      .filter(([key]) => key !== 'constructor')
      .reduce((acc: Record<string, any>, [key, desc]) => {
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
