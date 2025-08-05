import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IPurchaseOrder } from '../types/models';
export declare class PurchaseOrderController extends BaseController<IPurchaseOrder> {
    private purchaseOrderService;
    constructor();
    createPurchaseOrder(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<void>;
    receiveItems(req: Request, res: Response): Promise<void>;
    getOrdersBySupplier(req: Request, res: Response): Promise<void>;
    getOrdersByStatus(req: Request, res: Response): Promise<void>;
    getOrderStats(req: Request, res: Response): Promise<void>;
    getOrdersByCompany(req: Request, res: Response): Promise<void>;
    updatePurchaseOrder(req: Request, res: Response): Promise<void>;
    getPurchaseOrderById(req: Request, res: Response): Promise<void>;
    deletePurchaseOrder(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PurchaseOrderController.d.ts.map