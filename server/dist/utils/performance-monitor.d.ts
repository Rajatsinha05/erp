export interface PerformanceMetrics {
    operation: string;
    duration: number;
    timestamp: Date;
    metadata?: any;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
}
export interface PerformanceThresholds {
    warning: number;
    critical: number;
}
export declare class PerformanceMonitor {
    private static metrics;
    private static maxMetrics;
    private static thresholds;
    static startTracking(operation: string, metadata?: any): PerformanceTracker;
    static recordMetric(metric: PerformanceMetrics): void;
    static getStats(operation?: string, timeRange?: {
        start: Date;
        end: Date;
    }): any;
    static getSlowOperations(threshold?: number): PerformanceMetrics[];
    static clearMetrics(): void;
    static setThresholds(category: string, thresholds: PerformanceThresholds): void;
    private static checkThresholds;
    private static getCategory;
    private static getPercentile;
}
export declare class PerformanceTracker {
    private startTime;
    private startCpuUsage;
    private operation;
    private metadata?;
    constructor(operation: string, metadata?: any);
    end(additionalMetadata?: any): PerformanceMetrics;
    getCurrentDuration(): number;
}
export declare function performanceTrack(category?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function performanceMiddleware(): (req: any, res: any, next: any) => void;
export default PerformanceMonitor;
//# sourceMappingURL=performance-monitor.d.ts.map