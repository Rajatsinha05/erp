import { BaseService } from './BaseService';
import { IHospitality } from '../types/models';
export declare class HospitalityService extends BaseService<IHospitality> {
    constructor();
    createHospitalityFacility(hospitalityData: Partial<IHospitality>, createdBy?: string): Promise<IHospitality>;
    getHospitalityByCompany(companyId: string, options?: any): Promise<IHospitality[]>;
    getHospitalityStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    getMonthlyReport(companyId: string, year: number, month: number): Promise<any>;
    private validateHospitalityData;
}
//# sourceMappingURL=HospitalityService.d.ts.map