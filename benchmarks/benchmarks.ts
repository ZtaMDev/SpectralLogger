#!/usr/bin/env ts-node

import { performance } from "perf_hooks";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// =============================
// INTERFACES Y CLASES BASE
// =============================

interface Logger {
  info(message: any): void;
  error?(message: any): void;
  warn?(message: any): void;
  debug?(message: any): void;
  flush?(): void;
}

interface BenchmarkResult {
  name: string;
  totalTime: number;
  avgTime: number;
  opsPerSec: number;
  memoryUsed: number;
  iterations: number;
}

class BenchmarkRunner {
  private results: BenchmarkResult[] = [];

  constructor(private iterations: number = 10000) {}

  private formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  async runBenchmark(name: string, testFn: () => void | Promise<void>): Promise<void> {
    const startMem = this.getMemoryUsage();
    const startTime = performance.now();

    if (testFn.constructor.name === "AsyncFunction") {
      await (testFn as () => Promise<void>)();
    } else {
      (testFn as () => void)();
    }

    const endTime = performance.now();
    const endMem = this.getMemoryUsage();

    const totalTime = endTime - startTime;
    const avgTime = totalTime / this.iterations;
    const opsPerSec = (1000 / avgTime); // ✅ Cálculo corregido
    const memoryUsed = endMem - startMem;

    const result: BenchmarkResult = {
      name,
      totalTime,
      avgTime,
      opsPerSec,
      memoryUsed,
      iterations: this.iterations,
    };

    this.results.push(result);
  }

  printResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("LOGGER BENCHMARK RESULTS");
    console.log("=".repeat(80));

    this.results.sort((a, b) => b.opsPerSec - a.opsPerSec);
    const fastest = this.results[0];

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`  Time: ${result.totalTime.toFixed(2)} ms (${result.avgTime.toFixed(4)} ms/op)`);
      console.log(`  ⚡  ${Math.round(result.opsPerSec).toLocaleString()} ops/sec`);
      console.log(`  Memory: ${this.formatBytes(result.memoryUsed)}`);
    });

    if (this.results.length > 1) {
      console.log("\n" + "-".repeat(50));
      console.log("COMPARISON vs FASTEST:");
      this.results.slice(1).forEach((r) => {
        const diff = ((1 - r.opsPerSec / fastest.opsPerSec) * 100).toFixed(1);
        console.log(`  ${r.name} is ${diff}% slower`);
      });
    }

    console.log("=".repeat(80));
  }

  saveResults(filename = "benchmark-results.json"): void {
    const dir = join(process.cwd(), "benchmarks", "results");
    mkdirSync(dir, { recursive: true });
    const file = join(dir, filename);
    writeFileSync(file, JSON.stringify(this.results, null, 2));
    console.log(`\nResults saved to: ${file}`);
  }
}

// =============================
// CARGA DINÁMICA DE LOGGERS
// =============================

async function loadLoggers(): Promise<Record<string, Logger>> {
  const loggers: Record<string, Logger> = {};

  // Logger nativo (base de comparación)
  loggers["console"] = {
    info: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
    warn: (msg) => console.warn(msg),
    debug: (msg) => console.debug(msg),
  };

  // Pino
  try {
    const { default: pino } = await import("pino");
    loggers["pino"] = pino();
  } catch {
    console.warn("Pino not available.");
  }

  // Winston
  try {
    const winston = await import("winston");
    loggers["winston"] = winston.createLogger({
      level: "info",
      transports: [new winston.transports.Console()],
    });
  } catch {
    console.warn("Winston not available.");
  }

  // Log4js
  try {
    const log4js = await import("log4js");
    log4js.configure({
      appenders: { out: { type: "stdout" } },
      categories: { default: { appenders: ["out"], level: "info" } },
    });
    loggers["log4js"] = log4js.getLogger();
  } catch {
    console.warn("Log4js not available.");
  }

  // SpectralLogs
  try {
    const { default: spectral } = await import("spectrallogs");
    loggers["spectrallogs"] = spectral;
  } catch {
    console.warn("SpectralLogs not available.");
  }

  return loggers;
}

// =============================
// BENCHMARK PRINCIPAL
// =============================

async function runLoggerBenchmark(): Promise<void> {
  const runner = new BenchmarkRunner(10000);
  const loggers = await loadLoggers();

  console.log(`\nRunning benchmark with ${Object.keys(loggers).length} loggers...\n`);

  for (const [name, logger] of Object.entries(loggers)) {
    await runner.runBenchmark(`${name} - simple`, () => {
      for (let i = 0; i < runner["iterations"]; i++) {
        logger.info(`Message ${i}`);
      }
      if (logger.flush) logger.flush();
    });
  }

  runner.printResults();
  runner.saveResults();
}

// =============================
// MAIN
// =============================

if (require.main === module) {
  runLoggerBenchmark().catch((err) => {
    console.error("Benchmark failed:", err);
  });
}

export { BenchmarkRunner, runLoggerBenchmark };
