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
    writeStream;
    constructor(options = {}) {
        this.filePath = options.filePath || path.join(process.cwd(), '.spectral', 'logs.txt');
        this.maxSize = options.maxSize || 10 * 1024 * 1024;
        this.rotate = options.rotate ?? true;
    }
    init() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (this.rotate && fs.existsSync(this.filePath)) {
            const stats = fs.statSync(this.filePath);
            if (stats.size > this.maxSize) {
                this.rotateLog();
            }
        }
        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }
    rotateLog() {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const rotatedPath = this.filePath.replace('.txt', `-${timestamp}.txt`);
        try {
            fs.renameSync(this.filePath, rotatedPath);
        }
        catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }
    afterLog(message, level, options) {
        if (!this.writeStream)
            return;
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        this.writeStream.write(logEntry);
    }
    close() {
        if (this.writeStream) {
            this.writeStream.end();
        }
    }
}
exports.FileLoggerPlugin = FileLoggerPlugin;
//# sourceMappingURL=FileLogger.js.map