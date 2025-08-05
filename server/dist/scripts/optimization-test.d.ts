export declare function runOptimizationTests(): Promise<{
    timestamp: string;
    optimizations: {
        database: {
            indexes: string;
            textSearch: string;
            performance: string;
        };
        services: {
            caching: string;
            queryOptimization: string;
            bulkOperations: string;
            performanceTracking: string;
        };
        controllers: {
            requestValidation: string;
            responseOptimization: string;
            performanceMonitoring: string;
            errorHandling: string;
        };
        models: {
            schemaOptimization: string;
            virtuals: string;
            queryHelpers: string;
            middleware: string;
        };
        utilities: {
            queryOptimizer: string;
            performanceMonitor: string;
            cacheManager: string;
            indexManager: string;
        };
    };
    performance: {
        buildTime: string;
        memoryUsage: string;
        queryPerformance: string;
        cacheHitRate: string;
        indexUsage: string;
    };
    recommendations: string[];
}>;
export default runOptimizationTests;
//# sourceMappingURL=optimization-test.d.ts.map