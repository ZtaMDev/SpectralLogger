# How it works

This page explains SpectralLogs internals at a high level.

## Node (stdout buffering)

- Messages are formatted with colors, timestamps, and levels by `SpectralFormatter`.
- Writes go through `SpectralOutput`, which batches small writes into a buffer and flushes to `stdout`/`stderr`.
- Buffering reduces syscalls and improves throughput for bursty logs.
- Buffering is configurable via `bufferWrites` (default true outside tests).

```ts
import spec from 'spectrallogs';

// Disable buffering for strict interleaving (e.g., some test runners)
spec.configure({ bufferWrites: false });
```

## Web (console batching / custom sink)

- Formatting uses CSS styles and `%c` to color segments.
- `WebOutput` can batch console writes or send them to a custom sink for maximum speed.

```ts
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';
const sink = (args: any[]) => console.log(...args);
const logger = new SpectralLoggerWeb({ batching: true, sink });
logger.info('Batched via custom sink');
logger.flush();
```

## Pipeline

1. Input → `logger.*()`
2. Plugins `beforeLog`
3. Error handling (if needed)
4. Formatting (colors, timestamp, level)
5. Output (buffered/batched)
6. Plugins `afterLog`

## Scopes (child loggers)

You can create scoped loggers that prefix messages with a label:

```ts
const api = spec.child('api');
api.info('ready'); // => [api] ready
```

On the web build:

```ts
import spec from 'spectrallogs/web';
const ui = spec.child('ui');
ui.success('mounted');
```

## Config resolution

- `configure()` merges partial settings into the global config (Node) or instance (Web).
- `bufferWrites` defaults to true unless `NODE_ENV === 'test'`.
- `asyncStacks` (Node-only, experimental) is disabled by default.

## Performance

- In Node, buffering typically speeds up bursts of logs vs raw `console.log`.
- In Web, batching and custom sinks help avoid DevTools overhead.
- A CI benchmark workflow (`.github/workflows/benchmark.yml`) posts results to the job summary.
