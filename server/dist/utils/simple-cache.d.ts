export interface SimpleCacheOptions {
    ttl?: number;
    tags?: string[];
    namespace?: string;
}
export interface SimpleCacheStats {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    size: number;
    maxSize: number;
}
declare class SimpleCacheManager {
    private cache;
    private tagMap;
    private maxSize;
    private stats;
    private cleanupInterval;
    constructor();
    get<T>(key: string, options?: SimpleCacheOptions): Promise<T | null>;
    set<T>(key: string, value: T, options?: SimpleCacheOptions): Promise<void>;
    del(key: string, namespace?: string): Promise<void>;
    invalidateByTags(tags: string[]): Promise<void>;
    clear(): Promise<void>;
    getStats(): SimpleCacheStats;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded';
        stats: SimpleCacheStats;
    }>;
    private buildKey;
    private addTags;
    private removeTags;
    private cleanupExpired;
    private evictOldest;
    private updateHitRate;
    cleanup(): void;
}
export declare const simpleCache: SimpleCacheManager;
export declare function simpleCacheResult(options?: SimpleCacheOptions): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default simpleCache;
//# sourceMappingURL=simple-cache.d.ts.map