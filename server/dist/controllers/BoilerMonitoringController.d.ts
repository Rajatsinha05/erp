import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IBoilerMonitoring } from '../types/models';
export declare class BoilerMonitoringController extends BaseController<IBoilerMonitoring> {
    private boilerMonitoringService;
    constructor();
    createMonitoringEntry(req: Request, res: Response): Promise<void>;
    getMonitoringByCompany(req: Request, res: Response): Promise<void>;
    getTemperatureAlerts(req: Request, res: Response): Promise<void>;
    getBoilerStats(req: Request, res: Response): Promise<void>;
    getMonitoringById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=BoilerMonitoringController.d.ts.map