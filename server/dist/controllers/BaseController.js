"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const query_optimizer_1 = __importDefault(require("../utils/query-optimizer"));
class BaseController {
    service;
    modelName;
    constructor(service, modelName) {
        this.service = service;
        this.modelName = modelName;
    }
    handleValidationErrors(req) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            throw new errors_1.AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
        }
    }
    getUserInfo(req) {
        const user = req.user;
        return {
            userId: user?.userId?.toString() || user?._id?.toString(),
            companyId: user?.companyId?.toString()
        };
    }
    sendSuccess(res, data, message = 'Operation successful', statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }
    sendPaginatedResponse(res, result, message = 'Data retrieved successfully') {
        res.status(200).json({
            success: true,
            message,
            data: result.documents,
            pagination: result.pagination,
            timestamp: new Date().toISOString()
        });
    }
    sendError(res, error, message = 'Operation failed', statusCode = 500) {
        logger_1.logger.error(`${this.modelName} controller error`, { error, message });
        res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
    async create(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const data = req.body;
            logger_1.logger.info(`Creating ${this.modelName}`, { data, userId });
            const document = await this.service.create(data, userId);
            this.sendSuccess(res, document, `${this.modelName} created successfully`, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const populate = req.query.populate;
            logger_1.logger.info(`Getting ${this.modelName} by ID`, { id });
            const document = await this.service.findById(id, populate);
            if (!document) {
                throw new errors_1.AppError(`${this.modelName} not found`, 404);
            }
            this.sendSuccess(res, document, `${this.modelName} retrieved successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || { createdAt: -1 };
            const populate = req.query.populate;
            const filter = this.buildFilterFromQuery(req.query);
            logger_1.logger.info(`Getting ${this.modelName} list`, { page, limit, filter });
            const result = await this.service.paginate(filter, page, limit, sort, populate);
            this.sendPaginatedResponse(res, result, `${this.modelName} list retrieved successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const data = req.body;
            logger_1.logger.info(`Updating ${this.modelName}`, { id, data, userId });
            const document = await this.service.update(id, data, userId);
            if (!document) {
                throw new errors_1.AppError(`${this.modelName} not found`, 404);
            }
            this.sendSuccess(res, document, `${this.modelName} updated successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            logger_1.logger.info(`Deleting ${this.modelName}`, { id, userId });
            const success = await this.service.delete(id, userId);
            if (!success) {
                throw new errors_1.AppError(`${this.modelName} not found`, 404);
            }
            this.sendSuccess(res, null, `${this.modelName} deleted successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!searchTerm) {
                throw new errors_1.AppError('Search term is required', 400);
            }
            logger_1.logger.info(`Searching ${this.modelName}`, { searchTerm, page, limit });
            throw new errors_1.AppError('Search not implemented for this resource', 501);
        }
        catch (error) {
            next(error);
        }
    }
    async count(req, res, next) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            logger_1.logger.info(`Counting ${this.modelName}`, { filter });
            const count = await this.service.count(filter);
            this.sendSuccess(res, { count }, `${this.modelName} count retrieved successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkCreate(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const { documents } = req.body;
            if (!Array.isArray(documents) || documents.length === 0) {
                throw new errors_1.AppError('Documents array is required and cannot be empty', 400);
            }
            logger_1.logger.info(`Bulk creating ${this.modelName}`, { count: documents.length, userId });
            const result = await this.service.bulkCreate(documents, userId);
            this.sendSuccess(res, result, `${documents.length} ${this.modelName} documents created successfully`, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async export(req, res, next) {
        try {
            const format = req.query.format || 'json';
            const filter = this.buildFilterFromQuery(req.query);
            logger_1.logger.info(`Exporting ${this.modelName}`, { format, filter });
            const documents = await this.service.findMany(filter);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${this.modelName.toLowerCase()}_export.csv`);
                res.send('CSV export not implemented');
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${this.modelName.toLowerCase()}_export.json`);
                res.json(documents);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getStats(req, res, next) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            logger_1.logger.info(`Getting ${this.modelName} statistics`, { filter });
            const total = await this.service.count(filter);
            const active = await this.service.count({ ...filter, isActive: true });
            const inactive = await this.service.count({ ...filter, isActive: false });
            const stats = {
                total,
                active,
                inactive,
                activePercentage: total > 0 ? ((active / total) * 100).toFixed(2) : 0
            };
            this.sendSuccess(res, stats, `${this.modelName} statistics retrieved successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    buildFilterFromQuery(query) {
        const filter = {};
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === 'true';
        }
        if (query.createdFrom || query.createdTo) {
            filter.createdAt = {};
            if (query.createdFrom) {
                filter.createdAt.$gte = new Date(query.createdFrom);
            }
            if (query.createdTo) {
                filter.createdAt.$lte = new Date(query.createdTo);
            }
        }
        if (query.updatedFrom || query.updatedTo) {
            filter.updatedAt = {};
            if (query.updatedFrom) {
                filter.updatedAt.$gte = new Date(query.updatedFrom);
            }
            if (query.updatedTo) {
                filter.updatedAt.$lte = new Date(query.updatedTo);
            }
        }
        return filter;
    }
    validateCompanyAccess(req, documentCompanyId) {
        const { companyId } = this.getUserInfo(req);
        const user = req.user;
        if (user?.isSuperAdmin) {
            return;
        }
        if (!companyId || companyId !== documentCompanyId) {
            throw new errors_1.AppError('Access denied: Insufficient company permissions', 403);
        }
    }
    parseQueryOptions(req) {
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const paginationOptions = query_optimizer_1.default.createPaginationOptions(Number(page), Number(limit));
        const options = query_optimizer_1.default.optimizeFindOptions({
            skip: paginationOptions.skip,
            limit: paginationOptions.limit,
            lean: true,
            sort: sort ? this.parseSortParam(sort) : { createdAt: -1 }
        });
        if (search && typeof search === 'string') {
            const searchFields = this.getSearchFields();
            const searchFilter = query_optimizer_1.default.createTextSearchFilter(search, searchFields);
            Object.assign(filters, searchFilter);
        }
        return { ...options, filters: query_optimizer_1.default.sanitizeFilter(filters) };
    }
    parseSortParam(sortParam) {
        const sort = {};
        sortParam.split(',').forEach(field => {
            if (field.startsWith('-')) {
                sort[field.substring(1)] = -1;
            }
            else {
                sort[field] = 1;
            }
        });
        return sort;
    }
    getSearchFields() {
        return ['name', 'description', 'code'];
    }
    sendOptimizedPaginatedResponse(res, data, total, page, limit, message = 'Data retrieved successfully') {
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        this.sendSuccess(res, {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev
            }
        }, message);
    }
    validateRequestWithTracking(req) {
        const startTime = Date.now();
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg).join(', ');
            throw new errors_1.AppError(`Validation failed: ${errorMessages}`, 400);
        }
        const duration = Date.now() - startTime;
        if (duration > 100) {
            logger_1.logger.warn('Slow validation detected', {
                duration: `${duration}ms`,
                path: req.path,
                method: req.method
            });
        }
    }
    setCacheHeaders(res, maxAge = 300) {
        res.set({
            'Cache-Control': `public, max-age=${maxAge}`,
            'ETag': `"${Date.now()}"`,
            'Last-Modified': new Date().toUTCString()
        });
    }
    logControllerPerformance(operation, startTime, req, resultCount) {
        const duration = Date.now() - startTime;
        if (duration > 2000) {
            logger_1.logger.warn('Slow controller operation', {
                operation,
                duration: `${duration}ms`,
                path: req.path,
                method: req.method,
                resultCount,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
        }
        else if (process.env.NODE_ENV === 'development') {
            logger_1.logger.debug('Controller performance', {
                operation,
                duration: `${duration}ms`,
                resultCount
            });
        }
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map