import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ISecurityLog } from '../types/models';
export declare class SecurityLogController extends BaseController<ISecurityLog> {
    private securityLogService;
    constructor();
    createSecurityLog(req: Request, res: Response): Promise<void>;
    getSecurityLogsByCompany(req: Request, res: Response): Promise<void>;
    getSecurityStats(req: Request, res: Response): Promise<void>;
    getSecurityLogById(req: Request, res: Response): Promise<void>;
    updateSecurityLog(req: Request, res: Response): Promise<void>;
    searchSecurityLogs(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=SecurityLogController.d.ts.map