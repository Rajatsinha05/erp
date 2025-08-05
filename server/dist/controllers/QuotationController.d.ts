import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IQuotation } from '../types/models';
export declare class QuotationController extends BaseController<IQuotation> {
    private quotationService;
    constructor();
    createQuotation(req: Request, res: Response): Promise<void>;
    updateQuotationStatus(req: Request, res: Response): Promise<void>;
    convertToOrder(req: Request, res: Response): Promise<void>;
    getQuotationsByCustomer(req: Request, res: Response): Promise<void>;
    getExpiredQuotations(req: Request, res: Response): Promise<void>;
    getQuotationStats(req: Request, res: Response): Promise<void>;
    getQuotationsByCompany(req: Request, res: Response): Promise<void>;
    updateQuotation(req: Request, res: Response): Promise<void>;
    getQuotationById(req: Request, res: Response): Promise<void>;
    deleteQuotation(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=QuotationController.d.ts.map