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