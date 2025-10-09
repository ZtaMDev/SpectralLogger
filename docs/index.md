---
# VitePress home page configuration
layout: home
hero:
  name: Spectral Logs
  text: High-performance logging for Node & Web
  tagline: Beautiful colors, clean formatting, blazing-fast output, and an extensible plugin system.
  image:
    src: /logo.png
    alt: SpectralLogs logo
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Roadmap
      link: /roadmap
    - theme: alt
      text: GitHub
      link: https://github.com/ZtaMDev/SpectralLogs
    - theme: alt
      text: npm
      link: https://www.npmjs.com/package/spectrallogs
features:
  - icon: { src: /icons/fast.svg }
    title: Lightning Fast
    details: Buffered stdout in Node and batched console output in Web dramatically reduce logging overhead.
  - icon: { src: /icons/colors.svg }
    title: Rich Colors
    details: ANSI for terminals and CSS styles for browsers, with HEX, RGB, and named colors.
  - icon: { src: /icons/errors.svg }
    title: Smart Errors
    details: Clean stack traces, deduplication, and helpful formatting for Error objects.
  - icon: { src: /icons/plugin.svg }
    title: Plugin System
    details: Extend behavior with before/after hooks; ship Node and Web specific plugins.
  - icon: { src: /icons/ts.svg }
    title: TypeScript First
    details: Fully typed API with IntelliSense and zero runtime dependencies.
  - icon: { src: /icons/universal.svg }
    title: Universal
    details: Node, Bun, Deno, and Web. Use 'spectrallogs' on server runtimes and 'spectrallogs/web' in browsers or via CDN (esm.sh).
---

<!-- Optional extra section on the home page -->

## Code Examples:

Simple `spec.info()` and `spec.succes()` usage:
```ts
// Node / Bun / Deno
import spec from 'spectrallogs';
spec.info('Node ready');

// Web
import web from 'spectrallogs/web';
web.success('Web ready');
```

Web Bundlers and use of `sink`:

```ts 
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';

spec.success('SpectralLogs (Web) ready');

// Optional: DOM sink to avoid DevTools overhead
const sink = (args: any[]) => console.log(...args);
const logger = new SpectralLoggerWeb({ batching: true, sink });
logger.info('Batched via custom sink');
logger.flush();
```

Simple example of the `spec.configure()` method:

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

## Why SpectralLogs?

SpectralLogs replaces `console.log` with a fast, beautiful, and flexible logger. It supports:

- Clean, colorized output
- Timestamps and levels
- Powerful error formatting
- Plugins for custom behavior
- Node and Web builds in a single package