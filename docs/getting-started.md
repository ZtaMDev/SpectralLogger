# Getting Started

Learn how to install and use SpectralLogs in different environments and frameworks.

- Package: `spectrallogs`
- Node entry: `spectrallogs`
- Web entry: `spectrallogs/web`

## Installation

```bash
npm install spectrallogs
```

## Node (CommonJS & ESM)

ESM:
```ts
import spec from 'spectrallogs';

spec.success('SpectralLogs (Node) ready');
```

CommonJS:
```js
const spec = require('spectrallogs').default;

spec.info('CJS works');
```

## Web (bundlers)

```ts
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';

spec.success('SpectralLogs (Web) ready');

// Optional: DOM sink to avoid DevTools overhead
const sink = (args: any[]) => console.log(...args);
const logger = new SpectralLoggerWeb({ batching: true, sink });
logger.info('Batched via custom sink');
logger.flush();
```

## CDN (esm.sh)

```html
<script type="module">
  import spec from 'https://esm.sh/spectrallogs/web';
  spec.info('Loaded via CDN');
</script>
```

## React (Vite)

```tsx
// src/App.tsx
import { useEffect } from 'react';
import spec, { SpectralLoggerWeb } from 'spectrallogs/web';

export default function App() {
  useEffect(() => {
    spec.success('React + SpectralLogs');
    const sink = (args: any[]) => console.log(...args);
    const logger = new SpectralLoggerWeb({ batching: true, sink });
    logger.info('Batched via custom sink');
    logger.flush();
  }, []);
  return <div>Open the console</div>;
}
```

## Vite (vanilla)

```ts
// src/main.ts
import spec from 'spectrallogs/web';

spec.success('Vite app ready');
```

## Next.js (App Router)

Use `spectrallogs` on the server (Node) and `spectrallogs/web` on the client.

```tsx
// app/page.tsx (client component)
'use client';
import { useEffect } from 'react';
import spec from 'spectrallogs/web';

export default function Page() {
  useEffect(() => { spec.info('Next.js client ready'); }, []);
  return <div>Client logging initialized</div>;
}
```

## Troubleshooting

- If using Node, import from `spectrallogs` (root). Do not require `dist-web` from Node.
- If using Web/CDN, import from `spectrallogs/web` or `https://esm.sh/spectrallogs/web`.
- For extremely high-volume logging in Web, use a DOM sink with batching.
