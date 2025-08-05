import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { ICompany } from '@/types/models';
export declare class CompanyController extends BaseController<ICompany> {
    private companyService;
    constructor();
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCode(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveCompanies(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    addBranch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompanyStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    reactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    private buildCompanyFilter;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompaniesForInvoiceSelection(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompanyInvoiceDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    protected validateCompanyAccess(req: Request, documentCompanyId: string): void;
}
//# sourceMappingURL=CompanyController.d.ts.map