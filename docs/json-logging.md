# JSON Logging

SpectralLogs provides powerful JSON logging capabilities through the `FileLoggerPlugin`, allowing you to store structured logs in JSON format with advanced features like log rotation, context tracking, and child logger support.

## Basic Usage

```typescript
import spec, { FileLoggerPlugin } from 'spectrallogs';

// Basic JSON logging
spec.use(new FileLoggerPlugin({
  filePath: './logs/application.log',
  format: 'json'
}));

spec.info("User logged in", { userId: "123", action: "login" });
```

This will produce structured JSON logs:
```json
{"timestamp":"2024-01-15T10:30:00.000Z","level":"info","message":"User logged in","context":{"userId":"123","action":"login"}}
```

## Configuration Options

```typescript
interface FileLoggerOptions {
  filePath?: string;          // Path to log file (default: './.spectral/logs.log')
  maxSize?: number;           // Max file size in bytes before rotation (default: 10MB)
  rotate?: boolean;           // Enable log rotation (default: true)
  format?: 'json' | 'text';   // Output format (default: 'json')
  includeContext?: boolean;   // Include context in logs (default: true)
  handleScope?: boolean;      // Include logger scope in logs (default: true)
}
```

## Advanced Examples

### Multiple Log Files

```typescript
import spec, { FileLoggerPlugin } from "spectrallogs";

// General application logs
const appLogger = new FileLoggerPlugin({
  filePath: './logs/app.log',
  format: 'json',
  maxSize: 50 * 1024 * 1024 // 50MB
});

// Error-specific logs
const errorLogger = new FileLoggerPlugin({
  filePath: './logs/errors.log',
  format: 'json',
  includeContext: true
});

// Audit logs
const auditLogger = new FileLoggerPlugin({
  filePath: './logs/audit.log',
  format: 'json'
});

spec.use(appLogger);
spec.use(errorLogger);
spec.use(auditLogger);
```

### Child Logger Integration

```typescript
import spec, { FileLoggerPlugin } from "spectrallogs";

// Parent logger with general configuration
const apiLogger = new SpectralLogger('api');
apiLogger.use(new FileLoggerPlugin({
  filePath: './logs/api.log',
  format: 'json',
  handleScope: true
}));

// Child loggers inherit context and can have their own file loggers
const authLogger = apiLogger.child('auth');
authLogger.use(new FileLoggerPlugin({
  filePath: './logs/auth.log',
  format: 'json'
}));

const userLogger = authLogger.child('users');
userLogger.use(new FileLoggerPlugin({
  filePath: './logs/users.log',
  format: 'json'
}));

apiLogger.info("API started");
authLogger.info("Authentication middleware loaded");
userLogger.info("User profile updated");
```

## Log Rotation

The FileLoggerPlugin includes automatic log rotation to prevent log files from growing too large:

```typescript
spec.use(new FileLoggerPlugin({
  filePath: './logs/app.log',
  format: 'json',
  maxSize: 10 * 1024 * 1024, // 10MB
  rotate: true
}));
```

When the log file exceeds `maxSize`, it will be automatically rotated with a timestamp:
- `app.log` → `app-2024-01-15T10-30-00-000Z.log`

## JSON Log Structure

Each log entry contains the following structure when using JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User action completed",
  "scope": "api.auth",
  "metadata": {
    "color": "green",
    "timestamp": true
  }
}
```

### Field Descriptions

- **timestamp**: ISO 8601 timestamp of when the log was created
- **level**: Log level (`log`, `info`, `success`, `warn`, `error`, `debug`)
- **message**: The log message content
- **scope**: Optional scope from child loggers (e.g., "api.auth.users")
- **metadata**: Internal logging metadata (color preferences, formatting options)