import { BaseService } from './BaseService';
import { IInventoryItem, IStockMovement } from '@/types/models';
export declare class InventoryService extends BaseService<IInventoryItem> {
    constructor();
    createInventoryItem(itemData: Partial<IInventoryItem>, createdBy?: string): Promise<IInventoryItem>;
    updateStock(itemId: string, warehouseId: string, quantity: number, movementType: 'in' | 'out' | 'transfer' | 'adjustment', reference?: string, notes?: string, updatedBy?: string): Promise<IInventoryItem | null>;
    reserveStock(itemId: string, quantity: number, reference?: string, reservedBy?: string): Promise<IInventoryItem | null>;
    releaseReservedStock(itemId: string, quantity: number, reference?: string, releasedBy?: string): Promise<IInventoryItem | null>;
    getLowStockItems(companyId: string): Promise<IInventoryItem[]>;
    getStockMovementHistory(itemId: string, limit?: number): Promise<IStockMovement[]>;
    searchItems(companyId: string, searchTerm: string, page?: number, limit?: number): Promise<{
        documents: IInventoryItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextPage: number;
            prevPage: number;
        };
    }>;
    getInventoryStats(companyId: string): Promise<{
        totalItems: number;
        activeItems: number;
        inactiveItems: number;
        lowStockItems: number;
        outOfStockItems: number;
        totalValue: number;
        averageValue: number;
    }>;
    private createStockMovement;
    private calculateTotalInventoryValue;
    private generateItemCode;
    private validateInventoryItemData;
}
//# sourceMappingURL=InventoryService.d.ts.map