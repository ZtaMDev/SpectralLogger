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
exports.FileLoggerPlugin = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileLoggerPlugin {
    name = 'FileLogger';
    filePath;
    maxSize;
    rotate;
    format;
    includeContext;
    handleScope;
    writeStream;
    currentSize = 0;
    scope;
    constructor(options = {}) {
        this.filePath = options.filePath || path.join(process.cwd(), '.spectral', 'logs.json');
        this.maxSize = options.maxSize || 10 * 1024 * 1024;
        this.rotate = options.rotate ?? true;
        this.format = options.format || 'json';
        this.includeContext = options.includeContext ?? true;
        this.handleScope = options.handleScope ?? true;
        this.name = `FileLogger-${Math.random().toString(36).substring(2, 9)}`;
    }
    init(logger) {
        this.scope = logger.scope;
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (fs.existsSync(this.filePath)) {
            const stats = fs.statSync(this.filePath);
            this.currentSize = stats.size;
            if (this.rotate && this.currentSize > this.maxSize) {
                this.rotateLog();
            }
        }
        this.writeStream = fs.createWriteStream(this.filePath, {
            flags: 'a',
            encoding: 'utf8'
        });
    }
    rotateLog() {
        if (!this.writeStream)
            return;
        this.writeStream.end();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(this.filePath);
        const baseName = path.basename(this.filePath, ext);
        const dir = path.dirname(this.filePath);
        const rotatedPath = path.join(dir, `${baseName}-${timestamp}${ext}`);
        try {
            fs.renameSync(this.filePath, rotatedPath);
        }
        catch (error) {
            console.error('Failed to rotate log file:', error);
        }
        this.writeStream = fs.createWriteStream(this.filePath, {
            flags: 'a',
            encoding: 'utf8'
        });
        this.currentSize = 0;
    }
    afterLog(message, level, options) {
        if (!this.writeStream)
            return;
        const logEntry = this.createLogEntry(message, level, options);
        const logLine = this.formatLogEntry(logEntry);
        if (this.rotate && (this.currentSize + Buffer.byteLength(logLine, 'utf8')) > this.maxSize) {
            this.rotateLog();
        }
        this.writeStream.write(logLine);
        this.currentSize += Buffer.byteLength(logLine, 'utf8');
    }
    createLogEntry(message, level, options) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };
        if (this.handleScope && this.scope) {
            entry.scope = this.scope;
        }
        if (this.includeContext && options?.context) {
            entry.context = options.context;
        }
        if (options) {
            const metadata = { ...options };
            delete metadata.context;
            if (Object.keys(metadata).length > 0) {
                entry.metadata = metadata;
            }
        }
        return entry;
    }
    formatLogEntry(entry) {
        if (this.format === 'json') {
            return JSON.stringify(entry) + '\n';
        }
        else {
            const timestamp = entry.timestamp;
            const level = entry.level.toUpperCase().padEnd(7);
            const scope = entry.scope ? `[${entry.scope}]` : '';
            const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
            const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
            return `[${timestamp}] ${level}${scope} ${entry.message}${context}${metadata}\n`;
        }
    }
    close() {
        if (this.writeStream) {
            this.writeStream.end();
        }
    }
    createForChild(childScope) {
        const childOptions = {
            filePath: this.filePath,
            maxSize: this.maxSize,
            rotate: this.rotate,
            format: this.format,
            includeContext: this.includeContext,
            handleScope: this.handleScope
        };
        const childPlugin = new FileLoggerPlugin(childOptions);
        const originalInit = childPlugin.init.bind(childPlugin);
        childPlugin.init = (logger) => {
            originalInit(logger);
        };
        return childPlugin;
    }
}
exports.FileLoggerPlugin = FileLoggerPlugin;
//# sourceMappingURL=FileLogger.js.map