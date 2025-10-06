"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralOutput = void 0;
class SpectralOutput {
    buffer = [];
    bufferSize = 10;
    flushTimer = null;
    write(message, level, codec = 'utf-8') {
        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
        const finalMessage = message.endsWith('\n') ? message : `${message}\n`;
        if (this.shouldBuffer()) {
            this.buffer.push(finalMessage);
            if (this.buffer.length >= this.bufferSize) {
                this.flush(stream, codec);
            }
            else {
                this.scheduleFlush(stream, codec);
            }
        }
        else {
            stream.write(finalMessage, codec);
        }
    }
    shouldBuffer() {
        return process.env.NODE_ENV !== 'test';
    }
    scheduleFlush(stream, codec) {
        if (this.flushTimer)
            return;
        this.flushTimer = setTimeout(() => {
            this.flush(stream, codec);
        }, 10);
    }
    flush(stream, codec) {
        if (this.buffer.length === 0)
            return;
        const content = this.buffer.join('');
        stream.write(content, codec);
        this.buffer = [];
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
    }
    forceFlush(codec = 'utf-8') {
        if (this.buffer.length > 0) {
            this.flush(process.stdout, codec);
        }
    }
}
exports.SpectralOutput = SpectralOutput;
//# sourceMappingURL=SpectralOutput.js.map