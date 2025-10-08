# API Reference (Summary)

This page summarizes the main public classes and methods. For full details, see JSDoc hovers or TypeDoc output.

## Node Entry (`spectrallogs`)

- **Class** `SpectralLogger`
  - `configure(options)` — update configuration at runtime
  - `use(plugin)` — register a plugin
  - `log/info/success/warn/error/debug(message, color?, codec?)`
  - `flush()` — force flush buffered output
  - `getConfig()` — resolved config
  - `getErrorStats()` / `clearErrorCache()`

- **Plugins**
  - `FileLoggerPlugin(options?)` — writes to file with rotation
  - `PerformanceTrackerPlugin()` — measures logging durations

- **Types** (from `src/types.d.ts`)
  - `LogLevel`, `SpectralConfigOptions`, `LogOptions`, `Plugin`, `ColorInput`

## Web Entry (`spectrallogs/web`)

- **Class** `SpectralLoggerWeb`
  - `configure(options)` — update configuration
  - `use(plugin)` — register a web plugin
  - `log/info/success/warn/error/debug(message, color?)`
  - `flush()`
  - `getConfig()` — resolved config
  - `getErrorStats()` / `clearErrorCache()`

- **Web Output**
  - Batching options via `new SpectralLoggerWeb({ batching, maxBatchSize, maxLatencyMs, sink })`

- **Plugins**
  - `PerformanceTrackerWeb()` — measures durations using `performance.now()`

## Notes

- Node build uses ANSI colors and stdout/stderr buffering.
- Web build uses CSS colors and console/DOM sinks with batching.
