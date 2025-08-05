import { BaseService } from './BaseService';
import { ICustomerOrder } from '../types/models';
export declare class CustomerOrderService extends BaseService<ICustomerOrder> {
    constructor();
    createCustomerOrder(orderData: Partial<ICustomerOrder>, createdBy?: string): Promise<ICustomerOrder>;
    updateOrderStatus(orderId: string, status: string, updatedBy?: string): Promise<ICustomerOrder | null>;
    getOrdersByCustomer(customerId: string, companyId: string, options?: any): Promise<ICustomerOrder[]>;
    getOrdersByStatus(companyId: string, status: string, options?: any): Promise<ICustomerOrder[]>;
    getOrderStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private calculateOrderTotals;
    private generateOrderNumber;
    private validateStatusTransition;
    private validateOrderData;
}
//# sourceMappingURL=CustomerOrderService.d.ts.map