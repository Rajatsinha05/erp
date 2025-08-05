import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IFinancialTransaction } from '../types/models';
export declare class FinancialTransactionController extends BaseController<IFinancialTransaction> {
    private financialTransactionService;
    constructor();
    createTransaction(req: Request, res: Response): Promise<void>;
    updateTransactionStatus(req: Request, res: Response): Promise<void>;
    getTransactionsByCompany(req: Request, res: Response): Promise<void>;
    getTransactionsByType(req: Request, res: Response): Promise<void>;
    getTransactionStats(req: Request, res: Response): Promise<void>;
    getTransactionById(req: Request, res: Response): Promise<void>;
    updateTransaction(req: Request, res: Response): Promise<void>;
    deleteTransaction(req: Request, res: Response): Promise<void>;
    searchTransactions(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=FinancialTransactionController.d.ts.map