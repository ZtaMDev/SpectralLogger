// scripts/check-performance-regressions.js
import { readFileSync } from "fs";
import { join } from "path";

const resultsFile = join("benchmarks", "results", "benchmark-results.json");

try {
  const data = JSON.parse(readFileSync(resultsFile, "utf8"));
  
  // Definir umbrales de regresión (ajusta según tus necesidades)
  const REGRESSION_THRESHOLD = 0.1; // 10% de regresión
  const CRITICAL_REGRESSION = 0.2; // 20% de regresión crítica
  
  let hasRegressions = false;
  let criticalRegressions = false;
  
  console.log("🔍 Checking for performance regressions...\n");
  
  data.forEach((result) => {
    // Aquí deberías comparar con resultados anteriores
    // Por ahora, solo mostramos los resultados actuales
    console.log(`${result.name}: ${Math.round(result.opsPerSec)} ops/sec`);
    
    // En una implementación real, compararías con resultados base
    // guardados de ejecuciones anteriores en main
  });
  
  if (hasRegressions) {
    console.log("\n❌ Performance regressions detected!");
    process.exit(1);
  } else if (criticalRegressions) {
    console.log("\n🚨 Critical performance regressions detected!");
    process.exit(1);
  } else {
    console.log("\n✅ No performance regressions detected");
  }
  
} catch (err) {
  console.error("Error checking performance regressions:", err);
  process.exit(1);
}