import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ICustomer } from '../types/models';
export declare class CustomerController extends BaseController<ICustomer> {
    private customerService;
    constructor();
    createCustomer(req: Request, res: Response): Promise<void>;
    getCustomerByCode(req: Request, res: Response): Promise<void>;
    getCustomersByCompany(req: Request, res: Response): Promise<void>;
    updateCustomer(req: Request, res: Response): Promise<void>;
    updateCreditLimit(req: Request, res: Response): Promise<void>;
    getCustomerStats(req: Request, res: Response): Promise<void>;
    deleteCustomer(req: Request, res: Response): Promise<void>;
    getCustomerById(req: Request, res: Response): Promise<void>;
    searchCustomers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CustomerController.d.ts.map