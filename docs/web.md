# Web Usage

This guide covers using SpectralLogs in web environments.

- Entry: `spectrallogs/web`
- Output: CSS-styled console messages with optional batching; or a custom DOM sink

## Installation (bundlers)

```bash
npm install spectrallogs
```

```ts
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';

spec.success('Hello from the browser');

// Optional: DOM sink to avoid DevTools overhead
const sink = (args: any[]) => console.log(...args);
const logger = new SpectralLoggerWeb({ batching: true, sink });
logger.info('Batched log via sink');
logger.flush();
```

## CDN (esm.sh)

```html
<script type="module">
  import spec from 'https://esm.sh/spectrallogs/web';
  spec.info('Hello via CDN');
</script>
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
```

## Errors

```ts
try {
  throw new Error('Something went wrong');
} catch (e) {
  spec.error(e);
}
```

## Performance Tips

- Enable batching (default) to reduce console call overhead.
- Use a DOM sink (`sink` option) for extremely high volumes.
- Avoid logging huge objects repeatedly; prefer summaries or counts.
