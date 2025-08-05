import { BaseService } from './BaseService';
import { IBoilerMonitoring } from '../types/models';
export declare class BoilerMonitoringService extends BaseService<IBoilerMonitoring> {
    constructor();
    createBoilerMonitoring(monitoringData: Partial<IBoilerMonitoring>, createdBy?: string): Promise<IBoilerMonitoring>;
    getMonitoringByCompany(companyId: string, options?: any): Promise<IBoilerMonitoring[]>;
    getBoilerAlerts(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<IBoilerMonitoring[]>;
    getBoilerStats(companyId: string, boilerId?: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private validateMonitoringData;
}
//# sourceMappingURL=BoilerMonitoringService.d.ts.map