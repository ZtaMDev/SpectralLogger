// scripts/generate-improved-report.js
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const resultsFile = join("benchmarks", "results", "improved-benchmark-results.json");
const reportFile = join("benchmarks", "results", "improved-benchmark-report.md");

try {
  const data = JSON.parse(readFileSync(resultsFile, "utf8"));

  let report = "# Improved Benchmark Report\n\n";
  report += "*Generated with GC optimization and warm-up phases*\n\n";

  // Sort by performance
  data.sort((a, b) => b.opsPerSec - a.opsPerSec);

  data.forEach((r, i) => {
    report += `## ${i + 1}. ${r.name}\n`;
    report += `- **Total Time**: ${r.totalTime.toFixed(2)} ms\n`;
    report += `- **Avg Time per op**: ${r.avgTime.toFixed(4)} ms\n`;
    report += `- **Ops/sec**: ${Math.round(r.opsPerSec).toLocaleString()}\n`;
    report += `- **Memory Used**: ${(r.memoryUsed / 1024 / 1024).toFixed(2)} MB\n`;
    report += `- **Iterations**: ${r.iterations.toLocaleString()}\n\n`;
  });

  // Performance comparison
  if (data.length > 1) {
    report += "## Performance Comparison\n\n";
    const fastest = data[0];
    data.slice(1).forEach((r) => {
      const diff = ((1 - r.opsPerSec / fastest.opsPerSec) * 100).toFixed(1);
      report += `- ${r.name} is ${diff}% slower than ${fastest.name}\n`;
    });
  }

  writeFileSync(reportFile, report);
  console.log("Improved benchmark report generated at", reportFile);
} catch (err) {
  console.error("Error generating improved report:", err);
  process.exit(1);
}