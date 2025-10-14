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
spec.configure({
    showTimestamp: false,
    showLevel: false,
    debugMode: false,
    bufferWrites: true,
    timeFormat: 'iso',
    asyncStacks: true,
    colors: {
        info: '#00bfff',
        success: '#00ff88',
        warn: '#ffaa00',
        error: '#ff5555',
        log: '#dddddd',
        debug: '#cc66ff',
    },
});
/* ────────────────────────────────────────────────
 * CONFIG DEFAULTS + VALIDATION
 * ──────────────────────────────────────────────── */
const DEFAULT_CONF = {
    showTimestamp: true,
    showLevel: true,
    debugMode: false,
    bufferWrites: true,
    timeFormat: 'iso',
    asyncStacks: true,
    colors: {
        info: '#00bfff',
        success: '#00ff88',
        warn: '#ffaa00',
        error: '#ff5555',
        log: '#dddddd',
        debug: '#cc66ff',
    },
};
function validateSpectralConf(conf) {
    if (typeof conf !== 'object' || conf === null)
        return false;
    const allowedKeys = [
        'showTimestamp',
        'showLevel',
        'debugMode',
        'bufferWrites',
        'timeFormat',
        'asyncStacks',
        'colors',
    ];
    const invalidKeys = Object.keys(conf).filter(k => !allowedKeys.includes(k));
    if (invalidKeys.length > 0) {
        spec.warn(`Unknown config keys: ${invalidKeys.join(', ')}`);
    }
    if (conf.showTimestamp !== undefined && typeof conf.showTimestamp !== 'boolean')
        return false;
    if (conf.showLevel !== undefined && typeof conf.showLevel !== 'boolean')
        return false;
    if (conf.debugMode !== undefined && typeof conf.debugMode !== 'boolean')
        return false;
    if (conf.bufferWrites !== undefined && typeof conf.bufferWrites !== 'boolean')
        return false;
    if (conf.asyncStacks !== undefined && typeof conf.asyncStacks !== 'boolean')
        return false;
    if (conf.timeFormat !== undefined &&
        !['iso', 'unix', 'locale'].includes(conf.timeFormat))
        return false;
    if (conf.colors !== undefined) {
        if (typeof conf.colors !== 'object' || Array.isArray(conf.colors))
            return false;
        for (const [k, v] of Object.entries(conf.colors)) {
            if (typeof v !== 'string' || !v.startsWith('#')) {
                spec.warn(`Invalid color for "${k}": ${v}`);
                return false;
            }
        }
    }
    return true;
}
function findProjectRoot(startDir = process.cwd()) {
    let dir = startDir;
    while (dir !== path.parse(dir).root) {
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg.dependencies?.spectrallogs || pkg.devDependencies?.spectrallogs) {
                return dir;
            }
        }
        dir = path.dirname(dir);
    }
    return null;
}
function findSpecConf(startDir = process.cwd()) {
    let found = null;
    const search = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isFile() && entry.name === 'specConf.js') {
                found = fullPath;
                return;
            }
            if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
                search(fullPath);
                if (found)
                    return;
            }
        }
    };
    try {
        search(startDir);
    }
    catch (_) { }
    return found;
}
function getSpecConfPath() {
    const projectRoot = findProjectRoot() || process.cwd();
    const existingConf = findSpecConf(projectRoot);
    return existingConf || path.join(projectRoot, 'specConf.js');
}
function ensureSpecConf() {
    const confPath = getSpecConfPath();
    if (!fs.existsSync(confPath)) {
        fs.writeFileSync(confPath, `export default ${JSON.stringify(DEFAULT_CONF, null, 2)};\n`, 'utf-8');
        spec.success(`Created default specConf.js at ${confPath}`);
        return DEFAULT_CONF;
    }
    const fileData = fs.readFileSync(confPath, 'utf-8');
    const match = fileData.match(/export\s+default\s+(\{[\s\S]*\});?/);
    if (!match) {
        spec.error('specConf.js is invalid — missing "export default" object.');
        process.exit(1);
    }
    let conf;
    try {
        conf = eval('(' + match[1] + ')');
    }
    catch {
        spec.error('Failed to parse specConf.js');
        process.exit(1);
    }
    if (!validateSpectralConf(conf)) {
        spec.error('specConf.js contains invalid values.');
        process.exit(1);
    }
    return conf;
}
/* ────────────────────────────────────────────────
 * CONFIG COMMANDS (updated)
 * ──────────────────────────────────────────────── */
