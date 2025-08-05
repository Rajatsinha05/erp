"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTracker = exports.PerformanceMonitor = void 0;
exports.performanceTrack = performanceTrack;
exports.performanceMiddleware = performanceMiddleware;
const logger_1 = require("./logger");
class PerformanceMonitor {
    static metrics = [];
    static maxMetrics = 1000;
    static thresholds = {
        database: { warning: 1000, critical: 5000 },
        api: { warning: 2000, critical: 10000 },
        service: { warning: 500, critical: 2000 },
        controller: { warning: 1000, critical: 5000 }
    };
    static startTracking(operation, metadata) {
        return new PerformanceTracker(operation, metadata);
    }
    static recordMetric(metric) {
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
        this.checkThresholds(metric);
    }
    static getStats(operation, timeRange) {
        let filteredMetrics = this.metrics;
        if (operation) {
            filteredMetrics = filteredMetrics.filter(m => m.operation.includes(operation));
        }
        if (timeRange) {
            filteredMetrics = filteredMetrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
        }
        if (filteredMetrics.length === 0) {
            return { count: 0, avgDuration: 0, minDuration: 0, maxDuration: 0 };
        }
        const durations = filteredMetrics.map(m => m.duration);
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        const sortedDurations = durations.sort((a, b) => a - b);
        const p50 = this.getPercentile(sortedDurations, 50);
        const p95 = this.getPercentile(sortedDurations, 95);
        const p99 = this.getPercentile(sortedDurations, 99);
        return {
            count: filteredMetrics.length,
            avgDuration: Math.round(avgDuration),
            minDuration,
            maxDuration,
            p50,
            p95,
            p99,
            slowQueries: filteredMetrics.filter(m => m.duration > 1000).length
        };
    }
    static getSlowOperations(threshold = 1000) {
        return this.metrics
            .filter(m => m.duration > threshold)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 50);
    }
    static clearMetrics() {
        this.metrics = [];
    }
    static setThresholds(category, thresholds) {
        this.thresholds[category] = thresholds;
    }
    static checkThresholds(metric) {
        const category = this.getCategory(metric.operation);
        const threshold = this.thresholds[category];
        if (!threshold)
            return;
        if (metric.duration > threshold.critical) {
            logger_1.logger.error('Critical performance issue detected', {
                operation: metric.operation,
                duration: `${metric.duration}ms`,
                threshold: `${threshold.critical}ms`,
                metadata: metric.metadata
            });
        }
        else if (metric.duration > threshold.warning) {
            logger_1.logger.warn('Performance warning', {
                operation: metric.operation,
                duration: `${metric.duration}ms`,
                threshold: `${threshold.warning}ms`,
                metadata: metric.metadata
            });
        }
    }
    static getCategory(operation) {
        if (operation.includes('database') || operation.includes('query') || operation.includes('aggregate')) {
            return 'database';
        }
        if (operation.includes('controller') || operation.includes('Controller')) {
            return 'controller';
        }
        if (operation.includes('service') || operation.includes('Service')) {
            return 'service';
        }
        return 'api';
    }
    static getPercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[index] || 0;
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
class PerformanceTracker {
    startTime;
    startCpuUsage;
    operation;
    metadata;
    constructor(operation, metadata) {
        this.operation = operation;
        this.metadata = metadata;
        this.startTime = Date.now();
        this.startCpuUsage = process.cpuUsage();
    }
    end(additionalMetadata) {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const cpuUsage = process.cpuUsage(this.startCpuUsage);
        const memoryUsage = process.memoryUsage();
        const metric = {
            operation: this.operation,
            duration,
            timestamp: new Date(),
            metadata: { ...this.metadata, ...additionalMetadata },
            memoryUsage,
            cpuUsage
        };
        PerformanceMonitor.recordMetric(metric);
        return metric;
    }
    getCurrentDuration() {
        return Date.now() - this.startTime;
    }
}
exports.PerformanceTracker = PerformanceTracker;
function performanceTrack(category = 'service') {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const tracker = PerformanceMonitor.startTracking(`${category}:${target.constructor.name}.${propertyName}`, { args: args.length });
            try {
                const result = await method.apply(this, args);
                tracker.end({ success: true, resultSize: Array.isArray(result) ? result.length : 1 });
                return result;
            }
            catch (error) {
                tracker.end({ success: false, error: error.message });
                throw error;
            }
        };
        return descriptor;
    };
}
function performanceMiddleware() {
    return (req, res, next) => {
        const tracker = PerformanceMonitor.startTracking(`api:${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
        const originalEnd = res.end;
        res.end = function (...args) {
            tracker.end({
                statusCode: res.statusCode,
                contentLength: res.get('Content-Length')
            });
            originalEnd.apply(res, args);
        };
        next();
    };
}
exports.default = PerformanceMonitor;
//# sourceMappingURL=performance-monitor.js.map