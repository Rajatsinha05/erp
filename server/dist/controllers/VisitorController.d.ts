import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { IVisitor } from '@/types/models';
export declare class VisitorController extends BaseController<IVisitor> {
    private visitorService;
    constructor();
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    approve(req: Request, res: Response, next: NextFunction): Promise<void>;
    reject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentlyInside(req: Request, res: Response, next: NextFunction): Promise<void>;
    getScheduledToday(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOverstaying(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    private buildVisitorFilter;
    protected validateVisitorAccess(req: Request, visitor: IVisitor): void;
    uploadEntryPhoto(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadExitPhoto(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=VisitorController.d.ts.map