function setConfig(keyValue) {
    const [key, value] = keyValue.split('=');
    if (!key || value === undefined) {
        spec.error('Invalid format. Use: config set <key>=<value>');
        return;
    }
    const confPath = getSpecConfPath();
    const conf = ensureSpecConf();
    if (key.startsWith('colors.')) {
        const colorKey = key.split('.')[1];
        if (!conf.colors)
            conf.colors = {};
        conf.colors[colorKey] = value;
    }
    else {
        const parsed = value === 'true' ? true :
            value === 'false' ? false :
                !isNaN(Number(value)) ? Number(value) :
                    value;
        conf[key] = parsed;
    }
    if (!validateSpectralConf(conf)) {
        spec.error(`Invalid configuration value for key: ${key}`);
        return;
    }
    fs.writeFileSync(confPath, `export default ${JSON.stringify(conf, null, 2)};\n`, 'utf-8');
    spec.success(`Updated ${key} = ${value} in specConf.js`);
}
function resetConfig() {
    const confPath = getSpecConfPath();
    fs.writeFileSync(confPath, `export default ${JSON.stringify(DEFAULT_CONF, null, 2)};\n`, 'utf-8');
    spec.success(`Reset configuration to defaults at ${confPath}`);
}
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
    spec.log(`
${spec.color('Spectral CLI - The fastest logging library for Node / Bun / TypeScript', '#00bfff')}

${spec.color('Usage:', '#00bfff')}
  spec ${spec.color("[command]", "#2bff00ff")} ${spec.color("[options]", "#8c00ffff")}

${spec.color('Commands:', '#00bfff')}
  --version, -v       Show version
  --help, -h          Show this help
  config              Show current configuration
  config set <key>=<value>  Set configuration value
  config reset        Reset to default configuration
  bench               Run performance benchmark
  doctor              Diagnose environment and color support
  docs                Open SpectralLogs docs in your default browser

${spec.color('Examples:', '#00bfff')}
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
    spec.log(JSON.stringify(config, null, 2));
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
        spec.log(`Benchmark test ${i}`, '#00bfff');
    }
    spec.flush();
    const spectralEnd = perf_hooks_1.performance.now();
    const spectralTime = spectralEnd - spectralStart;
    spec.log('');
    spec.log('Benchmark Results:');
    spec.log(`  console.log: ${consoleTime.toFixed(2)}ms (${(iterations / (consoleTime / 1000)).toFixed(0)} logs/sec)`);
    spec.log(`  Spectral:    ${spectralTime.toFixed(2)}ms (${(iterations / (spectralTime / 1000)).toFixed(0)} logs/sec)`);
    const diff = ((consoleTime - spectralTime) / consoleTime * 100);
    if (diff > 0) {
        spec.log(`  Spectral is ${diff.toFixed(1)}% faster! 🚀`);
    }
    else {
        spec.log(`  console.log is ${Math.abs(diff).toFixed(1)}% faster`);
    }
}
function runDoctor() {
    spec.info('Spectral Environment Diagnostics');
    spec.log('');
    const env = process.env;
    const isTTY = process.stdout.isTTY;
    spec.log('Environment:');
    spec.log(`  Node Version: ${process.version}`);
    spec.log(`  Platform: ${process.platform}`);
    spec.log(`  Architecture: ${process.arch}`);
    spec.log('');
    spec.log('Terminal Support:');
    spec.log(`  TTY: ${isTTY ? 'Yes' : 'No'}`);
    spec.log(`  COLORTERM: ${env.COLORTERM || 'not set'}`);
    spec.log(`  TERM: ${env.TERM || 'not set'}`);
    spec.log('');
    const { detectColorSupport } = require('../utils/colors');
    const colorSupport = detectColorSupport();
    spec.success(`Color Support: ${colorSupport ? 'Enabled' : 'Disabled'}`);
    if (colorSupport) {
        spec.log('');
        spec.log('Color Test:');
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