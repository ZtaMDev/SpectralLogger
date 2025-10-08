# SpectralLogs Documentation

SpectralLogs is a high-performance logging library for Node.js and the Web. It provides rich colors, clean formatting, error handling, and an extensible plugin system with zero dependencies.

- Package name: `spectrallogs`
- Node entry: `spectrallogs`
- Web entry: `spectrallogs/web`

## Installation

```bash
npm install spectrallogs
```

## Quick Start (Node)

```ts
import spec from 'spectrallogs';

spec.info('Hello from Node!');
```

## Quick Start (Web)

```ts
import spec from 'spectrallogs/web';

spec.success('Hello from Web!');
```

## Why Spectral?

- Fast: buffered output (Node) and batching (Web)
- Beautiful: ANSI (Node) or CSS (Web) colors
- Flexible: plugins for cross-cutting concerns
- Simple: drop-in replacement for `console.log`
