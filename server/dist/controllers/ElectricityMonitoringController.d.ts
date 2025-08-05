import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IElectricityMonitoring } from '../types/models';
export declare class ElectricityMonitoringController extends BaseController<IElectricityMonitoring> {
    private electricityMonitoringService;
    constructor();
    createMonitoringEntry(req: Request, res: Response): Promise<void>;
    getMonitoringByCompany(req: Request, res: Response): Promise<void>;
    getConsumptionStats(req: Request, res: Response): Promise<void>;
    getSolarVsPGVCLComparison(req: Request, res: Response): Promise<void>;
    getMonitoringById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ElectricityMonitoringController.d.ts.map