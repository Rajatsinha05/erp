declare function testCacheWithoutRedis(): Promise<{
    success: boolean;
    message: string;
    stats: import("../utils/advanced-cache").CacheStats;
    health: {
        l1: boolean;
        l2: boolean;
        redisAvailable: boolean;
        stats: import("../utils/advanced-cache").CacheStats;
    };
}>;
declare function testPerformanceWithoutRedis(): Promise<any>;
export { testCacheWithoutRedis, testPerformanceWithoutRedis };
//# sourceMappingURL=test-no-redis.d.ts.map