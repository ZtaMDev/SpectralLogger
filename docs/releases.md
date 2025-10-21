## v0.2.2 Release Notes

> This release introduces powerful JSON logging capabilities with the enhanced `FileLoggerPlugin`, bringing enterprise-grade structured logging to SpectralLogs. We've also improved child logger compatibility and added comprehensive documentation.

### Added

* **JSON Logging Support**: New `FileLoggerPlugin` with JSON format output, log rotation, and structured context tracking
* **Enhanced FileLoggerPlugin**: Complete rewrite with support for multiple instances, child loggers, and advanced configuration
* **Structured Logging**: Rich JSON log entries with timestamps, levels, context, scope, and metadata
* **Log Rotation**: Automatic file rotation when logs exceed configurable size limits
* **Child Logger Integration**: Proper plugin support for child loggers with scope inheritance
* **Comprehensive Documentation**: Complete JSON logging guide with examples and best practices

### Enhanced

* **Plugin System**: Improved plugin architecture supporting multiple instances and proper child logger isolation
* **FileLoggerPlugin Performance**: Optimized file writing with proper stream management and error handling
* **Context Tracking**: Enhanced context propagation through child logger hierarchy
* **TypeScript Definitions**: Updated types with proper LoggerContext and plugin interfaces

### Fixed

* **Child Logger Plugin Isolation**: Resolved issue where plugins were incorrectly shared between parent and child loggers
* **Multiple Plugin Instances**: Fixed support for running multiple FileLoggerPlugin instances simultaneously
* **Scope Handling**: Improved scope propagation in structured logs
* **Plugin Initialization**: Better initialization sequence for plugins in child loggers

### Breaking Changes

* **FileLoggerPlugin Constructor**: The plugin now requires proper configuration through options object
* **Child Logger Behavior**: By default, child loggers no longer inherit parent plugins automatically (use `child(scope, true)` to enable inheritance)
* **Plugin Naming**: FileLoggerPlugin instances now have unique names to support multiple instances

### Install

* Fresh install:
```bash
npm install spectrallogs
```

* Update existing:
```bash
npm install spectrallogs@^0.2.2
```

* or
```bash
npm update spectrallogs
```

### Migration Guide

### Updating from v0.2.1

**1. FileLoggerPlugin Configuration**
```typescript
// Before (if using custom FileLoggerPlugin)
const logger = new FileLoggerPlugin('path/to/logs.txt');

// After
const logger = new FileLoggerPlugin({
  filePath: 'path/to/logs.log',
  format: 'json', // New option
  maxSize: 10 * 1024 * 1024 // New option
});
```

**2. Child Logger Plugin Inheritance**
```typescript
// Before: Plugins were automatically inherited
const child = parent.child('scope');

// After: Explicit inheritance required
const child = parent.child('scope', true); // Inherit plugins
// or
const child = parent.child('scope'); // No plugin inheritance
const child.use(new FileLoggerPlugin({ /* config */ })); // Add plugins manually
```

**3. Multiple FileLoggerPlugin Instances**
```typescript
// Now properly supported
const generalLogger = new FileLoggerPlugin({ filePath: './logs/general.log' });
const errorLogger = new FileLoggerPlugin({ filePath: './logs/errors.log' });
spec.use(generalLogger);
spec.use(errorLogger); // Both work simultaneously
```

### New Features

#### JSON Logging

The enhanced `FileLoggerPlugin` now supports structured JSON logging:

```typescript
import spec, { FileLoggerPlugin } from 'spectrallogs';

// Basic JSON logging
spec.use(new FileLoggerPlugin({
  filePath: './logs/application.log',
  format: 'json'
}));

// Log with context - automatically captured in JSON
spec.info("User logged in", { userId: "123", action: "login" });
```

Produces structured JSON output:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": {
    "userId": "123",
    "action": "login"
  }
}
```

#### Advanced Configuration

```typescript
// Comprehensive FileLoggerPlugin configuration
spec.use(new FileLoggerPlugin({
  filePath: './logs/app.log',
  format: 'json', // 'json' or 'text'
  maxSize: 50 * 1024 * 1024, // 50MB rotation threshold
  rotate: true, // Enable automatic rotation
  includeContext: true, // Include log context in output
  handleScope: true // Include child logger scope
}));
```

#### Child Logger Integration

```typescript
const apiLogger = new SpectralLogger('api');
apiLogger.use(new FileLoggerPlugin({
  filePath: './logs/api.log',
  format: 'json'
}));

// Child loggers with their own file loggers
const authLogger = apiLogger.child('auth');
authLogger.use(new FileLoggerPlugin({
  filePath: './logs/auth.log',
  format: 'json'
}));

