// scripts/generate-benchmark-report.js
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const resultsFile = join("benchmarks", "results", "benchmark-results.json");
const reportFile = join("benchmarks", "results", "benchmark-report.md");

try {
  const data = JSON.parse(readFileSync(resultsFile, "utf8"));

  let report = "# Benchmark Report\n\n";

  data.forEach((r, i) => {
    report += `## ${i + 1}. ${r.name}\n`;
    report += `- Total Time: ${r.totalTime.toFixed(2)} ms\n`;
    report += `- Avg Time per op: ${r.avgTime.toFixed(4)} ms\n`;
    report += `- Ops/sec: ${Math.round(r.opsPerSec).toLocaleString()}\n`;
    report += `- Memory Used: ${r.memoryUsed} bytes\n\n`;
  });

  writeFileSync(reportFile, report);
  console.log("Benchmark report generated at", reportFile);
} catch (err) {
  console.error("Error generating report:", err);
  process.exit(1);
}
