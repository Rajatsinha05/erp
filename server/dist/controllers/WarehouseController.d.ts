import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IWarehouse } from '../types/models';
export declare class WarehouseController extends BaseController<IWarehouse> {
    private warehouseService;
    constructor();
    createWarehouse(req: Request, res: Response): Promise<void>;
    getWarehouseByCode(req: Request, res: Response): Promise<void>;
    getWarehousesByCompany(req: Request, res: Response): Promise<void>;
    getWarehousesByType(req: Request, res: Response): Promise<void>;
    updateWarehouseCapacity(req: Request, res: Response): Promise<void>;
    addStorageZone(req: Request, res: Response): Promise<void>;
    getWarehouseUtilization(req: Request, res: Response): Promise<void>;
    getWarehouseStats(req: Request, res: Response): Promise<void>;
    updateWarehouse(req: Request, res: Response): Promise<void>;
    getWarehouseById(req: Request, res: Response): Promise<void>;
    deleteWarehouse(req: Request, res: Response): Promise<void>;
    searchWarehouses(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=WarehouseController.d.ts.map