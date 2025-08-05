import { BaseService } from './BaseService';
import { IBusinessAnalytics } from '../types/models';
export declare class BusinessAnalyticsService extends BaseService<IBusinessAnalytics> {
    constructor();
    createAnalytics(analyticsData: Partial<IBusinessAnalytics>, createdBy?: string): Promise<IBusinessAnalytics>;
    getAnalyticsByCompany(companyId: string, options?: any): Promise<IBusinessAnalytics[]>;
    generateSalesAnalytics(companyId: string, dateRange: {
        start: Date;
        end: Date;
    }): Promise<any>;
    generateInventoryAnalytics(companyId: string): Promise<any>;
    private validateAnalyticsData;
}
//# sourceMappingURL=BusinessAnalyticsService.d.ts.map