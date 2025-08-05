import { BaseService } from './BaseService';
import { IQuotation } from '../types/models';
export declare class QuotationService extends BaseService<IQuotation> {
    constructor();
    createQuotation(quotationData: Partial<IQuotation>, createdBy?: string): Promise<IQuotation>;
    updateQuotationStatus(quotationId: string, status: string, updatedBy?: string): Promise<IQuotation | null>;
    convertToOrder(quotationId: string, convertedBy?: string): Promise<any>;
    getQuotationsByCustomer(customerId: string, companyId: string, options?: any): Promise<IQuotation[]>;
    getExpiredQuotations(companyId: string): Promise<IQuotation[]>;
    getQuotationStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private calculateQuotationTotals;
    private generateQuotationNumber;
    private validateStatusTransition;
    private validateQuotationData;
}
//# sourceMappingURL=QuotationService.d.ts.map