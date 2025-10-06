"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceBenchmark = void 0;
const perf_hooks_1 = require("perf_hooks");
class PerformanceBenchmark {
    static measure(name, fn, iterations = 1000) {
        const start = perf_hooks_1.performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = perf_hooks_1.performance.now();
        const totalTime = end - start;
        const averageTime = totalTime / iterations;
        const logsPerSecond = iterations / (totalTime / 1000);
        return {
            name,
            iterations,
            totalTime,
            averageTime,
            logsPerSecond,
        };
    }
    static compare(results) {
        console.log('\n=== Benchmark Comparison ===\n');
        results.forEach((result) => {
            console.log(`${result.name}:`);
            console.log(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
            console.log(`  Average: ${result.averageTime.toFixed(4)}ms per log`);
            console.log(`  Throughput: ${result.logsPerSecond.toFixed(0)} logs/sec`);
            console.log('');
        });
        if (results.length === 2) {
            const [first, second] = results;
            const diff = ((first.totalTime - second.totalTime) / first.totalTime) * 100;
            if (diff > 0) {
                console.log(`${second.name} is ${diff.toFixed(1)}% faster than ${first.name}`);
            }
            else {
                console.log(`${first.name} is ${Math.abs(diff).toFixed(1)}% faster than ${second.name}`);
            }
        }
    }
}
exports.PerformanceBenchmark = PerformanceBenchmark;
//# sourceMappingURL=performance.js.map