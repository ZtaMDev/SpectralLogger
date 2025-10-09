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
    details: Import 'spectrallogs' in Node and 'spectrallogs/web' in browsers or from CDN (esm.sh).
---

<!-- Optional extra section on the home page -->

## Why SpectralLogs?

SpectralLogs replaces `console.log` with a fast, beautiful, and flexible logger. It supports:

- Clean, colorized output
- Timestamps and levels
- Powerful error formatting
- Plugins for custom behavior
- Node and Web builds in a single package

```ts
// Node
import spec from 'spectrallogs';
spec.info('Node ready');

// Web
import web from 'spectrallogs/web';
web.success('Web ready');
```