import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IAuditLog } from '../types/models';
export declare class AuditLogController extends BaseController<IAuditLog> {
    private auditLogService;
    constructor();
    createAuditLog(req: Request, res: Response): Promise<void>;
    logUserAction(req: Request, res: Response): Promise<void>;
    getAuditLogsByCompany(req: Request, res: Response): Promise<void>;
    getAuditLogsByUser(req: Request, res: Response): Promise<void>;
    getAuditLogsByResource(req: Request, res: Response): Promise<void>;
    getAuditStats(req: Request, res: Response): Promise<void>;
    getAuditLogById(req: Request, res: Response): Promise<void>;
    searchAuditLogs(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuditLogController.d.ts.map