import { BaseService } from './BaseService';
import { IFinancialTransaction } from '../types/models';
export declare class FinancialTransactionService extends BaseService<IFinancialTransaction> {
    constructor();
    createTransaction(transactionData: Partial<IFinancialTransaction>, createdBy?: string): Promise<IFinancialTransaction>;
    updateTransactionStatus(transactionId: string, status: string, updatedBy?: string): Promise<IFinancialTransaction | null>;
    getTransactionsByCompany(companyId: string, options?: any): Promise<IFinancialTransaction[]>;
    getTransactionsByType(companyId: string, transactionType: string, options?: any): Promise<IFinancialTransaction[]>;
    getTransactionStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private generateTransactionNumber;
    private validateTransactionData;
}
//# sourceMappingURL=FinancialTransactionService.d.ts.map