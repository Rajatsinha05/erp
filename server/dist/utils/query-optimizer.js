"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOptimizer = void 0;
const logger_1 = require("./logger");
class QueryOptimizer {
    static optimizeFindOptions(options = {}) {
        const optimized = {
            ...options,
            lean: options.lean !== false,
            sort: options.sort || { createdAt: -1 },
            limit: options.limit || 1000
        };
        delete optimized.useCache;
        delete optimized.cacheTTL;
        delete optimized.explain;
        return optimized;
    }
    static optimizeAggregationPipeline(pipeline) {
        const optimized = [...pipeline];
        const hasLimit = optimized.some(stage => '$limit' in stage);
        if (!hasLimit) {
            const sortIndex = optimized.findIndex(stage => '$sort' in stage);
            if (sortIndex > -1) {
                optimized.splice(sortIndex + 1, 0, { $limit: 10000 });
            }
            else {
                optimized.push({ $limit: 10000 });
            }
        }
        const matchStages = [];
        const otherStages = [];
        optimized.forEach(stage => {
            if ('$match' in stage) {
                matchStages.push(stage);
            }
            else {
                otherStages.push(stage);
            }
        });
        return [...matchStages, ...otherStages];
    }
    static createCompanyFilter(companyId, additionalFilter = {}) {
        return {
            companyId: companyId,
            ...additionalFilter
        };
    }
    static createDateRangeFilter(field = 'createdAt', startDate, endDate) {
        if (!startDate && !endDate)
            return {};
        const filter = {};
        if (startDate && endDate) {
            filter[field] = { $gte: startDate, $lte: endDate };
        }
        else if (startDate) {
            filter[field] = { $gte: startDate };
        }
        else if (endDate) {
            filter[field] = { $lte: endDate };
        }
        return filter;
    }
    static createPaginationOptions(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return {
            skip,
            limit: Math.min(limit, 100),
            lean: true
        };
    }
    static createTextSearchFilter(searchTerm, fields) {
        if (!searchTerm || !fields.length)
            return {};
        const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        return {
            $or: fields.map(field => ({
                [field]: searchRegex
            }))
        };
    }
    static createStatusFilter(status) {
        if (!status)
            return {};
        if (Array.isArray(status)) {
            return { status: { $in: status } };
        }
        return { status };
    }
    static createStatsAggregation(matchFilter, groupBy, sumField) {
        const pipeline = [
            { $match: matchFilter }
        ];
        if (groupBy) {
            const groupStage = {
                _id: `$${groupBy}`,
                count: { $sum: 1 }
            };
            if (sumField) {
                groupStage.total = { $sum: `$${sumField}` };
                groupStage.average = { $avg: `$${sumField}` };
            }
            pipeline.push({ $group: groupStage });
            pipeline.push({ $sort: { count: -1 } });
        }
        else {
            const groupStage = {
                _id: null,
                count: { $sum: 1 }
            };
            if (sumField) {
                groupStage.total = { $sum: `$${sumField}` };
                groupStage.average = { $avg: `$${sumField}` };
                groupStage.min = { $min: `$${sumField}` };
                groupStage.max = { $max: `$${sumField}` };
            }
            pipeline.push({ $group: groupStage });
        }
        return pipeline;
    }
    static createLookupStage(from, localField, foreignField = '_id', as, pipeline) {
        const lookupStage = {
            $lookup: {
                from,
                localField,
                foreignField,
                as
            }
        };
        if (pipeline) {
            lookupStage.$lookup.pipeline = pipeline;
        }
        return lookupStage;
    }
    static logQueryPerformance(operation, startTime, resultCount, filter) {
        const duration = Date.now() - startTime;
        if (duration > 1000) {
            logger_1.logger.warn('Slow query detected', {
                operation,
                duration: `${duration}ms`,
                resultCount,
                filter: filter ? Object.keys(filter) : undefined
            });
        }
        else if (process.env.NODE_ENV === 'development') {
            logger_1.logger.debug('Query performance', {
                operation,
                duration: `${duration}ms`,
                resultCount
            });
        }
    }
    static sanitizeFilter(filter) {
        if (!filter || typeof filter !== 'object')
            return {};
        const sanitized = {};
        for (const [key, value] of Object.entries(filter)) {
            if (key.startsWith('$') && !['$and', '$or', '$in', '$nin', '$gte', '$lte', '$gt', '$lt', '$ne', '$exists'].includes(key)) {
                continue;
            }
            if (value && typeof value === 'object' && '$regex' in value) {
                sanitized[key] = {
                    $regex: String(value.$regex).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                    $options: 'i'
                };
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    static createCountAggregation(matchFilter) {
        return [
            { $match: matchFilter },
            { $count: 'total' }
        ];
    }
    static createFacetedAggregation(matchFilter, facets) {
        return [
            { $match: matchFilter },
            { $facet: facets }
        ];
    }
}
exports.QueryOptimizer = QueryOptimizer;
exports.default = QueryOptimizer;
//# sourceMappingURL=query-optimizer.js.map