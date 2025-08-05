import { BaseService } from './BaseService';
import { IWarehouse } from '../types/models';
export declare class WarehouseService extends BaseService<IWarehouse> {
    constructor();
    createWarehouse(warehouseData: Partial<IWarehouse>, createdBy?: string): Promise<IWarehouse>;
    getWarehouseByCode(warehouseCode: string, companyId: string): Promise<IWarehouse | null>;
    getWarehousesByCompany(companyId: string, options?: any): Promise<IWarehouse[]>;
    getWarehousesByType(companyId: string, warehouseType: string): Promise<IWarehouse[]>;
    updateWarehouseCapacity(warehouseId: string, capacity: {
        totalArea?: number;
        storageCapacity?: number;
        maxWeight?: number;
    }, updatedBy?: string): Promise<IWarehouse | null>;
    addStorageZone(warehouseId: string, zoneData: any, addedBy?: string): Promise<IWarehouse | null>;
    getWarehouseUtilization(warehouseId: string): Promise<any>;
    getWarehouseStats(companyId: string): Promise<any>;
    private generateWarehouseCode;
    private validateWarehouseData;
}
//# sourceMappingURL=WarehouseService.d.ts.map