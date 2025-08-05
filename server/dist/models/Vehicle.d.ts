import { Schema, Document } from 'mongoose';
export interface ISimpleVehicle extends Document {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    purpose: 'delivery' | 'pickup' | 'maintenance' | 'other';
    reason: string;
    timeIn: Date;
    timeOut?: Date;
    status: 'in' | 'out' | 'pending';
    currentStatus: 'in' | 'out' | 'pending';
    gatePassNumber?: string;
    images?: string[];
    companyId: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
}
export interface IVehicle extends Document {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    purpose: 'delivery' | 'pickup' | 'maintenance' | 'other';
    reason: string;
    timeIn: Date;
    timeOut?: Date;
    status: 'in' | 'out' | 'pending';
    currentStatus: 'in' | 'out' | 'pending';
    gatePassNumber?: string;
    images?: string[];
    companyId: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
}
declare const _default: import("mongoose").Model<ISimpleVehicle, {}, {}, {}, Document<unknown, {}, ISimpleVehicle, {}> & ISimpleVehicle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Vehicle.d.ts.map