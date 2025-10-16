#!/usr/bin/env ts-node

import { runImprovedLoggerBenchmark } from "./improved-benchmarks"; // ajusta el nombre si tu archivo se llama distinto
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface BenchmarkResult {
  name: string;
  totalTime: number;
  avgTime: number;
  opsPerSec: number;
  memoryUsed: number;
  iterations: number;
  gcImpact: number;
}

interface AggregatedResult {
  name: string;
  totalTimeAvg: number;
  avgTimeAvg: number;
  opsPerSecAvg: number;
  memoryUsedAvg: number;
  runs: number;
}

// === CONFIGURACIÓN ===
const RUNS = 20;
const RESULT_DIR = join(process.cwd(), "benchmarks", "results");
const SUMMARY_FILE = join(RESULT_DIR, "benchmark-summary.json");

async function runMultipleBenchmarks() {
  console.log(`🏁 Ejecutando benchmark ${RUNS} veces...\n`);

  const allRuns: BenchmarkResult[][] = [];

  for (let i = 0; i < RUNS; i++) {
    console.log(`\n🔁 EJECUCIÓN ${i + 1}/${RUNS}`);
    await runImprovedLoggerBenchmark();

    const file = join(RESULT_DIR, "improved-benchmark-results.json");
    const data: BenchmarkResult[] = JSON.parse(readFileSync(file, "utf8"));
    allRuns.push(data);
  }

  // === Agregar resultados ===
  const aggregated: Record<string, AggregatedResult> = {};

  for (const run of allRuns) {
    for (const result of run) {
      if (!aggregated[result.name]) {
        aggregated[result.name] = {
          name: result.name,
          totalTimeAvg: 0,
          avgTimeAvg: 0,
          opsPerSecAvg: 0,
          memoryUsedAvg: 0,
          runs: 0,
        };
      }
      const agg = aggregated[result.name];
      agg.totalTimeAvg += result.totalTime;
      agg.avgTimeAvg += result.avgTime;
      agg.opsPerSecAvg += result.opsPerSec;
      agg.memoryUsedAvg += result.memoryUsed;
      agg.runs++;
    }
  }

  // === Calcular promedios ===
  const finalResults = Object.values(aggregated).map(r => ({
    name: r.name,
    totalTimeAvg: r.totalTimeAvg / r.runs,
    avgTimeAvg: r.avgTimeAvg / r.runs,
    opsPerSecAvg: r.opsPerSecAvg / r.runs,
    memoryUsedAvg: r.memoryUsedAvg / r.runs,
    runs: r.runs,
  }));

  // === Ordenar por velocidad ===
  finalResults.sort((a, b) => b.opsPerSecAvg - a.opsPerSecAvg);

  // === Mostrar resumen ===
  console.log("\n" + "=".repeat(80));
  console.log("🔥 RESULTADOS PROMEDIADOS DE BENCHMARK 🔥");
  console.log("=".repeat(80));

  for (const [i, r] of finalResults.entries()) {
    console.log(`\n${i + 1}. ${r.name}`);
    console.log(`   Promedio Tiempo Total: ${r.totalTimeAvg.toFixed(2)} ms`);
    console.log(`   Promedio Tiempo/op: ${r.avgTimeAvg.toFixed(5)} ms`);
    console.log(`   ⚡ Promedio Ops/sec: ${r.opsPerSecAvg.toFixed(2)}`);
    console.log(`   Memoria Promedio: ${(r.memoryUsedAvg / 1024).toFixed(2)} KB`);
  }

  // === Comparación ===
  console.log("\n" + "-".repeat(50));
  console.log("🏆 COMPARACIÓN FINAL:");
  const fastest = finalResults[0];
  finalResults.slice(1).forEach(r => {
    const diff = ((1 - r.opsPerSecAvg / fastest.opsPerSecAvg) * 100).toFixed(1);
    console.log(`   ${r.name} es ${diff}% más lento que ${fastest.name}`);
  });

  console.log("=".repeat(80));

  // === Guardar resumen ===
  mkdirSync(RESULT_DIR, { recursive: true });
  writeFileSync(SUMMARY_FILE, JSON.stringify(finalResults, null, 2));
  console.log(`\n📁 Resultados promediados guardados en: ${SUMMARY_FILE}`);
}

runMultipleBenchmarks().catch(err => {
  console.error("❌ Error al ejecutar múltiples benchmarks:", err);
  process.exit(1);
});
