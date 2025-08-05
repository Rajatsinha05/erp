import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IInventoryItem } from '../types/models';
export declare class InventoryController extends BaseController<IInventoryItem> {
    private inventoryService;
    constructor();
    createInventoryItem(req: Request, res: Response): Promise<void>;
    getItemByCode(req: Request, res: Response): Promise<void>;
    getItemsByCompany(req: Request, res: Response): Promise<void>;
    updateStock(req: Request, res: Response): Promise<void>;
    reserveStock(req: Request, res: Response): Promise<void>;
    releaseReservedStock(req: Request, res: Response): Promise<void>;
    getLowStockItems(req: Request, res: Response): Promise<void>;
    getInventoryStats(req: Request, res: Response): Promise<void>;
    updateInventoryItem(req: Request, res: Response): Promise<void>;
    deleteInventoryItem(req: Request, res: Response): Promise<void>;
    searchItems(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=InventoryController.d.ts.map