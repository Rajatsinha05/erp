import { Request, Response } from 'express';
export declare class CustomerVisitController {
    private customerVisitService;
    constructor();
    private sendSuccess;
    private sendError;
    createCustomerVisit(req: Request, res: Response): Promise<void>;
    getAllCustomerVisits(req: Request, res: Response): Promise<void>;
    getCustomerVisitById(req: Request, res: Response): Promise<void>;
    updateCustomerVisit(req: Request, res: Response): Promise<void>;
    deleteCustomerVisit(req: Request, res: Response): Promise<void>;
    approveVisit(req: Request, res: Response): Promise<void>;
    rejectVisit(req: Request, res: Response): Promise<void>;
    markAsReimbursed(req: Request, res: Response): Promise<void>;
    addFoodExpense(req: Request, res: Response): Promise<void>;
    addGift(req: Request, res: Response): Promise<void>;
    getExpenseStats(req: Request, res: Response): Promise<void>;
    getPendingApprovals(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CustomerVisitController.d.ts.map