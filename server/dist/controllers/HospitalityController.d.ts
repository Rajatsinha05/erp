import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IHospitality } from '../types/models';
export declare class HospitalityController extends BaseController<IHospitality> {
    private hospitalityService;
    constructor();
    createHospitalityEntry(req: Request, res: Response): Promise<void>;
    getHospitalityByCompany(req: Request, res: Response): Promise<void>;
    getHospitalityStats(req: Request, res: Response): Promise<void>;
    getMonthlyReport(req: Request, res: Response): Promise<void>;
    getHospitalityById(req: Request, res: Response): Promise<void>;
    updateHospitality(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=HospitalityController.d.ts.map