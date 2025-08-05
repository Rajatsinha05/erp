import { BaseService } from './BaseService';
import { ISpare } from '@/types/models';
export interface SpareFilters {
    companyId?: string;
    category?: string;
    manufacturer?: string;
    isActive?: boolean;
    isLowStock?: boolean;
    isCritical?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SpareStats {
    totalSpares: number;
    activeSpares: number;
    lowStockSpares: number;
    criticalSpares: number;
    outOfStockSpares: number;
    totalValue: number;
    categoriesBreakdown: Array<{
        category: string;
        count: number;
        value: number;
    }>;
    criticalityBreakdown: Array<{
        criticality: string;
        count: number;
    }>;
}
export declare class SpareService extends BaseService<ISpare> {
    constructor();
    getSparesByCompany(filters: SpareFilters): Promise<{
        spares: ISpare[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getSpareStats(companyId: string): Promise<SpareStats>;
    getLowStockSpares(companyId: string): Promise<ISpare[]>;
    updateStock(spareId: string, stockUpdate: {
        quantity: number;
        type: 'inward' | 'outward' | 'adjustment';
        reason: string;
        userId: string;
        warehouseId?: string;
    }): Promise<ISpare | null>;
    isSpareCodeUnique(companyId: string, spareCode: string, excludeId?: string): Promise<boolean>;
    getSparesByCategory(companyId: string, category: string): Promise<ISpare[]>;
}
//# sourceMappingURL=SpareService.d.ts.map