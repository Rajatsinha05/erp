import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IStockMovement } from '../types/models';
export declare class StockMovementController extends BaseController<IStockMovement> {
    private stockMovementService;
    constructor();
    createStockMovement(req: Request, res: Response): Promise<void>;
    getMovementsByItem(req: Request, res: Response): Promise<void>;
    getMovementsByWarehouse(req: Request, res: Response): Promise<void>;
    getMovementsByCompany(req: Request, res: Response): Promise<void>;
    getMovementStats(req: Request, res: Response): Promise<void>;
    getStockMovementById(req: Request, res: Response): Promise<void>;
    updateStockMovement(req: Request, res: Response): Promise<void>;
    getMovementsByReference(req: Request, res: Response): Promise<void>;
    getRecentMovements(req: Request, res: Response): Promise<void>;
    searchMovements(req: Request, res: Response): Promise<void>;
    getInventoryLevels(req: Request, res: Response): Promise<void>;
    generateMovementNumber(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=StockMovementController.d.ts.map