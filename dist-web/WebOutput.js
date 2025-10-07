export class WebOutput {
    buffer = [];
    options;
    scheduled = false;
    channel;
    constructor(options = {}) {
        this.options = {
            batching: options.batching ?? true,
            maxBatchSize: options.maxBatchSize ?? 16,
            maxLatencyMs: options.maxLatencyMs ?? 8,
            sink: options.sink ?? this.defaultSink,
        };
        if (this.options.batching && typeof MessageChannel !== 'undefined') {
            this.channel = new MessageChannel();
            if (this.channel && this.channel.port1) {
                if (this.channel.port1.addEventListener) {
                    this.channel.port1.addEventListener('message', () => this.flush());
                    this.channel.port1.start?.();
                }
                else if (typeof this.channel.port1.onmessage !== 'undefined') {
                    this.channel.port1.onmessage = () => this.flush();
                }
            }
        }
    }
    writeConsoleArgs(args, _level) {
        if (!this.options.batching) {
            this.options.sink(args);
            return;
        }
        this.buffer.push({ args });
        if (this.buffer.length >= this.options.maxBatchSize) {
            this.scheduleFlush(true);
        }
        else {
            this.scheduleFlush(false);
        }
    }
    scheduleFlush(immediate) {
        if (immediate) {
            this.flush();
            return;
        }
        if (this.scheduled)
            return;
        this.scheduled = true;
        // Usa MessageChannel para microtask-like, y un timeout de seguridad
        this.channel?.port2.postMessage?.(null);
        setTimeout(() => this.flush(), this.options.maxLatencyMs);
    }
    flush() {
        if (!this.buffer.length) {
            this.scheduled = false;
            return;
        }
        const items = this.buffer;
        this.buffer = [];
        this.scheduled = false;
        // Combinar en una sola salida si el sink lo maneja; por defecto iteramos
        for (const it of items) {
            this.options.sink(it.args);
        }
    }
    defaultSink = (args) => {
        // args ya incluye formato %c y estilos
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
    };
}
//# sourceMappingURL=WebOutput.js.map