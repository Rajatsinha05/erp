import { BaseService } from './BaseService';
import { IVisitor } from '@/types/models';
export declare class VisitorServiceSimple extends BaseService<IVisitor> {
    constructor();
    createVisitor(visitorData: Partial<IVisitor>, createdBy?: string): Promise<IVisitor>;
    checkInVisitor(visitorId: string, entryData: {
        entryGate?: string;
        securityGuardId?: string;
        securityGuardName?: string;
        entryMethod?: 'manual' | 'qr_code' | 'rfid' | 'biometric' | 'face_recognition';
        temperatureCheck?: number;
        belongingsList?: string[];
        entryNotes?: string;
    }, checkedInBy?: string): Promise<IVisitor | null>;
    checkOutVisitor(visitorId: string, exitData: {
        exitGate?: string;
        securityGuardId?: string;
        securityGuardName?: string;
        exitMethod?: 'manual' | 'qr_code' | 'rfid' | 'biometric' | 'face_recognition';
        exitNotes?: string;
        feedback?: {
            overallRating?: number;
            comments?: string;
        };
    }, checkedOutBy?: string): Promise<IVisitor | null>;
    getCurrentlyInside(companyId: string): Promise<IVisitor[]>;
    getScheduledToday(companyId: string): Promise<IVisitor[]>;
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
//# sourceMappingURL=VisitorServiceSimple.d.ts.map