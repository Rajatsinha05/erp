import { Types } from 'mongoose';
interface ICustomerVisit {
    _id: string;
    partyName: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    visitDate: Date;
    purpose: 'business_meeting' | 'product_demo' | 'negotiation' | 'follow_up' | 'site_visit' | 'other';
    purposeDescription: string;
    travelType: 'local' | 'outstation' | 'international';
    travelDetails: any;
    accommodation?: any;
    foodExpenses: any[];
    giftsGiven: any[];
    transportationExpenses: any[];
    otherExpenses: any[];
    visitOutcome: any;
    totalExpenses: {
        accommodation: number;
        food: number;
        transportation: number;
        gifts: number;
        other: number;
        total: number;
    };
    attachments?: string[];
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'reimbursed';
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    reimbursementAmount?: number;
    reimbursedAt?: Date;
    companyId: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastModifiedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CustomerVisitService {
    constructor();
    findById(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any, updatedBy?: string): Promise<any>;
    delete(id: string): Promise<boolean>;
    findMany(query: any, options?: any): Promise<any[]>;
    createCustomerVisit(visitData: Partial<ICustomerVisit>, createdBy?: string): Promise<ICustomerVisit>;
    getVisitsByCompany(companyId: string, options?: any): Promise<ICustomerVisit[]>;
    getVisitsByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<ICustomerVisit[]>;
    getPendingApprovals(companyId: string): Promise<ICustomerVisit[]>;
    approveVisit(visitId: string, approvedBy: string, reimbursementAmount?: number): Promise<any>;
    rejectVisit(visitId: string, rejectedBy: string, reason?: string): Promise<any>;
    markAsReimbursed(visitId: string, reimbursedBy: string): Promise<ICustomerVisit | null>;
    addFoodExpense(visitId: string, expenseData: any, updatedBy: string): Promise<ICustomerVisit | null>;
    addGift(visitId: string, giftData: any, updatedBy: string): Promise<ICustomerVisit | null>;
    getExpenseStats(companyId: string, startDate?: Date, endDate?: Date): Promise<any>;
    findManyWithPagination(query: any, options: any): Promise<any>;
}
export {};
//# sourceMappingURL=CustomerVisitService.d.ts.map