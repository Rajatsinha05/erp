import { BaseService } from './BaseService';
import { IVisitor, IVisitorEntry, IVisitorExit } from '@/types/models';
export declare class VisitorService extends BaseService<IVisitor> {
    constructor();
    createVisitor(visitorData: Partial<IVisitor>, createdBy?: string): Promise<IVisitor>;
    checkInVisitor(visitorId: string, entryData: Partial<IVisitorEntry>, checkedInBy?: string): Promise<IVisitor | null>;
    checkOutVisitor(visitorId: string, exitData: Partial<IVisitorExit>, checkedOutBy?: string): Promise<IVisitor | null>;
    approveVisitor(visitorId: string, approvalData: {
        approvedBy: string;
        approvalNotes?: string;
        conditions?: string[];
    }): Promise<IVisitor | null>;
    rejectVisitor(visitorId: string, rejectionData: {
        rejectedBy: string;
        rejectionReason: string;
        rejectionNotes?: string;
    }): Promise<IVisitor | null>;
    getCurrentlyInside(companyId: string): Promise<IVisitor[]>;
    getScheduledToday(companyId: string): Promise<IVisitor[]>;
    getOverstayingVisitors(companyId: string): Promise<IVisitor[]>;
    getVisitorStats(companyId: string, startDate?: Date, endDate?: Date): Promise<{
        totalVisitors: number;
        currentlyInside: number;
        scheduledToday: number;
        overstaying: number;
        approved: number;
        rejected: number;
        pending: number;
        approvalRate: string | number;
    }>;
    searchVisitors(companyId: string, searchTerm: string, page?: number, limit?: number): Promise<{
        documents: IVisitor[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextPage: number;
            prevPage: number;
        };
    }>;
    private generateVisitorNumber;
    private validateVisitorData;
}
//# sourceMappingURL=VisitorService.d.ts.map