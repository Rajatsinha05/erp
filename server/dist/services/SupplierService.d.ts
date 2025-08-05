import { BaseService } from './BaseService';
import { ISupplier } from '../types/models';
export declare class SupplierService extends BaseService<ISupplier> {
    constructor();
    createSupplier(supplierData: Partial<ISupplier>, createdBy?: string): Promise<ISupplier>;
    getSupplierByCode(supplierCode: string, companyId: string): Promise<ISupplier | null>;
    getSuppliersByCompany(companyId: string, options?: any): Promise<ISupplier[]>;
    getSuppliersByCategory(companyId: string, category: string): Promise<ISupplier[]>;
    updateSupplierRating(supplierId: string, rating: number, ratedBy?: string): Promise<ISupplier | null>;
    getSupplierStats(companyId: string): Promise<any>;
    private generateSupplierCode;
    private validateSupplierData;
}
//# sourceMappingURL=SupplierService.d.ts.map