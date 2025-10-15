"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralOutput = void 0;
const CACHED_NODE_ENV = process.env.NODE_ENV;
const IS_TEST_ENV = CACHED_NODE_ENV === 'test';
/**
 * Thread-safe SpectralOutput.
 * - Colas separadas por stream (stdout / stderr)
 * - Buffers con flush adaptativo
 * - safeWrite que espera el callback del stream
 * - forceFlush awaitable
 * - Manejo de errores aislado (no rompe la cola)
 */
class SpectralOutput {
    stdoutQueue = Promise.resolve();
    stderrQueue = Promise.resolve();
    stdoutBuffer = [];
    stderrBuffer = [];
    bufferSize = 10;
    flushTimer = null;
    isFlushing = false;
    config;
    constructor(config) {
        this.config = config;
        // Aseguramos flush final al salir del proceso para no perder logs.
        if (!IS_TEST_ENV) {
            process.once('beforeExit', () => {
                // fire-and-forget: no queremos bloquear shutdown excesivamente,
                // pero intentaremos vaciar buffers sin lanzar errores.
                this.forceFlush().catch(() => { });
            });
        }
    }
    /** Encola el mensaje en la secuencia segura según el nivel. */
    write(message, level, codec = 'utf-8') {
        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
        const queueKey = stream === process.stderr ? 'stderrQueue' : 'stdoutQueue';
        const bufferKey = stream === process.stderr ? 'stderrBuffer' : 'stdoutBuffer';
        const finalMessage = message.endsWith('\n') ? message : `${message}\n`;
        // Encadenar operaciones en la cola correspondiente
        this[queueKey] = this[queueKey]
            .then(async () => {
            try {
                if (this.shouldBuffer()) {
                    this[bufferKey].push(finalMessage);
                    // si el buffer está lleno hacemos flush inmediatamente
                    if (this[bufferKey].length >= this.bufferSize) {
                        await this.flushStream(stream, codec, bufferKey);
                    }
                    else {
                        this.scheduleFlush(stream, codec, bufferKey);
                    }
                }
                else {
                    await this.safeWrite(stream, finalMessage, codec);
                }
            }
            catch (err) {
                // No romper la cola; escribir error al stderr de forma síncrona segura
                try {
                    process.stderr.write(`[SpectralOutput] write error: ${err?.stack || err}\n`);
                }
                catch (_) {
                    // swallow
                }
            }
        })
            .catch((err) => {
            // Nunca dejar que una excepción rompa la cadena de promesas.
            try {
                process.stderr.write(`[SpectralOutput] queue error: ${err?.stack || err}\n`);
            }
            catch (_) { }
        });
    }
    shouldBuffer() {
        return !!this.config.getConfig().bufferWrites;
    }
    scheduleFlush(stream, codec, bufferKey) {
        if (this.flushTimer)
            return;
        const size = this[bufferKey].length || 0;
        const delay = this.adaptiveDelay(size);
        this.flushTimer = setTimeout(() => {
            // Programamos el flush en la cola correspondiente
            const queueKey = stream === process.stderr ? 'stderrQueue' : 'stdoutQueue';
            this[queueKey] = this[queueKey].then(() => this.safeFlushQueue(stream, codec, bufferKey));
        }, delay);
    }
    adaptiveDelay(size) {
        if (size >= this.bufferSize)
            return 1;
        if (size > this.bufferSize * 0.6)
            return 3;
        if (size > this.bufferSize * 0.3)
            return 6;
        return 10;
    }
    async safeWrite(stream, data, codec) {
        return new Promise((resolve, reject) => {
            // stream.write acepta callback con (err?) en algunos entornos; lo manejamos
            try {
                const ok = stream.write(data, codec, (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
                // En caso de que write no invoque callback (rare), resolvemos igual
                // cuando write devolvió true/false no indica fallo.
                if (ok === undefined) {
                    // no-op
                }
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async safeFlushQueue(stream, codec, bufferKey) {
        if (this.isFlushing)
            return;
        this.isFlushing = true;
        try {
            await this.flushStream(stream, codec, bufferKey);
        }
        catch (err) {
            try {
                process.stderr.write(`[SpectralOutput] flush error: ${err?.stack || err}\n`);
            }
            catch (_) { }
        }
        finally {
            this.isFlushing = false;
            if (this.flushTimer) {
                clearTimeout(this.flushTimer);
                this.flushTimer = null;
            }
        }
    }
    /** Volcado controlado del buffer actual (stream específico). */
    async flushStream(stream, codec, bufferKey) {
        const buffer = this[bufferKey];
        if (!buffer || buffer.length === 0)
            return;
        const content = buffer.join('');
        this[bufferKey] = [];
        await this.safeWrite(stream, content, codec);
    }
    /** Fuerza un flush inmediato y espera a que las colas terminen */
    async forceFlush(codec = 'utf-8') {
        // Esperar a que todas las colas se vacíen
        await Promise.all([this.stdoutQueue, this.stderrQueue].map(p => p.catch(() => { })));
        // Limpiar timers
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        // Volcar ambos buffers si tienen contenido
        await Promise.all([
            this.flushStream(process.stdout, codec, 'stdoutBuffer').catch(() => { }),
            this.flushStream(process.stderr, codec, 'stderrBuffer').catch(() => { }),
        ]);
    }
}
exports.SpectralOutput = SpectralOutput;
//# sourceMappingURL=SpectralOutput.js.map