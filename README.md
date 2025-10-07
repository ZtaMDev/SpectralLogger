# Spectral Logger

> The fastest, most elegant logging library for Node.js and TypeScript

Spectral is a high-performance, zero-dependency logging library designed to replace `console.log` with beautiful colors, advanced formatting, and incredible speed.

## Features

- **Lightning Fast** - Optimized stdout writing with internal buffering
- **Rich Colors** - Full support for HEX, RGB, and named colors with automatic terminal detection
- **TypeScript First** - Complete type safety and IntelliSense support
- **Smart Error Handling** - Automatic error tracking, stack trace cleaning, and duplicate detection
- **Plugin System** - Extensible architecture for custom functionality
- **Zero Dependencies** - Minimal footprint, maximum performance
- **CLI Tools** - Built-in diagnostics, benchmarking, and configuration management

## 📦 Installation

```bash
npm install spectrallogs
```

## Quick Start

```typescript
import spec from 'spectrallogs';

spec.log('Hello Spectral!');
spec.info('Informational message');
spec.success('Operation completed!');
spec.warn('Warning message');
spec.error('Error occurred');
spec.debug('Debug information');
```

## Custom Colors

Spectral supports multiple color formats:

```typescript
// HEX colors
spec.log('Custom message', '#07d53a');

// RGB colors
spec.info('Blue message', 'rgb(0, 191, 255)');

// Named colors
spec.warn('Orange warning', 'orange');
```

### Supported Named Colors

`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `grey`, `orange`, `purple`, `pink`, `brown`, `lime`, `navy`, `teal`, `olive`, `maroon`

## ⚙️ Configuration

```typescript
import spec from 'spectrallogs';

spec.configure({
  showTimestamp: true,
  showLevel: true,
  debugMode: false,
  codec: 'utf-8',
  timeFormat: 'iso', // 'iso' | 'unix' | 'locale'
  colors: {
    info: '#00bfff',
    success: '#00ff88',
    warn: '#ffaa00',
    error: '#ff5555',
    log: '#dddddd',
    debug: '#cc66ff',
  },
});
```

## Plugins

Spectral includes a powerful plugin system for extending functionality.

### FileLogger Plugin

Save logs to files with automatic rotation:

```typescript
import spec, { FileLoggerPlugin } from 'spectrallogs';

const fileLogger = new FileLoggerPlugin({
  filePath: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  rotate: true,
});

spec.use(fileLogger);

spec.info('This will be logged to console AND file');
```

### Performance Tracker Plugin

Track logging performance metrics:

```typescript
import spec, { PerformanceTrackerPlugin } from 'spectrallogs';

const perfTracker = new PerformanceTrackerPlugin();
spec.use(perfTracker);

spec.log('Log message 1');
spec.info('Log message 2');
spec.success('Log message 3');

perfTracker.printStats();
```

### Creating Custom Plugins

With TypeScript:

```typescript
import spec from "spectrallogs"

import { Plugin } from 'spectrallogs';

const myPlugin: Plugin = {
  name: 'MyCustomPlugin',

  init() {
    console.log('Plugin initialized');
  },

  beforeLog(message: string, level: any, options: any) {
    return message.toUpperCase();
  },

  afterLog(message: any, level: any, options: any) {
    console.log('Log completed');
  },
};

spec.use(myPlugin);
```

With JavaScript:
```javascript
import spec from "spectrallogs"

const myPlugin = {
  name: 'MyCustomPlugin',

  init() {
    console.log('Plugin initialized');
  },

  beforeLog(message, level, options) {
    return message.toUpperCase();
  },

  afterLog(message, level, options) {
    console.log('Log completed');
  },
};

spec.use(myPlugin);

```
## CLI Tools

Spectral includes a CLI for diagnostics and configuration:

```bash
# Show version
npx spectral --version

# Show help
npx spectral --help

# Show current configuration
npx spectral config

# Set configuration
npx spectral config set debugMode=true
npx spectral config set colors.info=#ff00ff

# Reset configuration
npx spectral config reset

# Run performance benchmark
npx spectral bench

# Diagnose environment
npx spectral doctor
```

## Error Handling

Spectral automatically formats Error objects with clean stack traces:

```typescript
try {
  throw new Error('Something went wrong');
} catch (error) {
  spec.error(error);
}
```

Output includes:
- Error name and message
- Clean, filtered stack trace
- Duplicate error tracking

## Performance

Spectral is designed for speed. Run the benchmark to see:

```bash
npx spectral bench
```

Typical results show Spectral is comparable or faster than `console.log` while providing significantly more features.

## API Reference

### Main Logger Methods

- `spec.log(message, color?, codec?)` - Basic log
- `spec.info(message, color?, codec?)` - Info level
- `spec.success(message, color?, codec?)` - Success level
- `spec.warn(message, color?, codec?)` - Warning level
- `spec.error(message, color?, codec?)` - Error level
- `spec.debug(message, color?, codec?)` - Debug level (only when debugMode is enabled)

### Utility Methods

- `spec.configure(options)` - Update configuration
- `spec.use(plugin)` - Register a plugin
- `spec.flush()` - Force flush buffered output
- `spec.getConfig()` - Get current configuration
- `spec.getErrorStats()` - Get error statistics
- `spec.clearErrorCache()` - Clear error cache

## Examples

### Basic Logging

```typescript
import spec from 'spectrallogs';

