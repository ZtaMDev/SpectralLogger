#!/usr/bin/env ts-node

import { performance } from "perf_hooks";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

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
  gcImpact: number;
}

class ImprovedBenchmarkRunner {
  private results: BenchmarkResult[] = [];
  private gcTimes: number = 0;

  constructor(private iterations: number = 10000) {}

  private async forceGc(): Promise<void> {
    if (global.gc) {
      global.gc();
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  private getMemoryUsage(): number {
    const mem = process.memoryUsage();
    return mem.heapUsed + mem.external + mem.arrayBuffers;
  }

  async runBenchmark(
    name: string, 
    testFn: () => void | Promise<void>,
    warmupIterations: number = 1000
  ): Promise<void> {
    
    // 1. Warm-up phase
    console.log(`Warming up ${name}...`);
    for (let i = 0; i < warmupIterations; i++) {
      await this.executeTest(testFn);
    }
    
    // 2. Force GC and get baseline memory
    await this.forceGc();
    const startMem = this.getMemoryUsage();
    
    // 3. Actual benchmark
    const startTime = performance.now();
    
    for (let i = 0; i < this.iterations; i++) {
      await this.executeTest(testFn);
    }
    
    // 4. Ensure async operations complete
    if ((testFn as any).flush) await (testFn as any).flush();
    await new Promise(resolve => setImmediate(resolve));
    
    const endTime = performance.now();
    
    // 5. Final memory measurement
    await this.forceGc();
    const endMem = this.getMemoryUsage();

    const totalTime = endTime - startTime;
    const avgTime = totalTime / this.iterations;
    const opsPerSec = 1000 / avgTime;

    const result: BenchmarkResult = {
      name,
      totalTime,
      avgTime,
      opsPerSec,
      memoryUsed: Math.max(0, endMem - startMem),
      iterations: this.iterations,
      gcImpact: this.gcTimes
    };

    this.results.push(result);
    console.log(`Completed ${name}: ${Math.round(opsPerSec)} ops/sec`);
  }

  private async executeTest(testFn: () => void | Promise<void>): Promise<void> {
    if (testFn.constructor.name === "AsyncFunction") {
      await (testFn as () => Promise<void>)();
    } else {
      (testFn as () => void)();
    }
  }

  printResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("IMPROVED LOGGER BENCHMARK RESULTS");
    console.log("=".repeat(80));

    this.results.sort((a, b) => b.opsPerSec - a.opsPerSec);
    
    this.results.forEach((result, index) => {
      const speedRank = this.results.findIndex(r => r.name === result.name) + 1;
      console.log(`\n${speedRank}. ${result.name}`);
      console.log(`  Time: ${result.totalTime.toFixed(2)}ms (${result.avgTime.toFixed(4)}ms/op)`);
      console.log(`  ⚡  ${Math.round(result.opsPerSec).toLocaleString()} ops/sec`);
      console.log(`  Memory: ${this.formatBytes(result.memoryUsed)}`);
    });

    if (this.results.length > 1) {
      console.log("\n" + "-".repeat(50));
      console.log("PERFORMANCE COMPARISON:");
      const fastest = this.results[0];
      this.results.slice(1).forEach((r) => {
        const diff = ((1 - r.opsPerSec / fastest.opsPerSec) * 100).toFixed(1);
        console.log(`  ${r.name} is ${diff}% slower than ${fastest.name}`);
      });
    }

    console.log("=".repeat(80));
  }

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

async function runImprovedLoggerBenchmark(): Promise<void> {
  const runner = new ImprovedBenchmarkRunner(10000);
  const loggers = await loadLoggers();

  console.log(`\nRunning improved benchmark with ${Object.keys(loggers).length} loggers...\n`);

  for (const [name, logger] of Object.entries(loggers)) {
    await runner.runBenchmark(`${name} - simple`, () => {
      logger.info(`Test log message`);
    });
  }

  runner.printResults();
  runner.saveResults("improved-benchmark-results.json");
}

// =============================
// MAIN
// =============================

if (require.main === module) {
  runImprovedLoggerBenchmark().catch((err) => {
    console.error("Improved benchmark failed:", err);
    process.exit(1);
  });
}

export { ImprovedBenchmarkRunner, runImprovedLoggerBenchmark };