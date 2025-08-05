import { BaseService } from './BaseService';
import { IStockMovement } from '../types/models';
export declare class StockMovementService extends BaseService<IStockMovement> {
    constructor();
    createStockMovement(movementData: Partial<IStockMovement>, createdBy?: string): Promise<IStockMovement>;
    getMovementsByItem(itemId: string, options?: any): Promise<IStockMovement[]>;
    getMovementsByWarehouse(warehouseId: string, options?: any): Promise<IStockMovement[]>;
    getMovementsByDateRange(companyId: string, startDate: Date, endDate: Date, options?: any): Promise<IStockMovement[]>;
    getMovementsByType(companyId: string, movementType: string, options?: any): Promise<IStockMovement[]>;
    getMovementStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    getItemMovementHistory(itemId: string, companyId: string): Promise<any[]>;
    private generateMovementNumber;
    private validateMovementData;
}
//# sourceMappingURL=StockMovementService.d.ts.map