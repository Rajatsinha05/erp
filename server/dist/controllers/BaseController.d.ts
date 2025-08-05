import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { BaseService } from '@/services/BaseService';
import { OptimizedQueryOptions } from '../utils/query-optimizer';
export interface IBaseController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare abstract class BaseController<T extends Document> implements IBaseController {
    protected service: BaseService<T>;
    protected modelName: string;
    constructor(service: BaseService<T>, modelName: string);
    protected handleValidationErrors(req: Request): void;
    protected getUserInfo(req: Request): {
        userId?: string;
        companyId?: string;
    };
    protected sendSuccess(res: Response, data: any, message?: string, statusCode?: number): void;
    protected sendPaginatedResponse(res: Response, result: {
        documents: any[];
        pagination: any;
    }, message?: string): void;
    protected sendError(res: Response, error: any, message?: string, statusCode?: number): void;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    count(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
    export(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    protected buildFilterFromQuery(query: any): any;
    protected validateCompanyAccess(req: Request, documentCompanyId: string): void;
    protected parseQueryOptions(req: Request): OptimizedQueryOptions;
    protected parseSortParam(sortParam: string): Record<string, 1 | -1>;
    protected getSearchFields(): string[];
    protected sendOptimizedPaginatedResponse<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): void;
    protected validateRequestWithTracking(req: Request): void;
    protected setCacheHeaders(res: Response, maxAge?: number): void;
    protected logControllerPerformance(operation: string, startTime: number, req: Request, resultCount?: number): void;
}
//# sourceMappingURL=BaseController.d.ts.map