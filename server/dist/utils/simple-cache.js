"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleCache = void 0;
exports.simpleCacheResult = simpleCacheResult;
const logger_1 = require("./logger");
class SimpleCacheManager {
    cache = new Map();
    tagMap = new Map();
    maxSize = 10000;
    stats;
    cleanupInterval;
    constructor() {
        this.stats = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            hitRate: 0,
            size: 0,
            maxSize: this.maxSize
        };
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000);
        logger_1.logger.info('📦 Simple Cache Manager initialized (no Redis required)');
    }
    async get(key, options = {}) {
        this.stats.totalRequests++;
        const fullKey = this.buildKey(key, options.namespace);
        const entry = this.cache.get(fullKey);
        if (!entry) {
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
        if (Date.now() > entry.expiry) {
            this.cache.delete(fullKey);
            this.removeTags(fullKey, entry.tags);
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
        this.stats.hits++;
        this.updateHitRate();
        logger_1.logger.debug('🎯 Cache HIT', { key: fullKey });
        return entry.value;
    }
    async set(key, value, options = {}) {
        const fullKey = this.buildKey(key, options.namespace);
        const ttl = (options.ttl || 300) * 1000;
        const expiry = Date.now() + ttl;
        const tags = options.tags || [];
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        const entry = {
            value,
            expiry,
            tags,
            createdAt: Date.now()
        };
        this.cache.set(fullKey, entry);
        this.addTags(fullKey, tags);
        this.stats.size = this.cache.size;
        logger_1.logger.debug('💾 Cache SET', { key: fullKey, ttl: options.ttl, tags });
    }
    async del(key, namespace) {
        const fullKey = this.buildKey(key, namespace);
        const entry = this.cache.get(fullKey);
        if (entry) {
            this.cache.delete(fullKey);
            this.removeTags(fullKey, entry.tags);
            this.stats.size = this.cache.size;
            logger_1.logger.debug('🗑️ Cache DELETE', { key: fullKey });
        }
    }
    async invalidateByTags(tags) {
        let totalKeysDeleted = 0;
        for (const tag of tags) {
            const keys = this.tagMap.get(tag);
            if (keys) {
                for (const key of keys) {
                    const entry = this.cache.get(key);
                    if (entry) {
                        this.cache.delete(key);
                        this.removeTags(key, entry.tags);
                        totalKeysDeleted++;
                    }
                }
                this.tagMap.delete(tag);
            }
        }
        this.stats.size = this.cache.size;
        if (totalKeysDeleted > 0) {
            logger_1.logger.info('🏷️ Cache invalidated by tags', { tags, keysDeleted: totalKeysDeleted });
        }
    }
    async clear() {
        this.cache.clear();
        this.tagMap.clear();
        this.stats.size = 0;
        this.stats.hits = 0;
        this.stats.misses = 0;
        this.stats.totalRequests = 0;
        this.stats.hitRate = 0;
        logger_1.logger.info('🧹 Cache cleared');
    }
    getStats() {
        return { ...this.stats };
    }
    async healthCheck() {
        const memoryUsage = process.memoryUsage();
        const isHealthy = this.cache.size < this.maxSize * 0.9 && memoryUsage.heapUsed < 1024 * 1024 * 1024;
        return {
            status: isHealthy ? 'healthy' : 'degraded',
            stats: this.getStats()
        };
    }
    buildKey(key, namespace) {
        const prefix = process.env.CACHE_PREFIX || 'erp';
        return namespace ? `${prefix}:${namespace}:${key}` : `${prefix}:${key}`;
    }
    addTags(key, tags) {
        for (const tag of tags) {
            if (!this.tagMap.has(tag)) {
                this.tagMap.set(tag, new Set());
            }
            this.tagMap.get(tag).add(key);
        }
    }
    removeTags(key, tags) {
        for (const tag of tags) {
            const keys = this.tagMap.get(tag);
            if (keys) {
                keys.delete(key);
                if (keys.size === 0) {
                    this.tagMap.delete(tag);
                }
            }
        }
    }
    cleanupExpired() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
                this.removeTags(key, entry.tags);
                cleanedCount++;
            }
        }
        this.stats.size = this.cache.size;
        if (cleanedCount > 0) {
            logger_1.logger.debug('🧹 Cache cleanup completed', { cleanedCount, remainingSize: this.cache.size });
        }
    }
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            const entry = this.cache.get(oldestKey);
            if (entry) {
                this.cache.delete(oldestKey);
                this.removeTags(oldestKey, entry.tags);
                logger_1.logger.debug('🗑️ Evicted oldest cache entry', { key: oldestKey });
            }
        }
    }
    updateHitRate() {
        if (this.stats.totalRequests > 0) {
            this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
        }
    }
    cleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
        this.tagMap.clear();
    }
}
exports.simpleCache = new SimpleCacheManager();
function simpleCacheResult(options = {}) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
            const cached = await exports.simpleCache.get(cacheKey, options);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            await exports.simpleCache.set(cacheKey, result, options);
            return result;
        };
        return descriptor;
    };
}
exports.default = exports.simpleCache;
//# sourceMappingURL=simple-cache.js.map