import { BaseService } from './BaseService';
import { IReport } from '../types/models';
export declare class ReportService extends BaseService<IReport> {
    constructor();
    createReport(reportData: Partial<IReport>, createdBy?: string): Promise<IReport>;
    getReportsByCompany(companyId: string, options?: any): Promise<IReport[]>;
    generateSalesReport(companyId: string, dateRange: {
        start: Date;
        end: Date;
    }, format?: string): Promise<any>;
    generateInventoryReport(companyId: string, format?: string): Promise<any>;
    generateProductionReport(companyId: string, dateRange: {
        start: Date;
        end: Date;
    }, format?: string): Promise<any>;
    getReportStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private validateReportData;
}
//# sourceMappingURL=ReportService.d.ts.map