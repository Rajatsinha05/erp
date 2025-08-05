import { BaseService } from './BaseService';
import { IElectricityMonitoring } from '../types/models';
export declare class ElectricityMonitoringService extends BaseService<IElectricityMonitoring> {
    constructor();
    createMonitoringSystem(monitoringData: Partial<IElectricityMonitoring>, createdBy?: string): Promise<IElectricityMonitoring>;
    getMonitoringByCompany(companyId: string, options?: any): Promise<IElectricityMonitoring[]>;
    getConsumptionStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    getEnergySourceComparison(companyId: string, dateRange: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private validateMonitoringData;
}
//# sourceMappingURL=ElectricityMonitoringService.d.ts.map