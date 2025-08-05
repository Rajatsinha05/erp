import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ISpare } from '@/types/models';
export declare class SpareController extends BaseController<ISpare> {
    private spareService;
    constructor();
    createSpare(req: Request, res: Response): Promise<void>;
    getSparesByCompany(req: Request, res: Response): Promise<void>;
    getSpareStats(req: Request, res: Response): Promise<void>;
    getLowStockSpares(req: Request, res: Response): Promise<void>;
    updateStock(req: Request, res: Response): Promise<void>;
    getSpareById(req: Request, res: Response): Promise<void>;
    updateSpare(req: Request, res: Response): Promise<void>;
    deleteSpare(req: Request, res: Response): Promise<void>;
    getSparesByCategory(req: Request, res: Response): Promise<void>;
    checkSpareCodeUnique(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=SpareController.d.ts.map