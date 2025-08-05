import { BaseService } from './BaseService';
import { IPurchaseOrder } from '../types/models';
export declare class PurchaseOrderService extends BaseService<IPurchaseOrder> {
    constructor();
    createPurchaseOrder(orderData: Partial<IPurchaseOrder>, createdBy?: string): Promise<IPurchaseOrder>;
    updateOrderStatus(orderId: string, status: string, updatedBy?: string): Promise<IPurchaseOrder | null>;
    getOrdersByStatus(companyId: string, status: string, options?: any): Promise<IPurchaseOrder[]>;
    getOrdersBySupplier(supplierId: string, companyId: string, options?: any): Promise<IPurchaseOrder[]>;
    getOrderStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    getOverdueOrders(companyId: string): Promise<IPurchaseOrder[]>;
    getPurchaseOrderStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private calculateOrderTotals;
    private generateOrderNumber;
    receiveItems(orderId: string, receivedItems: any[], receivedBy?: string): Promise<IPurchaseOrder | null>;
    private validateStatusTransition;
    private validateOrderData;
}
//# sourceMappingURL=PurchaseOrderService.d.ts.map