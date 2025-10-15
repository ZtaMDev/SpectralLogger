---
title: Colors and Custom Color Registry
description: How to color inline text and register custom colors in SpectralLogs for Node and Web.
---

# Colors

## Supported Named Colors

`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `grey`, `orange`, `purple`, `pink`, `brown`, `lime`, `navy`, `teal`, `olive`, `maroon`


- **Inline color helper (Node + Web API parity)**: `spec.color(text, nameOrColor)`
- **Add custom colors**: `spec.color.add(name, color)`

This lets you compose multi-line strings and highlight labels inline.

## Examples (Node)

```ts
import spec from 'spectrallogs';

// Use built-in level names or CSS-like colors (#hex, rgb(...), named)
const helpText = `
🌀  Spectral Logs CLI
──────────────────────
${spec.color('Usage:', 'info')}
  spec <command> <message>

${spec.color('Commands:', 'success')}
  info       Show informational message
  success    Show success message
  warn       Show warning message
  error      Show error message
  debug      Show debug message
  config     Show current configuration

${spec.color('Examples:', 'warn')}
  spec info "Hello from Spectral CLI!"
  spec success "Everything works fine!"
  spec error "Something went wrong"
`;

spec.log(helpText);
```

Node applies ANSI colors inline, so the highlighted segments render directly in the terminal output.

## Custom Colors

You can register any color name to a hex/rgb/CSS color and reuse it.

```ts
// Register custom colors
spec.color.add('accent', '#7c3aed'); // purple-600
spec.color.add('muted', '#9ca3af');  // gray-400

// Use them inline
spec.info(`${spec.color('Accent Title', 'accent')} - details with ${spec.color('muted text', 'muted')}`);
```

- Names are case-insensitive.
- Accepts `#hex`, `rgb(r,g,b)`, or any CSS color keyword.

## Web Build Notes

In the browser build (`import spec from 'spectrallogs/web'`):

- `spec.color.add(name, color)` works to extend the color registry used by the logger.
- Inline `spec.color(text, name)` currently returns the text unchanged (console CSS `%c` uses segmented formatting). Inline multi-color within the same string is not applied.
- To color messages on Web, pass a color per log call:

```ts
import spec from 'spectrallogs/web';

spec.info('Info message'); // uses level color
spec.info('Custom color message', '#ff00aa');

// Or configure level colors globally
spec.configure({ colors: { info: '#22d3ee' } });
```

## Tips

- Prefer built-in level colors for consistency.
- Use custom colors for branded accents or grouping labels in help output.
- In Node, heavy use of inline colors is fine; in Web, prefer per-call color or configure level colors.
