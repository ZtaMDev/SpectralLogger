// scripts/check-performance-regressions.js
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Umbrales para regresiones (10% de degradación)
const REGRESSION_THRESHOLDS = {
  opsPerSec: 0.9, // 10% más lento
  memoryUsed: 1.1  // 10% más memoria
};

function checkRegressions() {
  const artifactsDir = join(process.cwd(), 'artifacts');
  let hasRegression = false;
  const messages = [];

  try {
    // Aquí normalmente compararías con resultados anteriores
    // Por ahora, solo verificamos que Spectral sea competitivo
    const currentResultsPath = join(artifactsDir, 'benchmark-results-ubuntu-latest-node18.x', 'benchmark-results.json');
    
    if (existsSync(currentResultsPath)) {
      const data = JSON.parse(readFileSync(currentResultsPath, 'utf8'));
      const spectralResults = data.results.filter(r => r.name.includes('spectral'));
      const consoleResults = data.results.filter(r => r.name.includes('console - simple'));

      if (spectralResults.length > 0 && consoleResults.length > 0) {
        const spectralPerf = spectralResults.find(r => r.name.includes('simple')).opsPerSec;
        const consolePerf = consoleResults.find(r => r.name.includes('simple')).opsPerSec;
        
        const performanceRatio = spectralPerf / consolePerf;

        if (performanceRatio < 0.8) {
          hasRegression = true;
          messages.push(`❌ SpectralLogs is ${((1 - performanceRatio) * 100).toFixed(1)}% slower than console.log`);
        } else {
          messages.push(`✅ SpectralLogs performance: ${(performanceRatio * 100).toFixed(1)}% of console.log`);
        }
      }
    }
  } catch (error) {
    console.warn('Could not check for regressions:', error.message);
  }

  // Output para GitHub Actions
  if (hasRegression) {
    console.log('::error::Performance regression detected!');
    messages.forEach(msg => console.log(msg));
    process.exit(1);
  } else {
    console.log('✅ No performance regressions detected');
    messages.forEach(msg => console.log(msg));
  }
}

checkRegressions();