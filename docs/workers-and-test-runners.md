# Workers and Test Runners

Guidance for multi-threaded Node apps and test frameworks.

## Worker Threads (Node)

- Create one logger per worker (each has its own VM context).
- If you need deterministic ordering across workers, aggregate logs in the main thread:

```ts
// worker.js
import spec from 'spectrallogs';
import { parentPort } from 'worker_threads';

const log = spec.child('w1');
function emit(level: 'info'|'warn'|'error'|'log', msg: string) {
  parentPort!.postMessage({ level, msg });
}

emit('info', 'ready');
```

```ts
// main.js
import spec from 'spectrallogs';
import { Worker } from 'worker_threads';

const main = spec.child('main');
const worker = new Worker('./worker.js');

worker.on('message', ({ level, msg }) => {
  (main as any)[level](msg); // writes through a single sink
});
```

Notes:
- This preserves order at the aggregation point and avoids interleaved stdout from multiple writers.
- You may also route to a file or IPC plugin if preferred.

## Test Runners (Vitest/Jest/Mocha)

- Runners capture/wrap stdout; buffering can change interleaving.
- Recommendations:
  - In CI, disable colors for clean logs.
  - For strict interleaving, disable buffering: `spec.configure({ bufferWrites: false })`.
  - When runners aggressively capture output, consider a custom sink (file plugin, or redirect to a buffer and print at the end).

## Web Test Environments (JSDOM, Playwright)

- Use `spectrallogs/web`.
- For heavy logs, batch or provide a DOM sink to avoid DevTools overhead:

```ts
import { SpectralLoggerWeb } from 'spectrallogs/web';
const sink = (args: any[]) => console.log(...args);
const logger = new SpectralLoggerWeb({ batching: true, sink });
```
