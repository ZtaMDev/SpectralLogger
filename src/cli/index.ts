#!/usr/bin/env node

import { SpectralLogger } from '../core/SpectralLogger';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

const spec = new SpectralLogger();
const args = process.argv.slice(2);

function showVersion(): void {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
  );
  spec.info(`Spectral v${packageJson.version}`);
}

function showHelp(): void {
  console.log(`
Spectral CLI - The fastest logging library for Node.js

Usage:
  spec [command] [options]

Commands:
  --version, -v       Show version
  --help, -h          Show this help
  config              Show current configuration
  config set <key>=<value>  Set configuration value
  config reset        Reset to default configuration
  bench               Run performance benchmark
  doctor              Diagnose environment and color support

Examples:
  spec --version
  spec config
  spec config set debugMode=true
  spec bench
  spec doctor
`);
}

function showConfig(): void {
  const config = spec.getConfig();
  spec.info('Current Spectral Configuration:');
  console.log(JSON.stringify(config, null, 2));
}

function setConfig(keyValue: string): void {
  const [key, value] = keyValue.split('=');

  if (!key || !value) {
    spec.error('Invalid format. Use: config set <key>=<value>');
    return;
  }

  const config: any = {};

  if (key === 'debugMode' || key === 'showTimestamp' || key === 'showLevel') {
    config[key] = value === 'true';
  } else if (key === 'codec') {
    config[key] = value;
  } else if (key === 'timeFormat') {
    config[key] = value;
  } else if (key.startsWith('colors.')) {
    const colorKey = key.split('.')[1];
    config.colors = { [colorKey]: value };
  } else {
    spec.error(`Unknown configuration key: ${key}`);
    return;
  }

  spec.configure(config);
  spec.success(`Configuration updated: ${key} = ${value}`);
}

function resetConfig(): void {
  const { SpectralConfig } = require('../core/SpectralConfig');
  SpectralConfig.getInstance().reset();
  spec.success('Configuration reset to defaults');
}

function runBenchmark(): void {
  spec.info('Running performance benchmark...');
  console.log('');

  const iterations = 10000;

  const consoleStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    console.log(`Benchmark test ${i}`);
  }
  const consoleEnd = performance.now();
  const consoleTime = consoleEnd - consoleStart;

  const spectralStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    spec.log(`Benchmark test ${i}`);
  }
  spec.flush();
  const spectralEnd = performance.now();
  const spectralTime = spectralEnd - spectralStart;

  console.log('');
  spec.success('Benchmark Results:');
  console.log(`  console.log: ${consoleTime.toFixed(2)}ms (${(iterations / (consoleTime / 1000)).toFixed(0)} logs/sec)`);
  console.log(`  Spectral:    ${spectralTime.toFixed(2)}ms (${(iterations / (spectralTime / 1000)).toFixed(0)} logs/sec)`);

  const diff = ((consoleTime - spectralTime) / consoleTime * 100);
  if (diff > 0) {
    console.log(`  Spectral is ${diff.toFixed(1)}% faster! 🚀`);
  } else {
    console.log(`  console.log is ${Math.abs(diff).toFixed(1)}% faster`);
  }
}

function runDoctor(): void {
  spec.info('Spectral Environment Diagnostics');
  console.log('');

  const env = process.env;
  const isTTY = process.stdout.isTTY;

  console.log('Environment:');
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Architecture: ${process.arch}`);
  console.log('');

  console.log('Terminal Support:');
  console.log(`  TTY: ${isTTY ? 'Yes' : 'No'}`);
  console.log(`  COLORTERM: ${env.COLORTERM || 'not set'}`);
  console.log(`  TERM: ${env.TERM || 'not set'}`);
  console.log('');

  const { detectColorSupport } = require('../utils/colors');
  const colorSupport = detectColorSupport();

  spec.success(`Color Support: ${colorSupport ? 'Enabled' : 'Disabled'}`);

  if (colorSupport) {
    console.log('');
    console.log('Color Test:');
    spec.log('  Default log', '#dddddd');
    spec.info('  Info message', '#00bfff');
    spec.success('  Success message', '#00ff88');
    spec.warn('  Warning message', '#ffaa00');
    spec.error('  Error message', '#ff5555');
  }
}

const command = args[0];

switch (command) {
  case '--version':
  case '-v':
    showVersion();
    break;

  case '--help':
  case '-h':
    showHelp();
    break;

  case 'config':
    if (args[1] === 'set' && args[2]) {
      setConfig(args[2]);
    } else if (args[1] === 'reset') {
      resetConfig();
    } else {
      showConfig();
    }
    break;

  case 'bench':
    runBenchmark();
    break;

  case 'doctor':
    runDoctor();
    break;

  default:
    if (command) {
      spec.error(`Unknown command: ${command}`);
    }
    showHelp();
    break;
}
