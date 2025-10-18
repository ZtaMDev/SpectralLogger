# SpectralLogs - Function Documentation

## Table of Contents
- [Logging Methods](#logging-methods)
- [Configuration Management](#configuration-management)
- [Special Functions](#special-functions)
- [Error Handling](#error-handling)
- [Color Helper](#color-helper)
- [Complete Examples](#complete-examples)

## Logging Methods

**Parameters:**
- `message`: Any data type (string, object, Error, etc.)
- `color` (optional): Custom color (hex, Spectral color name, or ANSI code)
- `codec` (optional): Buffer encoding (Node.js only)

### `.log(message, color?, codec?)`
**Description:** Logs a general message without a specific level.



**Examples:**
```javascript
spec.log('Informational message');
spec.log('Blue text', '#0000ff');
spec.log({ user: 'john', age: 25 });
spec.log(new Error('Something went wrong'));
```

### `.info(message, color?, codec?)`

**Description:** Logs an informational message.

**Example:**

```javascript
spec.info('User connected successfully');
spec.info('Process completed', '#00bfff');
```

### `.success(message, color?, codec?)`

**Description:** Logs a success message.

**Example:**

```javascript
spec.success('File saved successfully');
spec.success('Operation completed', '#00ff88');
```

### `.warn(message, color?, codec?)`

**Description:** Logs a warning message.

**Example:**

```javascript
spec.warn('Low disk space');
spec.warn('Deprecated configuration', '#ffaa00');
```

### `.error(message, color?, codec?)`

**Description:** Logs an error message. Handles Error objects with special formatting.

**Example:**

```javascript
spec.error('Connection error');
spec.error(new Error('Request timeout'));
spec.error('Critical error', '#ff5555');
```

### `.debug(message, color?, codec?)`

**Description:** Logs debug messages (only if `debugMode` is enabled).

**Example:**

```javascript
spec.debug('Variable x = 42');
spec.debug('Internal system state', '#cc66ff');
```

## Configuration Management

### `.configure(options)`

**Description:** Updates runtime configuration.

**Example:**

```javascript
spec.configure({
  showTimestamp: false,
  showLevel: true,
  debugMode: true,
  timeFormat: 'locale',
  bufferWrites: false,
  asyncStacks: true,
  colors: {
    info: '#0000ff',
    success: '#00ff00'
  }
});
```

### `.getConfig()`

**Description:** Gets the current resolved configuration.

**Example:**

```javascript
const config = spec.getConfig();
console.log(config);
```

## Special Functions

### `.input(message, options?)`

**Description:** Prompts user for input (Node.js only).

**Example:**

```javascript
const name = await spec.input('What is your name? ');
const environment = await spec.input('Environment: ', { default: 'development' });
const apiKey = await spec.input('API Key: ', { color: '#ffaa00' });
```

### `.flush()` & `.flushAsync()`

**Description:** Forces output buffer flushing.

**Example:**

```javascript
spec.flush();          // Non-blocking
await spec.flushAsync(); // Blocking
```

### `.child(scope)`

**Description:** Creates a child logger with prefixed scope.

**Example:**

```javascript
const dbLogger = spec.child('Database');
dbLogger.info('Connecting to DB...');
```

### `.use(plugin)`

**Description:** Registers a plugin for custom hooks.

**Example:**

```javascript
spec.use({
  name: 'my-plugin',
  init: (logger) => console.log('Plugin initialized'),
  beforeLog: (msg) => `[PREPEND] ${msg}`
});
```

## Error Handling

### `.getErrorStats()`

**Description:** Gets repeated error statistics.

**Example:**

```javascript
const stats = spec.getErrorStats();
stats.forEach((entry, key) => {
  console.log(`Error: ${key}, Count: ${entry.count}`);
});
```

### `.clearErrorCache()`

**Description:** Clears internal error cache.

**Example:**

```javascript
spec.clearErrorCache();
```

## Color Helper

### `.color(text, colorNameOrCode)`

**Description:** Applies inline color to text.

**Example:**

```javascript
spec.log(`${spec.color('Success', 'success')} in operation`);
spec.info(`${spec.color('Custom text', '#ff00ff')}`);
spec.color.add('accent', '#ff6600');
spec.log(`${spec.color('Text', 'accent')}`);
```

## Complete Examples

### Interactive CLI Application

```javascript
const spec = require('spectrallogs');

async function setupApplication() {
  spec.info('Initial application setup');

  const name = await spec.input('Application name: ');
  const environment = await spec.input('Environment (dev/prod): ', { default: 'dev' });
  const port = await spec.input(`${spec.color('Server port:', 'info')} `, { default: '3000' });

  spec.success(`Application "${name}" configured`);
  spec.info(`Environment: ${environment}, Port: ${port}`);

  await spec.flushAsync();
}

setupApplication();
```

### Logger with Multiple Scopes

```javascript
class DatabaseService {
  constructor() { this.logger = spec.child('DB'); }
  connect() {
    this.logger.info('Connecting to database...');
    this.logger.debug('Connection parameters:', { host: 'localhost' });
  }
}

class APIService {
  constructor() { this.logger = spec.child('API'); }
  start() {
    this.logger.info('Starting API server...');
    this.logger.success('Server started on port 3000');
  }
}
```