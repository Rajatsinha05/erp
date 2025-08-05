import { Schema } from 'mongoose';
export interface IInventoryBatch {
    _id: string;
    companyId: Schema.Types.ObjectId;
    itemId: Schema.Types.ObjectId;
    batchNumber: string;
    lotNumber?: string;
    manufacturingDate: Date;
    expiryDate?: Date;
    receivedDate: Date;
    supplierId?: Schema.Types.ObjectId;
    supplierBatchNumber?: string;
    initialQuantity: number;
    currentQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    unit: string;
    locations: Array<{
        warehouseId: Schema.Types.ObjectId;
        warehouseName: string;
        zone?: string;
        rack?: string;
        bin?: string;
        quantity: number;
        lastUpdated: Date;
    }>;
    qualityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Reject';
    qualityScore: number;
    qualityNotes?: string;
    qualityCheckDate?: Date;
    qualityCheckedBy?: string;
    specifications: {
        gsm?: number;
        width?: number;
        length?: number;
        color?: string;
        colorCode?: string;
        design?: string;
        pattern?: string;
        fabricComposition?: string;
        shrinkage?: number;
        colorFastness?: number;
        tensileStrength?: number;
    };
    processStage?: 'grey' | 'printed' | 'washed' | 'fixed' | 'finished';
    processHistory: Array<{
        stage: string;
        startDate: Date;
        endDate?: Date;
        operator?: string;
        machineId?: string;
        notes?: string;
        qualityCheck?: {
            grade: string;
            score: number;
            notes: string;
            checkedBy: string;
            checkDate: Date;
        };
    }>;
    costPerUnit: number;
    totalCost: number;
    additionalCosts: Array<{
        type: string;
        description: string;
        amount: number;
        date: Date;
    }>;
    status: 'active' | 'consumed' | 'expired' | 'damaged' | 'returned';
    isActive: boolean;
    createdBy: Schema.Types.ObjectId;
    lastModifiedBy?: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InventoryBatch: import("mongoose").Model<IInventoryBatch, {}, {}, {}, import("mongoose").Document<unknown, {}, IInventoryBatch, {}> & IInventoryBatch & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=InventoryBatch.d.ts.map