// Logs include scope information
apiLogger.info("API started"); // Scope: "api"
authLogger.info("Auth loaded"); // Scope: "api.auth"
```

#### Log Rotation

When log files exceed the configured `maxSize`, they are automatically rotated:

```typescript
spec.use(new FileLoggerPlugin({
  filePath: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // Rotate after 10MB
  rotate: true
}));
```

Rotation creates timestamped backup files:
- `app.log` → `app-2024-01-15T10-30-00-000Z.log`

### Documentation

Complete JSON logging documentation is available in the updated docs, covering:

- Basic setup and configuration
- Advanced usage patterns
- Child logger integration
- Log rotation management
- Best practices for structured logging
- Integration with log analysis tools (ELK stack, CloudWatch, Datadog)

### Performance

The new FileLoggerPlugin maintains high performance with:
- Asynchronous file writing
- Efficient stream management
- Minimal memory overhead
- Optimized JSON serialization

### Compatibility

- **Node.js**: 14.x and above
- **TypeScript**: 4.x and above
- **Existing Code**: Fully backward compatible with logging API
- **Plugins**: Updated plugin system maintains compatibility with existing custom plugins

---

**Upgrade Recommendation**: This release is recommended for all users wanting structured logging capabilities, better child logger support, and enterprise-grade log management features. The breaking changes are minimal and well-documented for smooth migration.

---
---
---
## v0.2.1 Release Notes

> This hotfix release addresses critical ordering issues in both Node.js and Web versions of SpectralLogs, ensuring logs appear in the exact sequence they are called. We've also added a new `input()` method for interactive CLI applications.

### Fixed

* **Critical log ordering regression**: Fixed severe race conditions that caused logs to appear in random order, regardless of call sequence. Both Node.js and Web versions now maintain strict chronological ordering.

* **Asynchronous queue synchronization**: Completely redesigned the internal queue system to eliminate double-queuing and ensure all log operations process in first-in-first-out order.

* **Console.log interference**: Resolved timing issues where `console.log` calls would interleave incorrectly with SpectralLogs output, preserving the expected sequence.

* **Web version batching**: Fixed message ordering in the Web version when using batched console output, ensuring styled logs maintain proper sequence.

### Added

* **Interactive input method**: New `spec.input()` function for Node.js environments that prompts users for input with full SpectralLogs color and formatting support. Perfect for building interactive CLI tools and scripts.
* **Documentation Updated**: New Logger Functions section added to describe how to use the spec functions like `spec.log()` and the new `spec.input()` available here.

### Stuff you need to know

* This is a **critical stability release** that fixes fundamental log ordering problems
* Both Node.js and browser environments now guarantee log sequence integrity
* No API changes - existing code works exactly the same but with reliable ordering
* The internal architecture has been significantly simplified for better reliability
* The new `input()` method is only available in Node.js and returns a Promise that resolves with the user's input

### Install

* Fresh install:

```bash
npm install spectrallogs
```

* Update existing:

```bash
npm install spectrallogs@^0.2.1
```

* or

```bash
npm update spectrallogs
```

### Usage

After updating, your existing SpectralLogs code will automatically benefit from proper log ordering. No configuration changes or code modifications are required.

**Note**: Logging behavior is now deterministic and reliable. You can confidently mix `console.log` with SpectralLogs calls and expect them to appear in the exact order they were executed.

#### Using the new `input()` method

The `input()` method allows you to prompt the user for input in Node.js applications. It supports all SpectralLogs colorization and formatting features.

```javascript
const spec = require('spectrallogs');

// Basic usage
const name = await spec.input('What is your name? ');
spec.info(`Hello, ${name}!`);

// With color and default value
const environment = await spec.input('Enter environment: ', { 
  color: '#ffaa00', 
  default: 'development' 
});

// Using the color helper
const apiKey = await spec.input(
  `${spec.color('Enter API key:', 'error')} `
);

// For comparisons
const response = await spec.input('Are you sure? (yes/no) ');
if (response.toLowerCase() === 'yes') {
  spec.success('Confirmed!');
} else {
  spec.error('Cancelled');
}
```

**Note**: The `input()` method is asynchronous and returns a Promise, so you must use `await` or `.then()` to get the user's input. It also inherits the same formatting options as other log methods (like `color`, `default`, etc.).

---

**Changes made to fix the Web version:**

The Web version has been updated to disable batching by default, which was causing similar ordering issues. The `WebOutput` class now defaults to immediate console writing instead of batched output, ensuring proper sequence. Batching can still be enabled explicitly if needed for performance:

```javascript
// Enable batching explicitly if needed (not recommended for most use cases)
const logger = new SpectralLoggerWeb({ batching: true });
```

This change brings the Web version in line with the Node.js version's reliable ordering behavior.

---
---
---

## v0.2.0 Release Notes

> Roadmap features and improvements for 0.2.0 are completed see [here](https://ztamdev.github.io/SpectralLogs/roadmap.html) the roadmap

### Fixed

* **Race conditions in asynchronous logging**: Fixed several race conditions that could cause logs to appear out of order or occasionally be lost when logging from multiple asynchronous sources. Logging is now properly queued and processed sequentially to maintain order and reliability.

* **Thread safety improvements**: Enhanced internal locking mechanisms to prevent data corruption when multiple log operations occur simultaneously.

### Stuff you need to know

* This release focuses on **stability** and **reliability** improvements in concurrent logging scenarios
* No breaking changes to the core logging API
* Logging order is now preserved even when multiple asynchronous operations occur simultaneously

### Install

* Fresh install:

```bash
npm install spectrallogs
```

* Update existing:

```bash
npm install spectrallogs@^0.2.0
```

* or

```bash
npm update spectrallogs
```

### Usage

After installation, you can continue using SpectralLogs as before. No configuration changes are required for these fixes.

**Note**: Logging behavior is now more consistent in multi-threaded or asynchronous contexts. You should notice logs appearing in the expected order without drops.

---
---
---