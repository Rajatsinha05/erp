import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IProductionOrder } from '../types/models';
export declare class ProductionController extends BaseController<IProductionOrder> {
    private productionService;
    constructor();
    createProductionOrder(req: Request, res: Response): Promise<void>;
    startProduction(req: Request, res: Response): Promise<void>;
    completeStage(req: Request, res: Response): Promise<void>;
    completeProduction(req: Request, res: Response): Promise<void>;
    cancelProduction(req: Request, res: Response): Promise<void>;
    getProductionOrdersByCompany(req: Request, res: Response): Promise<void>;
    getOrdersByStatus(req: Request, res: Response): Promise<void>;
    getProductionStats(req: Request, res: Response): Promise<void>;
    updateProductionOrder(req: Request, res: Response): Promise<void>;
    getProductionOrderById(req: Request, res: Response): Promise<void>;
    getOrderByNumber(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ProductionController.d.ts.map