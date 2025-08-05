import { BaseService } from './BaseService';
import { IProductionOrder } from '@/types/models';
export declare class ProductionService extends BaseService<IProductionOrder> {
    private inventoryService;
    constructor();
    createProductionOrder(orderData: Partial<IProductionOrder>, createdBy?: string): Promise<IProductionOrder>;
    startProduction(orderId: string, startedBy?: string): Promise<IProductionOrder | null>;
    completeStage(orderId: string, stageIndex: number, completionData: {
        actualQuantity?: number;
        qualityNotes?: string;
        defectQuantity?: number;
        completedBy?: string;
    }): Promise<IProductionOrder | null>;
    completeProduction(orderId: string, completionData: {
        actualQuantity: number;
        qualityNotes?: string;
        completedBy?: string;
    }): Promise<IProductionOrder | null>;
    cancelProduction(orderId: string, reason: string, cancelledBy?: string): Promise<IProductionOrder | null>;
    getProductionStats(companyId: string, startDate?: Date, endDate?: Date): Promise<{
        totalOrders: any;
        completedOrders: any;
        inProgressOrders: any;
        cancelledOrders: any;
        draftOrders: any;
        totalPlannedQuantity: any;
        totalActualQuantity: any;
        averagePlannedQuantity: any;
        averageActualQuantity: any;
        completionRate: number;
        efficiency: number;
    }>;
    private checkMaterialAvailability;
    private reserveMaterials;
    private releaseMaterials;
    private calculateMaterialCost;
    private validateRawMaterials;
    private generateOrderNumber;
    private getTotalPlannedQuantity;
    private getTotalActualQuantity;
    private validateProductionOrderData;
}
//# sourceMappingURL=ProductionService.d.ts.map