import { Model, Document, Types, FilterQuery, UpdateQuery, QueryOptions, PipelineStage } from 'mongoose';
import { logger } from '@/utils/logger';
import { AppError } from '../utils/errors';
import { advancedCache } from '../utils/advanced-cache';


export interface IBaseService<T> {
  create(data: Partial<T>, userId?: string): Promise<T>;
  findById(id: string, populate?: string[]): Promise<T | null>;
  findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null>;
  findMany(filter: FilterQuery<T>, options?: QueryOptions, populate?: string[]): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>, userId?: string): Promise<T | null>;
  delete(id: string, userId?: string): Promise<boolean>;
  count(filter: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  // Optimized methods
  findByIdCached(id: string, ttl?: number): Promise<T | null>;
  findManyLean(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  aggregate(pipeline: PipelineStage[]): Promise<any[]>;
  bulkWrite(operations: any[]): Promise<any>;
}

export abstract class BaseService<T extends Document> implements IBaseService<T> {
  protected model: Model<T>;
  protected modelName: string;

  constructor(model: Model<T>) {
    this.model = model;
    this.modelName = model.modelName;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, userId?: string): Promise<T> {
    try {
      logger.info(`Creating new ${this.modelName}`, { data, userId });
      
      const document = new this.model({
        ...data,
        createdBy: userId ? new Types.ObjectId(userId) : undefined
      });
      
      const savedDocument = await document.save();
      logger.info(`${this.modelName} created successfully`, { id: savedDocument._id, userId });
      
      return savedDocument;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, { error, data, userId });
      throw new AppError(`Failed to create ${this.modelName}`, 500, error);
    }
  }

  /**
   * Find document by ID
   */
  async findById(id: string, populate?: string[]): Promise<T | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format', 400);
      }

      let query = this.model.findById(id);
      
      if (populate && populate.length > 0) {
        populate.forEach(path => {
          query = query.populate(path);
        });
      }

      const document = await query.exec();
      return document;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID`, { error, id });
      throw new AppError(`Failed to find ${this.modelName}`, 500, error);
    }
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);
      
      if (populate && populate.length > 0) {
        populate.forEach(path => {
          query = query.populate(path);
        });
      }

      const document = await query.exec();
      return document;
    } catch (error) {
      logger.error(`Error finding ${this.modelName}`, { error, filter });
      throw new AppError(`Failed to find ${this.modelName}`, 500, error);
    }
  }

  /**
   * Find multiple documents
   */
  async findMany(
    filter: FilterQuery<T>, 
    options: QueryOptions = {}, 
    populate?: string[]
  ): Promise<T[]> {
    try {
      let query = this.model.find(filter, null, options);
      
      if (populate && populate.length > 0) {
        populate.forEach(path => {
          query = query.populate(path);
        });
      }

      const documents = await query.exec();
      return documents;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} documents`, { error, filter, options });
      throw new AppError(`Failed to find ${this.modelName} documents`, 500, error);
    }
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: UpdateQuery<T>, userId?: string): Promise<T | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format', 400);
      }

      logger.info(`Updating ${this.modelName}`, { id, data, userId });

      const updateData = {
        ...data,
        lastModifiedBy: userId ? new Types.ObjectId(userId) : undefined,
        updatedAt: new Date()
      };

      const document = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).exec();

      if (!document) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      logger.info(`${this.modelName} updated successfully`, { id, userId });
      return document;
    } catch (error) {
      logger.error(`Error updating ${this.modelName}`, { error, id, data, userId });
      throw new AppError(`Failed to update ${this.modelName}`, 500, error);
    }
  }

  /**
   * Soft delete document by ID
   */
  async delete(id: string, userId?: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid ID format', 400);
      }

      logger.info(`Deleting ${this.modelName}`, { id, userId });

      // Check if document has isActive field for soft delete
      const document = await this.model.findById(id);
      if (!document) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      let result: any;
      if ('isActive' in document) {
        // Soft delete
        result = await this.model.findByIdAndUpdate(
          id,
          { 
            isActive: false,
            lastModifiedBy: userId ? new Types.ObjectId(userId) : undefined,
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        // Hard delete
        result = await this.model.findByIdAndDelete(id);
      }

      logger.info(`${this.modelName} deleted successfully`, { id, userId });
      return !!result;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}`, { error, id, userId });
      throw new AppError(`Failed to delete ${this.modelName}`, 500, error);
    }
  }

  /**
   * Count documents matching filter
   */
  async count(filter: FilterQuery<T>): Promise<number> {
    try {
      const count = await this.model.countDocuments(filter);
      return count;
    } catch (error) {
      logger.error(`Error counting ${this.modelName} documents`, { error, filter });
      throw new AppError(`Failed to count ${this.modelName} documents`, 500, error);
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const document = await this.model.findOne(filter).select('_id').lean();
      return !!document;
    } catch (error) {
      logger.error(`Error checking ${this.modelName} existence`, { error, filter });
      throw new AppError(`Failed to check ${this.modelName} existence`, 500, error);
    }
  }

  /**
   * Find documents by company ID (for multi-tenant models)
   */
  async findByCompany(
    companyId: string, 
    filter: FilterQuery<T> = {}, 
    options: QueryOptions = {},
    populate?: string[]
  ): Promise<T[]> {
    try {
      const companyFilter = {
        ...filter,
        companyId: new Types.ObjectId(companyId),
        isActive: true
      };

      return this.findMany(companyFilter, options, populate);
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by company`, { error, companyId, filter });
      throw new AppError(`Failed to find ${this.modelName} by company`, 500, error);
    }
  }

  /**
   * Paginated search
   */
  async paginate(
    filter: FilterQuery<T>,
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 },
    populate?: string[]
  ) {
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
    } catch (error) {
      logger.error(`Error paginating ${this.modelName}`, { error, filter, page, limit });
      throw new AppError(`Failed to paginate ${this.modelName}`, 500, error);
    }
  }

  /**
   * Bulk operations
   */
  async bulkCreate(documents: Partial<T>[], userId?: string): Promise<T[]> {
    try {
      logger.info(`Bulk creating ${this.modelName}`, { count: documents.length, userId });

      const documentsWithMeta = documents.map(doc => ({
        ...doc,
        createdBy: userId ? new Types.ObjectId(userId) : undefined
      }));

      const result = await this.model.insertMany(documentsWithMeta);
      logger.info(`Bulk created ${this.modelName} successfully`, { count: result.length, userId });

      return result as unknown as T[];
    } catch (error) {
      logger.error(`Error bulk creating ${this.modelName}`, { error, count: documents.length, userId });
      throw new AppError(`Failed to bulk create ${this.modelName}`, 500, error);
    }
  }

  async bulkUpdate(updates: Array<{ filter: FilterQuery<T>; update: UpdateQuery<T> }>, userId?: string): Promise<any> {
    try {
      logger.info(`Bulk updating ${this.modelName}`, { count: updates.length, userId });

      const operations = updates.map(({ filter, update }) => ({
        updateMany: {
          filter,
          update: {
            ...update,
            lastModifiedBy: userId ? new Types.ObjectId(userId) : undefined,
            updatedAt: new Date()
          }
        }
      }));

      const result = await this.model.bulkWrite(operations as any);
      logger.info(`Bulk updated ${this.modelName} successfully`, { result, userId });
      
      return result;
    } catch (error) {
      logger.error(`Error bulk updating ${this.modelName}`, { error, count: updates.length, userId });
      throw new AppError(`Failed to bulk update ${this.modelName}`, 500, error);
    }
  }

  /**
   * Find document by ID with caching for performance
   */
  async findByIdCached(id: string, ttl: number = 300): Promise<T | null> {
    try {
      const cacheKey = `${this.modelName}:${id}`;

      // Check cache first
      const cached = await advancedCache.get<T>(cacheKey, { ttl });
      if (cached) {
        logger.debug(`Cache hit for ${this.modelName}`, { id });
        return cached;
      }

      // Query database
      const document = await this.model.findById(id).lean().exec();

      if (document) {
        // Cache the result
        await advancedCache.set(cacheKey, document, { ttl });
        logger.debug(`Cached ${this.modelName}`, { id, ttl });
      }

      return document as T;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID with cache`, { error, id });
      throw new AppError(`Failed to find ${this.modelName}`, 500, error);
    }
  }

  /**
   * Find many documents with lean queries for better performance
   */
  async findManyLean(filter: FilterQuery<T>, options: QueryOptions = {}): Promise<T[]> {
    try {
      const query = this.model.find(filter, null, options).lean();

      // Add default sorting if not specified
      if (!options.sort) {
        query.sort({ createdAt: -1 });
      }

      const documents = await query.exec();

      logger.debug(`Found ${documents.length} ${this.modelName} documents (lean)`, {
        filter: Object.keys(filter),
        count: documents.length
      });

      return documents as T[];
    } catch (error) {
      logger.error(`Error finding ${this.modelName} with lean query`, { error, filter });
      throw new AppError(`Failed to find ${this.modelName}`, 500, error);
    }
  }

  /**
   * Execute aggregation pipeline with optimization
   */
  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    try {
      // Add explain option in development for query optimization
      const options = process.env.NODE_ENV === 'development' ? { explain: false } : {};

      const result = await this.model.aggregate(pipeline, options).exec();

      logger.debug(`Aggregation completed for ${this.modelName}`, {
        stages: pipeline.length,
        resultCount: result.length
      });

      return result;
    } catch (error) {
      logger.error(`Error in ${this.modelName} aggregation`, { error, pipeline });
      throw new AppError(`Failed to aggregate ${this.modelName}`, 500, error);
    }
  }

  /**
   * Bulk write operations for better performance
   */
  async bulkWrite(operations: any[]): Promise<any> {
    try {
      const result = await this.model.bulkWrite(operations, {
        ordered: false, // Better performance for independent operations
        bypassDocumentValidation: false
      });

      logger.info(`Bulk write completed for ${this.modelName}`, {
        operations: operations.length,
        result: {
          insertedCount: result.insertedCount,
          modifiedCount: result.modifiedCount,
          deletedCount: result.deletedCount,
          upsertedCount: result.upsertedCount
        }
      });

      return result;
    } catch (error) {
      logger.error(`Error in ${this.modelName} bulk write`, { error, operations: operations.length });
      throw new AppError(`Failed to bulk write ${this.modelName}`, 500, error);
    }
  }

  /**
   * Clear cache for this model
   */
  protected async clearCache(pattern?: string): Promise<void> {
    try {
      // Use tag-based invalidation if pattern is provided
      if (pattern) {
        await advancedCache.invalidateByTags([`${this.modelName}:${pattern}`]);
      } else {
        await advancedCache.invalidateByTags([this.modelName]);
      }

      logger.debug(`Cleared cache entries for ${this.modelName}`, { pattern });
    } catch (error) {
      logger.warn(`Error clearing cache for ${this.modelName}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  protected getCacheStats() {
    return advancedCache.getStats();
  }
}