spec.log('Application started');
spec.info('Loading configuration...');
spec.success('Configuration loaded successfully');
```

### Object Logging

```typescript
const user = { id: 1, name: 'John', active: true };
spec.log(user);
```

### Custom Configuration

```typescript
spec.configure({
  showTimestamp: false,
  colors: {
    success: '#00ff00',
    error: '#ff0000',
  },
});
```

### Using Multiple Plugins

```typescript
import spec, { FileLoggerPlugin, PerformanceTrackerPlugin } from 'spectrallogs';

const fileLogger = new FileLoggerPlugin();
const perfTracker = new PerformanceTrackerPlugin();

spec.use(fileLogger);
spec.use(perfTracker);

spec.info('Logging with multiple plugins');
```

## Browser Usage

Spectral provides a dedicated web build available under the subpath import `spectrallogs/web`. This build is optimized for browsers: it uses CSS styling with `%c`, batching to reduce console overhead, and exposes the same high-level API.

### CDN (esm.sh)

Use the CDN to try Spectral quickly without a bundler:

```html
<script type="module">
  import spec from 'https://esm.sh/spectrallogs/web';

  spec.success('Hello from Spectral Web via CDN');
  spec.info('Colors are applied using CSS styles');
</script>
```

You can also instantiate a logger that writes to the DOM for maximum speed (avoiding DevTools overhead):

```html
<pre id="sink"></pre>
<script type="module">
  import { SpectralLoggerWeb } from 'https://esm.sh/spectrallogs/web';

  const sinkEl = document.getElementById('sink');
  const sink = (args) => { sinkEl.textContent += args.join(' ') + '\n'; };
  const logger = new SpectralLoggerWeb({ batching: true, sink });

  for (let i = 0; i < 10; i++) logger.info('Fast DOM logging #' + i);
  logger.flush();
  logger.error(new Error('Example error'));
</script>
```

### Bundlers (Vite, React, etc.)

Install normally and import the web subpath:

```bash
npm install spectrallogs
```

In a Vite/React app:

```tsx
// src/App.tsx
import { useEffect } from 'react';
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';

export default function App() {
  useEffect(() => {
    spec.success('Spectral Web ready in React');

    // Optional: DOM sink batching
    const sink = (args: any[]) => console.log(...args);
    const logger = new SpectralLoggerWeb({ batching: true, sink });
    logger.info('Batched log via custom sink');
    logger.flush();
  }, []);
  return <div>Open your console to see Spectral logs</div>;
}
```

Notes:
- Use `spectrallogs/web` only in browser contexts. The Node build exports remain under `spectrallogs`.
- The web build uses CSS for colors and supports features like timestamps, levels, and error formatting.
- File-based plugins (e.g., `FileLogger`) are not available in web. Use web-specific plugins/utilities instead.

### Local build (without CDN)

If working within this repository, you can build the web bundle and import locally:

```bash
npm run build:web
```

```html
<script type="module">
  import spec from './dist-web/index.js';
  spec.info('Loaded from local dist-web');
  </script>
```

## Node/Deno Usage (recap)

The Node build (ANSI colors, stdout/stderr buffering) is available at the package root:

```ts
import spec from 'spectrallogs';

spec.log('Application started');
spec.info('Loading configuration...');
spec.success('Configuration loaded successfully');
```

CommonJS:

```js
const spec = require('spectrallogs').default;
spec.warn('CJS usage works as well');
```

## Environment Support

Spectral automatically detects terminal color support:

- **TrueColor** (24-bit): Full HEX/RGB support
- **256-color**: Approximated colors
- **No color**: Graceful fallback to plain text

Set `COLORTERM=truecolor` for best results.

## TypeScript Support

Spectral is written in TypeScript and includes complete type definitions:

```typescript
import spec, {
  SpectralLogger,
  SpectralConfigOptions,
  Plugin,
  LogLevel
} from 'spectrallogs';

const logger = new SpectralLogger();
logger.info('Fully typed');
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Why Spectral?

- **Fast**: Optimized for performance with minimal overhead
- **Beautiful**: Rich colors and clean formatting out of the box
- **Flexible**: Powerful plugin system for any use case
- **Simple**: Drop-in replacement for `console.log`
- **Reliable**: Zero dependencies, battle-tested code

---
