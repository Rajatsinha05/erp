import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IReport } from '../types/models';
export declare class ReportController extends BaseController<IReport> {
    private reportService;
    constructor();
    createReport(req: Request, res: Response): Promise<void>;
    getReportsByCompany(req: Request, res: Response): Promise<void>;
    generateSalesReport(req: Request, res: Response): Promise<void>;
    generateInventoryReport(req: Request, res: Response): Promise<void>;
    generateProductionReport(req: Request, res: Response): Promise<void>;
    getReportStats(req: Request, res: Response): Promise<void>;
    getReportById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map