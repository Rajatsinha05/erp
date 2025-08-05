import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { IVisitor } from '@/types/models';
export declare class VisitorControllerSimple extends BaseController<IVisitor> {
    private visitorService;
    constructor();
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentlyInside(req: Request, res: Response, next: NextFunction): Promise<void>;
    getScheduledToday(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    private buildVisitorFilter;
}
//# sourceMappingURL=VisitorControllerSimple.d.ts.map