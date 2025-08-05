import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { IUser } from '@/types/models';
export declare class UserController extends BaseController<IUser> {
    private userService;
    constructor();
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleAccountLock(req: Request, res: Response, next: NextFunction): Promise<void>;
    addCompanyAccess(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeCompanyAccess(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUsersByCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    private buildUserFilter;
    getUserStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map