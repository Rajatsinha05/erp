import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ICustomerOrder } from '../types/models';
export declare class CustomerOrderController extends BaseController<ICustomerOrder> {
    private customerOrderService;
    constructor();
    createCustomerOrder(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<void>;
    getOrdersByCustomer(req: Request, res: Response): Promise<void>;
    getOrdersByStatus(req: Request, res: Response): Promise<void>;
    getOrderStats(req: Request, res: Response): Promise<void>;
    getOrdersByCompany(req: Request, res: Response): Promise<void>;
    updateCustomerOrder(req: Request, res: Response): Promise<void>;
    getCustomerOrderById(req: Request, res: Response): Promise<void>;
    deleteCustomerOrder(req: Request, res: Response): Promise<void>;
    getOrderByNumber(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CustomerOrderController.d.ts.map