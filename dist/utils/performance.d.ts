export interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    averageTime: number;
    logsPerSecond: number;
}
export declare class PerformanceBenchmark {
    static measure(name: string, fn: () => void, iterations?: number): BenchmarkResult;
    static compare(results: BenchmarkResult[]): void;
}
//# sourceMappingURL=performance.d.ts.map