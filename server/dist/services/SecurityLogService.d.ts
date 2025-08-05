import { BaseService } from './BaseService';
import { ISecurityLog } from '../types/models';
export declare class SecurityLogService extends BaseService<ISecurityLog> {
    constructor();
    createSecurityLog(securityData: Partial<ISecurityLog>, createdBy?: string): Promise<ISecurityLog>;
    getSecurityLogsByCompany(companyId: string, options?: any): Promise<ISecurityLog[]>;
    getSecurityStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private validateSecurityData;
}
//# sourceMappingURL=SecurityLogService.d.ts.map