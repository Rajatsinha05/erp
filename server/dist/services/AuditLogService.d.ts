import { BaseService } from './BaseService';
import { IAuditLog } from '../types/models';
export declare class AuditLogService extends BaseService<IAuditLog> {
    constructor();
    createAuditLog(auditData: Partial<IAuditLog>, createdBy?: string): Promise<IAuditLog>;
    logUserAction(userId: string, companyId: string, action: string, resourceType: string, resourceId?: string, details?: any, ipAddress?: string, userAgent?: string): Promise<IAuditLog>;
    logSystemEvent(companyId: string, action: string, resourceType: string, resourceId?: string, details?: any, severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<IAuditLog>;
    getAuditLogsByUser(userId: string, companyId: string, options?: any): Promise<IAuditLog[]>;
    getAuditLogsByResource(resourceType: string, resourceId: string, companyId: string, options?: any): Promise<IAuditLog[]>;
    getAuditLogsByCompany(companyId: string, options?: any): Promise<IAuditLog[]>;
    getAuditStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    cleanOldLogs(companyId: string, retentionDays?: number): Promise<number>;
    private validateAuditData;
}
//# sourceMappingURL=AuditLogService.d.ts.map