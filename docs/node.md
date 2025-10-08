# Node Usage

This guide covers using SpectralLogs in Node.js environments.

- Entry: `spectrallogs`
- Output: ANSI colors to stdout/stderr with internal buffering

## Installation

```bash
npm install spectrallogs
```

## Quick Start

```ts
import spec from 'spectrallogs';

spec.log('Application started');
spec.info('Loading configuration...');
spec.success('Configuration loaded successfully');
```

CommonJS:

```js
const spec = require('spectrallogs').default;
spec.warn('CJS works');
```

## Configuration

```ts
spec.configure({
  showTimestamp: true,
  showLevel: true,
  debugMode: false,
  colors: {
    info: '#00bfff',
    success: '#00ff88',
    warn: '#ffaa00',
    error: '#ff5555',
    log: '#dddddd',
    debug: '#cc66ff',
  }
});

// Create scoped child loggers
const api = spec.child('api');
const db = spec.child('db');

api.info('server started');     // => [api] server started
db.warn('slow query');          // => [db] slow query

// You can still configure globally; children see updates
spec.configure({ bufferWrites: false });
```

## Errors

Passing `Error` objects prints name, message, and a cleaned stack trace:

```ts
try {
  throw new Error('Something went wrong');
} catch (e) {
  spec.error(e);
}


```
## Plugins (Node)

- `FileLogger` (writes to a rotating file)
- `PerformanceTracker` (records logging time using `perf_hooks`)

```ts
import spec, { FileLoggerPlugin, PerformanceTrackerPlugin } from 'spectrallogs';

spec.use(new FileLoggerPlugin({ filePath: '.spectral/logs.txt' }));
spec.use(new PerformanceTrackerPlugin());
```

## Child Loggers (scopes)

Create scoped child loggers that prefix messages with a label. Children inherit config and plugins from the parent.

```ts
import spec from 'spectrallogs';

const api = spec.child('api');
const db = spec.child('db');

api.info('server started');     // => [api] server started
db.warn('slow query');          // => [db] slow query
```
