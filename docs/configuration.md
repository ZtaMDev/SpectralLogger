# Configuration

This page explains how to configure SpectralLogs at runtime in both Node and Web builds, and how to inspect/clear diagnostics.

- Node entry: `spectrallogs`
- Web entry: `spectrallogs/web`

## Configure

Use `configure()` to update settings dynamically.

```ts
// Node / Bun / Deno
import spec from 'spectrallogs';

spec.configure({
  showTimestamp: true,
  showLevel: true,
  debugMode: false,
  bufferWrites: true, // disable stdout/stderr buffering (Node)
  timeFormat: 'iso', // 'iso' | 'unix' | 'locale'
  colors: {
    info: '#00bfff', success: '#00ff88', warn: '#ffaa00',
    error: '#ff5555', log: '#dddddd', debug: '#cc66ff',
  },
});
```

```ts
// Web
import spec from 'spectrallogs/web';

spec.configure({
  showTimestamp: true,
  showLevel: true,
  debugMode: true,
  // bufferWrites is Node-only; ignored in Web
  colors: {
    info: '#00bfff', success: '#00ff88', warn: '#ffaa00',
    error: '#ff5555', log: '#dddddd', debug: '#cc66ff',
  },
});
```

Notes:
- Web build ignores Node-only concerns like `bufferWrites` and `codec`.
- Colors in Node use ANSI; in Web they translate to CSS.

## Get current config

```ts
const cfg = spec.getConfig();
```

## Debug mode

```ts
spec.configure({ debugMode: true });
spec.debug('Only shown when debugMode=true');
```

## Flush

```ts
spec.flush();
// Node / Bun / Deno: force flush buffered stdout/stderr
// Web: flush the batching queue
```

## Error diagnostics

Inspect and clear internal error cache:

```ts
const stats = spec.getErrorStats();
spec.clearErrorCache();
```
