import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IDispatch } from '../types/models';
export declare class DispatchController extends BaseController<IDispatch> {
    private dispatchService;
    constructor();
    createDispatch(req: Request, res: Response): Promise<void>;
    updateDispatchStatus(req: Request, res: Response): Promise<void>;
    getDispatchesByCompany(req: Request, res: Response): Promise<void>;
    getDispatchStats(req: Request, res: Response): Promise<void>;
    getDispatchById(req: Request, res: Response): Promise<void>;
    updateDispatch(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DispatchController.d.ts.map