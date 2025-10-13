// scripts/generate-benchmark-report.js
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

function generateReport() {
  const artifactsDir = join(process.cwd(), 'artifacts');
  const report = [];
  
  report.push('# 📊 SpectralLogs Benchmark Report');
  report.push(`\nGenerated: ${new Date().toISOString()}`);
  report.push('\n## Results Summary\n');

  // Recopilar todos los resultados
  const allResults = [];
  
  try {
    const artifactDirs = readdirSync(artifactsDir);
    
    for (const dir of artifactDirs) {
      if (dir.startsWith('benchmark-results-')) {
        const resultsPath = join(artifactsDir, dir, 'benchmark-results.json');
        
        if (existsSync(resultsPath)) {
          const data = JSON.parse(readFileSync(resultsPath, 'utf8'));
          allResults.push({
            environment: data.environment,
            results: data.results
          });
        }
      }
    }

    // Generar tabla comparativa
    if (allResults.length > 0) {
      report.push('### Performance Comparison (ops/sec)');
      report.push('\n| Logger | Simple | Objects | Mixed Levels |');
      report.push('|--------|--------|---------|--------------|');
      
      const firstResult = allResults[0].results;
      const loggerNames = [...new Set(firstResult.map(r => r.name.split(' - ')[0]))];
      
      for (const loggerName of loggerNames) {
        const simple = firstResult.find(r => r.name === `${loggerName} - simple`);
        const objects = firstResult.find(r => r.name === `${loggerName} - objects`);
        const mixed = firstResult.find(r => r.name === `${loggerName} - mixed levels`);
        
        if (simple && objects && mixed) {
          report.push(`| ${loggerName} | ${Math.round(simple.opsPerSec).toLocaleString()} | ${Math.round(objects.opsPerSec).toLocaleString()} | ${Math.round(mixed.opsPerSec).toLocaleString()} |`);
        }
      }
    }

    // Agregar detalles por entorno
    report.push('\n## Detailed Results by Environment\n');
    
    for (const envResult of allResults) {
      const { environment, results } = envResult;
      
      report.push(`\n### ${environment.runtime} ${environment.nodeVersion} on ${environment.platform}-${environment.arch}`);
      
      // Top 3 más rápidos
      const fastest = results
        .filter(r => r.name.includes(' - simple'))
        .sort((a, b) => b.opsPerSec - a.opsPerSec)
        .slice(0, 3);
      
      if (fastest.length > 0) {
        report.push('\n**Fastest Loggers:**');
        fastest.forEach((result, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          report.push(`${medal} **${result.name}**: ${Math.round(result.opsPerSec).toLocaleString()} ops/sec`);
        });
      }
    }

    // Recomendaciones
    report.push('\n## Recommendations\n');
    report.push('- ✅ **Use SpectralLogs** for maximum performance with rich features');
    report.push('- ⚡ **Use simple stdout** if you only need basic logging without colors');
    report.push('- 🐛 **Avoid console.log** in production for performance-critical applications');
    report.push('- 📈 **Monitor memory usage** when logging large objects frequently');

  } catch (error) {
    report.push('\n❌ Error generating report: ' + error.message);
  }

  // Escribir reporte
  const reportPath = join(process.cwd(), 'benchmark-report.md');
  require('fs').writeFileSync(reportPath, report.join('\n'));
  console.log('Benchmark report generated:', reportPath);
}

generateReport();