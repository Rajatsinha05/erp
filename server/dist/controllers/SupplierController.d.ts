import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ISupplier } from '../types/models';
export declare class SupplierController extends BaseController<ISupplier> {
    private supplierService;
    constructor();
    createSupplier(req: Request, res: Response): Promise<void>;
    getSupplierByCode(req: Request, res: Response): Promise<void>;
    getSuppliersByCompany(req: Request, res: Response): Promise<void>;
    getSuppliersByCategory(req: Request, res: Response): Promise<void>;
    updateSupplier(req: Request, res: Response): Promise<void>;
    updateSupplierRating(req: Request, res: Response): Promise<void>;
    getSupplierStats(req: Request, res: Response): Promise<void>;
    deleteSupplier(req: Request, res: Response): Promise<void>;
    getSupplierById(req: Request, res: Response): Promise<void>;
    searchSuppliers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=SupplierController.d.ts.map