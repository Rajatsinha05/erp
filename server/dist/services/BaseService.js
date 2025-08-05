"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("@/utils/logger");
const errors_1 = require("../utils/errors");
const advanced_cache_1 = require("../utils/advanced-cache");
class BaseService {
    model;
    modelName;
    constructor(model) {
        this.model = model;
        this.modelName = model.modelName;
    }
    async create(data, userId) {
        try {
            logger_1.logger.info(`Creating new ${this.modelName}`, { data, userId });
            const document = new this.model({
                ...data,
                createdBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined
            });
            const savedDocument = await document.save();
            logger_1.logger.info(`${this.modelName} created successfully`, { id: savedDocument._id, userId });
            return savedDocument;
        }
        catch (error) {
            logger_1.logger.error(`Error creating ${this.modelName}`, { error, data, userId });
            throw new errors_1.AppError(`Failed to create ${this.modelName}`, 500, error);
        }
    }
    async findById(id, populate) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.AppError('Invalid ID format', 400);
            }
            let query = this.model.findById(id);
            if (populate && populate.length > 0) {
                populate.forEach(path => {
                    query = query.populate(path);
                });
            }
            const document = await query.exec();
            return document;
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName} by ID`, { error, id });
            throw new errors_1.AppError(`Failed to find ${this.modelName}`, 500, error);
        }
    }
    async findOne(filter, populate) {
        try {
            let query = this.model.findOne(filter);
            if (populate && populate.length > 0) {
                populate.forEach(path => {
                    query = query.populate(path);
                });
            }
            const document = await query.exec();
            return document;
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName}`, { error, filter });
            throw new errors_1.AppError(`Failed to find ${this.modelName}`, 500, error);
        }
    }
    async findMany(filter, options = {}, populate) {
        try {
            let query = this.model.find(filter, null, options);
            if (populate && populate.length > 0) {
                populate.forEach(path => {
                    query = query.populate(path);
                });
            }
            const documents = await query.exec();
            return documents;
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName} documents`, { error, filter, options });
            throw new errors_1.AppError(`Failed to find ${this.modelName} documents`, 500, error);
        }
    }
    async update(id, data, userId) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.AppError('Invalid ID format', 400);
            }
            logger_1.logger.info(`Updating ${this.modelName}`, { id, data, userId });
            const updateData = {
                ...data,
                lastModifiedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
                updatedAt: new Date()
            };
            const document = await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
            if (!document) {
                throw new errors_1.AppError(`${this.modelName} not found`, 404);
            }
            logger_1.logger.info(`${this.modelName} updated successfully`, { id, userId });
            return document;
        }
        catch (error) {
            logger_1.logger.error(`Error updating ${this.modelName}`, { error, id, data, userId });
            throw new errors_1.AppError(`Failed to update ${this.modelName}`, 500, error);
        }
    }
    async delete(id, userId) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new errors_1.AppError('Invalid ID format', 400);
            }
            logger_1.logger.info(`Deleting ${this.modelName}`, { id, userId });
            const document = await this.model.findById(id);
            if (!document) {
                throw new errors_1.AppError(`${this.modelName} not found`, 404);
            }
            let result;
            if ('isActive' in document) {
                result = await this.model.findByIdAndUpdate(id, {
                    isActive: false,
                    lastModifiedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
                    updatedAt: new Date()
                }, { new: true });
            }
            else {
                result = await this.model.findByIdAndDelete(id);
            }
            logger_1.logger.info(`${this.modelName} deleted successfully`, { id, userId });
            return !!result;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting ${this.modelName}`, { error, id, userId });
            throw new errors_1.AppError(`Failed to delete ${this.modelName}`, 500, error);
        }
    }
    async count(filter) {
        try {
            const count = await this.model.countDocuments(filter);
            return count;
        }
        catch (error) {
            logger_1.logger.error(`Error counting ${this.modelName} documents`, { error, filter });
            throw new errors_1.AppError(`Failed to count ${this.modelName} documents`, 500, error);
        }
    }
    async exists(filter) {
        try {
            const document = await this.model.findOne(filter).select('_id').lean();
            return !!document;
        }
        catch (error) {
            logger_1.logger.error(`Error checking ${this.modelName} existence`, { error, filter });
            throw new errors_1.AppError(`Failed to check ${this.modelName} existence`, 500, error);
        }
    }
    async findByCompany(companyId, filter = {}, options = {}, populate) {
        try {
            const companyFilter = {
                ...filter,
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true
            };
            return this.findMany(companyFilter, options, populate);
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName} by company`, { error, companyId, filter });
            throw new errors_1.AppError(`Failed to find ${this.modelName} by company`, 500, error);
        }
    }
    async paginate(filter, page = 1, limit = 10, sort = { createdAt: -1 }, populate) {
        try {
            const skip = (page - 1) * limit;
            const [documents, total] = await Promise.all([
                this.findMany(filter, { skip, limit, sort }, populate),
                this.count(filter)
            ]);
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            return {
                documents,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null
                }
            };
        }
        catch (error) {
            logger_1.logger.error(`Error paginating ${this.modelName}`, { error, filter, page, limit });
            throw new errors_1.AppError(`Failed to paginate ${this.modelName}`, 500, error);
        }
    }
    async bulkCreate(documents, userId) {
        try {
            logger_1.logger.info(`Bulk creating ${this.modelName}`, { count: documents.length, userId });
            const documentsWithMeta = documents.map(doc => ({
                ...doc,
                createdBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined
            }));
            const result = await this.model.insertMany(documentsWithMeta);
            logger_1.logger.info(`Bulk created ${this.modelName} successfully`, { count: result.length, userId });
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Error bulk creating ${this.modelName}`, { error, count: documents.length, userId });
            throw new errors_1.AppError(`Failed to bulk create ${this.modelName}`, 500, error);
        }
    }
    async bulkUpdate(updates, userId) {
        try {
            logger_1.logger.info(`Bulk updating ${this.modelName}`, { count: updates.length, userId });
            const operations = updates.map(({ filter, update }) => ({
                updateMany: {
                    filter,
                    update: {
                        ...update,
                        lastModifiedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
                        updatedAt: new Date()
                    }
                }
            }));
            const result = await this.model.bulkWrite(operations);
            logger_1.logger.info(`Bulk updated ${this.modelName} successfully`, { result, userId });
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Error bulk updating ${this.modelName}`, { error, count: updates.length, userId });
            throw new errors_1.AppError(`Failed to bulk update ${this.modelName}`, 500, error);
        }
    }
    async findByIdCached(id, ttl = 300) {
        try {
            const cacheKey = `${this.modelName}:${id}`;
            const cached = await advanced_cache_1.advancedCache.get(cacheKey, { ttl });
            if (cached) {
                logger_1.logger.debug(`Cache hit for ${this.modelName}`, { id });
                return cached;
            }
            const document = await this.model.findById(id).lean().exec();
            if (document) {
                await advanced_cache_1.advancedCache.set(cacheKey, document, { ttl });
                logger_1.logger.debug(`Cached ${this.modelName}`, { id, ttl });
            }
            return document;
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName} by ID with cache`, { error, id });
            throw new errors_1.AppError(`Failed to find ${this.modelName}`, 500, error);
        }
    }
    async findManyLean(filter, options = {}) {
        try {
            const query = this.model.find(filter, null, options).lean();
            if (!options.sort) {
                query.sort({ createdAt: -1 });
            }
            const documents = await query.exec();
            logger_1.logger.debug(`Found ${documents.length} ${this.modelName} documents (lean)`, {
                filter: Object.keys(filter),
                count: documents.length
            });
            return documents;
        }
        catch (error) {
            logger_1.logger.error(`Error finding ${this.modelName} with lean query`, { error, filter });
            throw new errors_1.AppError(`Failed to find ${this.modelName}`, 500, error);
        }
    }
    async aggregate(pipeline) {
        try {
            const options = process.env.NODE_ENV === 'development' ? { explain: false } : {};
            const result = await this.model.aggregate(pipeline, options).exec();
            logger_1.logger.debug(`Aggregation completed for ${this.modelName}`, {
                stages: pipeline.length,
                resultCount: result.length
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Error in ${this.modelName} aggregation`, { error, pipeline });
            throw new errors_1.AppError(`Failed to aggregate ${this.modelName}`, 500, error);
        }
    }
    async bulkWrite(operations) {
        try {
            const result = await this.model.bulkWrite(operations, {
                ordered: false,
                bypassDocumentValidation: false
            });
            logger_1.logger.info(`Bulk write completed for ${this.modelName}`, {
                operations: operations.length,
                result: {
                    insertedCount: result.insertedCount,
                    modifiedCount: result.modifiedCount,
                    deletedCount: result.deletedCount,
                    upsertedCount: result.upsertedCount
                }
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Error in ${this.modelName} bulk write`, { error, operations: operations.length });
            throw new errors_1.AppError(`Failed to bulk write ${this.modelName}`, 500, error);
        }
    }
    async clearCache(pattern) {
        try {
            if (pattern) {
                await advanced_cache_1.advancedCache.invalidateByTags([`${this.modelName}:${pattern}`]);
            }
            else {
                await advanced_cache_1.advancedCache.invalidateByTags([this.modelName]);
            }
            logger_1.logger.debug(`Cleared cache entries for ${this.modelName}`, { pattern });
        }
        catch (error) {
            logger_1.logger.warn(`Error clearing cache for ${this.modelName}:`, error);
        }
    }
    getCacheStats() {
        return advanced_cache_1.advancedCache.getStats();
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map