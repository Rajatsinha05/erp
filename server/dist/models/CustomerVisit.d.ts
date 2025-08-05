import { Schema, Document } from 'mongoose';
export interface ICustomerVisit extends Document {
    partyName: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    visitDate: Date;
    purpose: string;
    purposeDescription: string;
    travelType: string;
    travelDetails: {
        origin: string;
        destination: string;
        travelMode: string;
        departureDate?: Date;
        returnDate?: Date;
        travelClass?: string;
    };
    foodExpenses: Array<{
        date: Date;
        mealType: string;
        restaurant: string;
        location: string;
        numberOfPeople: number;
        costPerPerson: number;
        totalCost: number;
        description?: string;
        billNumber?: string;
    }>;
    giftsGiven: Array<{
        itemName: string;
        itemType: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        description?: string;
        recipientName?: string;
    }>;
    transportationExpenses: Array<{
        date: Date;
        type: string;
        from: string;
        to: string;
        cost: number;
        description?: string;
        billNumber?: string;
    }>;
    otherExpenses: Array<{
        date: Date;
        category: string;
        description: string;
        cost: number;
        billNumber?: string;
    }>;
    visitOutcome: {
        status: string;
        notes: string;
        nextActionRequired?: string;
        nextFollowUpDate?: Date;
        businessGenerated?: number;
        potentialBusiness?: number;
    };
    totalExpenses: {
        accommodation: number;
        food: number;
        transportation: number;
        gifts: number;
        other: number;
        total: number;
    };
    approvalStatus: string;
    companyId: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
}
declare const _default: import("mongoose").Model<ICustomerVisit, {}, {}, {}, Document<unknown, {}, ICustomerVisit, {}> & ICustomerVisit & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=CustomerVisit.d.ts.map