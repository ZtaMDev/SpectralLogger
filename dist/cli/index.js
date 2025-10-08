#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const SpectralLogger_1 = require("../core/SpectralLogger");
const perf_hooks_1 = require("perf_hooks");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const spec = new SpectralLogger_1.SpectralLogger();
const args = process.argv.slice(2);
function showVersion() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
    spec.info(`Spectral v${packageJson.version}`);
}
function openDocs() {
    const url = 'https://ztamdev.github.io/SpectralLogs/getting-started.html';
    try {
        const { spawn } = require('child_process');
        const isWin = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        let cmd = '';
        let args = [];
        if (isWin) {
            cmd = 'cmd';
            args = ['/c', 'start', '""', url];
        }
        else if (isMac) {
            cmd = 'open';
            args = [url];
        }
        else {
            cmd = 'xdg-open';
            args = [url];
        }
        const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
        child.on('error', (err) => {
            spec.error(`Failed to open browser: ${err?.message || err}`);
            spec.info(`Open manually: ${url}`);
        });
        child.unref();
        spec.success('Opening SpectralLogs documentation...');
        spec.info(url);
    }
    catch (e) {
        spec.error('Could not open the documentation automatically.');
        spec.info(`Open manually: ${url}`);
    }
}
function showHelp() {
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
  docs                Open SpectralLogs docs in your default browser

Examples:
  spec --version
  spec config
  spec config set debugMode=true
  spec bench
  spec doctor
`);
}
function showConfig() {
    const config = spec.getConfig();
    spec.info('Current Spectral Configuration:');
    console.log(JSON.stringify(config, null, 2));
}
function setConfig(keyValue) {
    const [key, value] = keyValue.split('=');
    if (!key || !value) {
        spec.error('Invalid format. Use: config set <key>=<value>');
        return;
    }
    const config = {};
    if (key === 'debugMode' || key === 'showTimestamp' || key === 'showLevel') {
        config[key] = value === 'true';
    }
    else if (key === 'codec') {
        config[key] = value;
    }
    else if (key === 'timeFormat') {
        config[key] = value;
    }
    else if (key.startsWith('colors.')) {
        const colorKey = key.split('.')[1];
        config.colors = { [colorKey]: value };
    }
    else {
        spec.error(`Unknown configuration key: ${key}`);
        return;
    }
    spec.configure(config);
    spec.success(`Configuration updated: ${key} = ${value}`);
}
function resetConfig() {
    const { SpectralConfig } = require('../core/SpectralConfig');
    SpectralConfig.getInstance().reset();
    spec.success('Configuration reset to defaults');
}
function runBenchmark() {
    spec.info('Running performance benchmark...');
    console.log('');
    const iterations = 10000;
    const consoleStart = perf_hooks_1.performance.now();
    for (let i = 0; i < iterations; i++) {
        console.log(`Benchmark test ${i}`);
    }
    const consoleEnd = perf_hooks_1.performance.now();
    const consoleTime = consoleEnd - consoleStart;
    const spectralStart = perf_hooks_1.performance.now();
    for (let i = 0; i < iterations; i++) {
        spec.log(`Benchmark test ${i}`);
    }
    spec.flush();
    const spectralEnd = perf_hooks_1.performance.now();
    const spectralTime = spectralEnd - spectralStart;
    console.log('');
    spec.success('Benchmark Results:');
    console.log(`  console.log: ${consoleTime.toFixed(2)}ms (${(iterations / (consoleTime / 1000)).toFixed(0)} logs/sec)`);
    console.log(`  Spectral:    ${spectralTime.toFixed(2)}ms (${(iterations / (spectralTime / 1000)).toFixed(0)} logs/sec)`);
    const diff = ((consoleTime - spectralTime) / consoleTime * 100);
    if (diff > 0) {
        console.log(`  Spectral is ${diff.toFixed(1)}% faster! 🚀`);
    }
    else {
        console.log(`  console.log is ${Math.abs(diff).toFixed(1)}% faster`);
    }
}
function runDoctor() {
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
        }
        else if (args[1] === 'reset') {
            resetConfig();
        }
        else {
            showConfig();
        }
        break;
    case 'bench':
        runBenchmark();
        break;
    case 'doctor':
        runDoctor();
        break;
    case 'docs':
        openDocs();
        break;
    default:
        if (command) {
            spec.error(`Unknown command: ${command}`);
        }
        showHelp();
        break;
}
//# sourceMappingURL=index.js.map