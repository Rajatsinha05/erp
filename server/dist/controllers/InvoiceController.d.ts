import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IInvoice } from '../types/models';
export declare class InvoiceController extends BaseController<IInvoice> {
    private invoiceService;
    constructor();
    createInvoice(req: Request, res: Response): Promise<void>;
    updateInvoiceStatus(req: Request, res: Response): Promise<void>;
    recordPayment(req: Request, res: Response): Promise<void>;
    getInvoicesByCustomer(req: Request, res: Response): Promise<void>;
    getOverdueInvoices(req: Request, res: Response): Promise<void>;
    getInvoiceStats(req: Request, res: Response): Promise<void>;
    getInvoicesByCompany(req: Request, res: Response): Promise<void>;
    updateInvoice(req: Request, res: Response): Promise<void>;
    getInvoiceById(req: Request, res: Response): Promise<void>;
    deleteInvoice(req: Request, res: Response): Promise<void>;
    generateInvoiceNumber(req: Request, res: Response): Promise<void>;
    generateInvoicePDF(req: Request, res: Response): Promise<void>;
    previewInvoice(req: Request, res: Response): Promise<void>;
    private getCurrentFinancialYear;
}
//# sourceMappingURL=InvoiceController.d.ts.map