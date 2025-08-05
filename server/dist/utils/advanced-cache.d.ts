export interface CacheOptions {
    ttl?: number;
    compress?: boolean;
    tags?: string[];
    namespace?: string;
}
export interface CacheStats {
    l1Hits: number;
    l1Misses: number;
    l2Hits: number;
    l2Misses: number;
    totalRequests: number;
    hitRate: number;
    avgResponseTime: number;
}
declare class AdvancedCacheManager {
    private redis;
    private l1Cache;
    private stats;
    private compressionEnabled;
    private redisAvailable;
    private useSimpleCache;
    constructor();
    private initializeRedis;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    del(key: string, namespace?: string): Promise<void>;
    invalidateByTags(tags: string[]): Promise<void>;
    warmCache(warmingData: Array<{
        key: string;
        value: any;
        options?: CacheOptions;
    }>): Promise<void>;
    getStats(): CacheStats;
    clear(): Promise<void>;
    healthCheck(): Promise<{
        l1: boolean;
        l2: boolean;
        redisAvailable: boolean;
        stats: CacheStats;
    }>;
    private buildKey;
    private serialize;
    private deserialize;
    private addTags;
    private updateStats;
    cleanup(): Promise<void>;
}
export declare const advancedCache: AdvancedCacheManager;
export declare function cacheResult(options?: CacheOptions): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default advancedCache;
//# sourceMappingURL=advanced-cache.d.ts.map