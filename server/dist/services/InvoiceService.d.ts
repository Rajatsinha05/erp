import { BaseService } from './BaseService';
import { IInvoice } from '../types/models';
export declare class InvoiceService extends BaseService<IInvoice> {
    constructor();
    createInvoice(invoiceData: Partial<IInvoice>, createdBy?: string): Promise<IInvoice>;
    updateInvoiceStatus(invoiceId: string, status: string, updatedBy?: string): Promise<IInvoice | null>;
    recordPayment(invoiceId: string, paymentAmount: number, paymentMethod: string, paymentDate?: Date, recordedBy?: string): Promise<IInvoice | null>;
    getInvoicesByCustomer(customerId: string, companyId: string, options?: any): Promise<IInvoice[]>;
    getOverdueInvoices(companyId: string): Promise<IInvoice[]>;
    getInvoiceStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private calculateInvoiceTotals;
    generateInvoiceNumber(companyId: string, invoiceType?: string, financialYear?: string): Promise<string>;
    calculateInvoiceAmounts(invoiceData: any): Promise<any>;
    private getCurrentFinancialYear;
    private generateInvoiceNumberInternal;
    private validateStatusTransition;
    private validateInvoiceData;
}
//# sourceMappingURL=InvoiceService.d.ts.map