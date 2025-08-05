import { BaseService } from './BaseService';
import { IDispatch } from '../types/models';
export declare class DispatchService extends BaseService<IDispatch> {
    constructor();
    createDispatch(dispatchData: Partial<IDispatch>, createdBy?: string): Promise<IDispatch>;
    updateDispatchStatus(dispatchId: string, status: string, updatedBy?: string): Promise<IDispatch | null>;
    getDispatchesByCompany(companyId: string, options?: any): Promise<IDispatch[]>;
    getDispatchStats(companyId: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private generateDispatchNumber;
    private validateDispatchData;
}
//# sourceMappingURL=DispatchService.d.ts.map