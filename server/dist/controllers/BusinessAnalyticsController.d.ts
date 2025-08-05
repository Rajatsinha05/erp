import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IBusinessAnalytics } from '../types/models';
export declare class BusinessAnalyticsController extends BaseController<IBusinessAnalytics> {
    private businessAnalyticsService;
    constructor();
    createAnalytics(req: Request, res: Response): Promise<void>;
    getAnalyticsByCompany(req: Request, res: Response): Promise<void>;
    generateSalesAnalytics(req: Request, res: Response): Promise<void>;
    generateInventoryAnalytics(req: Request, res: Response): Promise<void>;
    getAnalyticsById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=BusinessAnalyticsController.d.ts.map