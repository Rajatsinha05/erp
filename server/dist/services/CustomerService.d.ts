import { BaseService } from './BaseService';
import { ICustomer } from '../types/models';
export declare class CustomerService extends BaseService<ICustomer> {
    constructor();
    createCustomer(customerData: Partial<ICustomer>, createdBy?: string): Promise<ICustomer>;
    getCustomerByCode(customerCode: string, companyId: string): Promise<ICustomer | null>;
    getCustomersByCompany(companyId: string, options?: any): Promise<ICustomer[]>;
    updateCreditLimit(customerId: string, creditLimit: number, updatedBy?: string): Promise<ICustomer | null>;
    getCustomerStats(companyId: string): Promise<any>;
    private generateCustomerCode;
    private validateCustomerData;
}
//# sourceMappingURL=CustomerService.d.ts.map