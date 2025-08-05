import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, PipelineStage } from 'mongoose';
export interface IBaseService<T> {
    create(data: Partial<T>, userId?: string): Promise<T>;
    findById(id: string, populate?: string[]): Promise<T | null>;
    findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null>;
    findMany(filter: FilterQuery<T>, options?: QueryOptions, populate?: string[]): Promise<T[]>;
    update(id: string, data: UpdateQuery<T>, userId?: string): Promise<T | null>;
    delete(id: string, userId?: string): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    findByIdCached(id: string, ttl?: number): Promise<T | null>;
    findManyLean(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
    aggregate(pipeline: PipelineStage[]): Promise<any[]>;
    bulkWrite(operations: any[]): Promise<any>;
}
export declare abstract class BaseService<T extends Document> implements IBaseService<T> {
    protected model: Model<T>;
    protected modelName: string;
    constructor(model: Model<T>);
    create(data: Partial<T>, userId?: string): Promise<T>;
    findById(id: string, populate?: string[]): Promise<T | null>;
    findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null>;
    findMany(filter: FilterQuery<T>, options?: QueryOptions, populate?: string[]): Promise<T[]>;
    update(id: string, data: UpdateQuery<T>, userId?: string): Promise<T | null>;
    delete(id: string, userId?: string): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    findByCompany(companyId: string, filter?: FilterQuery<T>, options?: QueryOptions, populate?: string[]): Promise<T[]>;
    paginate(filter: FilterQuery<T>, page?: number, limit?: number, sort?: any, populate?: string[]): Promise<{
        documents: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextPage: number;
            prevPage: number;
        };
    }>;
    bulkCreate(documents: Partial<T>[], userId?: string): Promise<T[]>;
    bulkUpdate(updates: Array<{
        filter: FilterQuery<T>;
        update: UpdateQuery<T>;
    }>, userId?: string): Promise<any>;
    findByIdCached(id: string, ttl?: number): Promise<T | null>;
    findManyLean(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
    aggregate(pipeline: PipelineStage[]): Promise<any[]>;
    bulkWrite(operations: any[]): Promise<any>;
    protected clearCache(pattern?: string): Promise<void>;
    protected getCacheStats(): import("../utils/advanced-cache").CacheStats;
}
//# sourceMappingURL=BaseService.d.ts.map