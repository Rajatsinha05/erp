"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedCache = void 0;
exports.cacheResult = cacheResult;
const logger_1 = require("./logger");
const perf_hooks_1 = require("perf_hooks");
const simple_cache_1 = require("./simple-cache");
let Redis = null;
let LRU = null;
try {
    Redis = require('ioredis');
}
catch (error) {
    logger_1.logger.info('📦 Redis not installed - using fallback cache');
}
try {
    LRU = require('lru-cache');
    logger_1.logger.info('📦 LRU-cache loaded successfully');
}
catch (error) {
    logger_1.logger.info('📦 LRU-cache not installed - using simple cache fallback');
}
class AdvancedCacheManager {
    redis = null;
    l1Cache = null;
    stats;
    compressionEnabled = true;
    redisAvailable = false;
    useSimpleCache = false;
    constructor() {
        if (LRU) {
            try {
                this.l1Cache = new LRU({
                    max: 10000,
                    ttl: 1000 * 60 * 5,
                    updateAgeOnGet: true,
                    allowStale: false
                });
                logger_1.logger.info('📦 Advanced LRU cache initialized successfully');
            }
            catch (error) {
                logger_1.logger.warn('⚠️ LRU cache initialization failed, using simple cache:', error);
                this.useSimpleCache = true;
                logger_1.logger.info('📦 Using simple cache fallback (no external dependencies)');
            }
        }
        else {
            this.useSimpleCache = true;
            logger_1.logger.info('📦 Using simple cache fallback (no external dependencies)');
        }
        this.stats = {
            l1Hits: 0,
            l1Misses: 0,
            l2Hits: 0,
            l2Misses: 0,
            totalRequests: 0,
            hitRate: 0,
            avgResponseTime: 0
        };
        this.initializeRedis();
    }
    async initializeRedis() {
        if (!Redis) {
            logger_1.logger.info('📦 Redis package not available - using in-memory cache only');
            this.redisAvailable = false;
            return;
        }
        if (process.env.DISABLE_REDIS === 'true' || process.env.NODE_ENV === 'development') {
            logger_1.logger.info('🚫 Redis disabled for development - using in-memory cache only');
            this.redisAvailable = false;
            return;
        }
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.redis = new Redis(redisUrl, {
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
                family: 4,
                db: 0
            });
            this.redis.on('connect', () => {
                logger_1.logger.info('✅ Redis connected successfully');
                this.redisAvailable = true;
            });
            this.redis.on('error', (error) => {
                logger_1.logger.warn('⚠️ Redis connection error, falling back to in-memory cache:', error);
                this.redis = null;
                this.redisAvailable = false;
            });
            this.redis.on('ready', () => {
                logger_1.logger.info('🚀 Redis ready for operations');
                this.redisAvailable = true;
            });
            const pingPromise = this.redis.ping();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000));
            await Promise.race([pingPromise, timeoutPromise]);
            this.redisAvailable = true;
        }
        catch (error) {
            logger_1.logger.info('📦 Redis not available, using in-memory cache only. This is perfectly fine for development!');
            this.redis = null;
            this.redisAvailable = false;
        }
    }
    async get(key, options = {}) {
        const startTime = perf_hooks_1.performance.now();
        this.stats.totalRequests++;
        try {
            const fullKey = this.buildKey(key, options.namespace);
            let l1Value = undefined;
            if (this.useSimpleCache) {
                l1Value = await simple_cache_1.simpleCache.get(fullKey, options);
            }
            else if (this.l1Cache) {
                l1Value = this.l1Cache.get(fullKey);
            }
            if (l1Value !== undefined && l1Value !== null) {
                this.stats.l1Hits++;
                this.updateStats(startTime);
                logger_1.logger.debug('🎯 L1 Cache HIT', { key: fullKey });
                return this.useSimpleCache ? l1Value : this.deserialize(l1Value);
            }
            this.stats.l1Misses++;
            if (this.redis && this.redisAvailable) {
                try {
                    const l2Value = await this.redis.get(fullKey);
                    if (l2Value !== null) {
                        this.stats.l2Hits++;
                        const deserializedValue = this.deserialize(l2Value);
                        if (this.useSimpleCache) {
                            await simple_cache_1.simpleCache.set(fullKey, deserializedValue, options);
                        }
                        else if (this.l1Cache) {
                            this.l1Cache.set(fullKey, l2Value, { ttl: (options.ttl || 300) * 1000 });
                        }
                        this.updateStats(startTime);
                        logger_1.logger.debug('🎯 L2 Cache HIT', { key: fullKey });
                        return deserializedValue;
                    }
                }
                catch (error) {
                    logger_1.logger.warn('Redis get error, falling back to L1 cache:', error);
                    this.redisAvailable = false;
                }
            }
            this.stats.l2Misses++;
            this.updateStats(startTime);
            logger_1.logger.debug('❌ Cache MISS', { key: fullKey });
            return null;
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', error);
            this.updateStats(startTime);
            return null;
        }
    }
    async set(key, value, options = {}) {
        try {
            const fullKey = this.buildKey(key, options.namespace);
            const serializedValue = this.serialize(value, options.compress);
            const ttl = options.ttl || 300;
            if (this.useSimpleCache) {
                await simple_cache_1.simpleCache.set(fullKey, value, options);
            }
            else if (this.l1Cache) {
                this.l1Cache.set(fullKey, serializedValue, { ttl: ttl * 1000 });
            }
            if (this.redis && this.redisAvailable) {
                try {
                    await this.redis.setex(fullKey, ttl, serializedValue);
                    if (options.tags && options.tags.length > 0) {
                        await this.addTags(fullKey, options.tags);
                    }
                }
                catch (error) {
                    logger_1.logger.warn('Redis set error, continuing with L1 cache only:', error);
                    this.redisAvailable = false;
                }
            }
            logger_1.logger.debug('💾 Cache SET', { key: fullKey, ttl, tags: options.tags });
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', error);
        }
    }
    async del(key, namespace) {
        try {
            const fullKey = this.buildKey(key, namespace);
            if (this.useSimpleCache) {
                await simple_cache_1.simpleCache.del(fullKey, namespace);
            }
            else if (this.l1Cache) {
                this.l1Cache.delete(fullKey);
            }
            if (this.redis && this.redisAvailable) {
                try {
                    await this.redis.del(fullKey);
                }
                catch (error) {
                    logger_1.logger.warn('Redis delete error:', error);
                }
            }
            logger_1.logger.debug('🗑️ Cache DELETE', { key: fullKey });
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', error);
        }
    }
    async invalidateByTags(tags) {
        if (!this.redis || !this.redisAvailable) {
            logger_1.logger.info('🏷️ Redis not available, using fallback cache invalidation');
            if (this.useSimpleCache) {
                await simple_cache_1.simpleCache.invalidateByTags(tags);
            }
            else if (this.l1Cache) {
                for (const tag of tags) {
                    const keysToDelete = [];
                    for (const [key] of this.l1Cache.entries()) {
                        if (key.includes(tag)) {
                            keysToDelete.push(key);
                        }
                    }
                    keysToDelete.forEach((key) => this.l1Cache.delete(key));
                    logger_1.logger.info('🏷️ L1 Cache cleared by tag pattern', { tag, keysCount: keysToDelete.length });
                }
            }
            return;
        }
        try {
            for (const tag of tags) {
                const tagKey = `tag:${tag}`;
                const keys = await this.redis.smembers(tagKey);
                if (keys.length > 0) {
                    if (this.useSimpleCache) {
                    }
                    else if (this.l1Cache) {
                        keys.forEach((key) => this.l1Cache.delete(key));
                    }
                    await this.redis.del(...keys);
                    await this.redis.del(tagKey);
                    logger_1.logger.info('🏷️ Cache invalidated by tag', { tag, keysCount: keys.length });
                }
            }
        }
        catch (error) {
            logger_1.logger.warn('Cache tag invalidation error, falling back to L1 only:', error);
            this.redisAvailable = false;
        }
    }
    async warmCache(warmingData) {
        logger_1.logger.info('🔥 Starting cache warming...', { itemsCount: warmingData.length });
        const promises = warmingData.map(async ({ key, value, options }) => {
            try {
                await this.set(key, value, options);
            }
            catch (error) {
                logger_1.logger.error('Cache warming error for key:', key, error);
            }
        });
        await Promise.allSettled(promises);
        logger_1.logger.info('✅ Cache warming completed');
    }
    getStats() {
        const totalHits = this.stats.l1Hits + this.stats.l2Hits;
        const hitRate = this.stats.totalRequests > 0 ? (totalHits / this.stats.totalRequests) * 100 : 0;
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100
        };
    }
    async clear() {
        try {
            if (this.useSimpleCache) {
                await simple_cache_1.simpleCache.clear();
            }
            else if (this.l1Cache) {
                this.l1Cache.clear();
            }
            if (this.redis && this.redisAvailable) {
                try {
                    await this.redis.flushdb();
                }
                catch (error) {
                    logger_1.logger.warn('Redis clear error:', error);
                }
            }
            this.stats = {
                l1Hits: 0,
                l1Misses: 0,
                l2Hits: 0,
                l2Misses: 0,
                totalRequests: 0,
                hitRate: 0,
                avgResponseTime: 0
            };
            logger_1.logger.info('🧹 All caches cleared');
        }
        catch (error) {
            logger_1.logger.error('Cache clear error:', error);
        }
    }
    async healthCheck() {
        const l1Health = this.l1Cache.size >= 0;
        let l2Health = false;
        if (this.redis && this.redisAvailable) {
            try {
                await this.redis.ping();
                l2Health = true;
            }
            catch (error) {
                l2Health = false;
                this.redisAvailable = false;
            }
        }
        return {
            l1: l1Health,
            l2: l2Health,
            redisAvailable: this.redisAvailable,
            stats: this.getStats()
        };
    }
    buildKey(key, namespace) {
        const prefix = process.env.CACHE_PREFIX || 'erp';
        return namespace ? `${prefix}:${namespace}:${key}` : `${prefix}:${key}`;
    }
    serialize(value, compress = false) {
        try {
            const jsonString = JSON.stringify(value);
            if (compress && this.compressionEnabled && jsonString.length > 1024) {
                return jsonString;
            }
            return jsonString;
        }
        catch (error) {
            logger_1.logger.error('Serialization error:', error);
            return '{}';
        }
    }
    deserialize(value) {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Deserialization error:', error);
            return null;
        }
    }
    async addTags(key, tags) {
        if (!this.redis || !this.redisAvailable)
            return;
        try {
            const promises = tags.map(tag => this.redis.sadd(`tag:${tag}`, key));
            await Promise.all(promises);
        }
        catch (error) {
            logger_1.logger.warn('Add tags error:', error);
            this.redisAvailable = false;
        }
    }
    updateStats(startTime) {
        const responseTime = perf_hooks_1.performance.now() - startTime;
        this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;
    }
    async cleanup() {
        if (this.redis && this.redisAvailable) {
            try {
                await this.redis.quit();
            }
            catch (error) {
                logger_1.logger.warn('Redis cleanup error:', error);
            }
        }
        if (this.useSimpleCache) {
            await simple_cache_1.simpleCache.clear();
        }
        else if (this.l1Cache) {
            this.l1Cache.clear();
        }
        this.redisAvailable = false;
    }
}
exports.advancedCache = new AdvancedCacheManager();
function cacheResult(options = {}) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
            const cached = await exports.advancedCache.get(cacheKey, options);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            await exports.advancedCache.set(cacheKey, result, options);
            return result;
        };
        return descriptor;
    };
}
exports.default = exports.advancedCache;
//# sourceMappingURL=advanced-cache.js.map