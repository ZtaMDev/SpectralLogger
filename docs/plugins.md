# Plugins

SpectralLogs supports a simple plugin system with two lifecycle hooks per log call and an optional `init`.

## Interface

```ts
interface Plugin {
  name: string;
  init?: (logger: any) => void;
  beforeLog?: (message: string, level: LogLevel, options?: LogOptions) => string | void;
  afterLog?: (message: string, level: LogLevel, options?: LogOptions) => void;
}
```

- **beforeLog**: can transform the message (return a new string) or just observe.
- **afterLog**: runs after the message is written.

## Node Plugins

- `FileLoggerPlugin`: appends entries to a file, with optional rotation and JSON/text formatting.
- `PerformanceTrackerPlugin`: measures time per log using `perf_hooks`.

```ts
import spec, { FileLoggerPlugin, PerformanceTrackerPlugin } from 'spectrallogs';

// Basic file logging
spec.use(new FileLoggerPlugin({ filePath: '.spectral/logs.log' }));

// JSON format with rotation
spec.use(new FileLoggerPlugin({
  filePath: './logs/application.log',
  format: 'json',
  maxSize: 10 * 1024 * 1024, // 10MB
  rotate: true
}));

// Multiple file loggers
const generalLogger = new FileLoggerPlugin({ filePath: './logs/general.log' });
const errorLogger = new FileLoggerPlugin({ filePath: './logs/errors.log' });
spec.use(generalLogger);
spec.use(errorLogger);
```

## Web Plugins

- `PerformanceTrackerWeb`: measures time using `performance.now()`.

```ts
import spec, { PerformanceTrackerWeb } from 'spectrallogs/web';

spec.use(new PerformanceTrackerWeb());
```

## Custom Plugin Example

```ts
const myPlugin = {
  name: 'Uppercase',
  beforeLog(msg) {
    return msg.toUpperCase();
  },
  afterLog(msg, level) {
    // send analytics if needed
  }
};

spec.use(myPlugin);
```
