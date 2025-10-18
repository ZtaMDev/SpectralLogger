"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralOutput = void 0;
const CACHED_NODE_ENV = process.env.NODE_ENV;
const IS_TEST_ENV = CACHED_NODE_ENV === 'test';
/**
 * SpectralOutput simplificado y sincronizado
 */
class SpectralOutput {
    config;
    pendingWrites = Promise.resolve();
    writeLock = Promise.resolve();
    constructor(config) {
        this.config = config;
        if (!IS_TEST_ENV) {
            process.once('beforeExit', async () => {
                await this.forceFlush().catch(() => { });
            });
        }
    }
    /**
     * Escritura sincronizada que mantiene el orden estricto
     */
    async write(message, level, codec = 'utf-8') {
        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
        const finalMessage = message.endsWith('\n') ? message : `${message}\n`;
        // Usamos un lock para garantizar orden estricto
        this.pendingWrites = this.pendingWrites.then(async () => {
            await this.writeLock;
            if (this.shouldBuffer()) {
                // Buffering mínimo con flush inmediato para mantener orden
                await this.bufferedWrite(stream, finalMessage, codec);
            }
            else {
                await this.directWrite(stream, finalMessage, codec);
            }
        });
        return this.pendingWrites;
    }
    shouldBuffer() {
        return !!this.config.getConfig().bufferWrites;
    }
    async bufferedWrite(stream, data, codec) {
        return new Promise((resolve, reject) => {
            const ok = stream.write(data, codec, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
            if (!ok) {
                stream.once('drain', () => resolve());
            }
            else if (ok === undefined) {
                // Para streams que no llaman el callback
                setImmediate(resolve);
            }
        });
    }
    async directWrite(stream, data, codec) {
        return new Promise((resolve, reject) => {
            try {
                const ok = stream.write(data, codec, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
                if (!ok) {
                    stream.once('drain', () => resolve());
                }
                else if (ok === undefined) {
                    setImmediate(resolve);
                }
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /** Fuerza flush esperando a todas las escrituras pendientes */
    async forceFlush(codec = 'utf-8') {
        // Esperar a que todas las escrituras pendientes terminen
        await this.pendingWrites;
        // Forzar drain de ambos streams
        await new Promise((resolve) => {
            if (process.stdout.writableNeedDrain || process.stderr.writableNeedDrain) {
                const checkDrain = () => {
                    if (!process.stdout.writableNeedDrain && !process.stderr.writableNeedDrain) {
                        resolve();
                    }
                    else {
                        setImmediate(checkDrain);
                    }
                };
                checkDrain();
            }
            else {
                resolve();
            }
        });
    }
}
exports.SpectralOutput = SpectralOutput;
//# sourceMappingURL=SpectralOutput.js.map