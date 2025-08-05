import { Types } from 'mongoose';
interface ISimpleVehicle {
    _id: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    purpose: 'delivery' | 'pickup' | 'maintenance' | 'other';
    reason: string;
    timeIn: Date;
    timeOut?: Date;
    status: 'in' | 'out' | 'pending';
    gatePassNumber?: string;
    images?: string[];
    companyId: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VehicleService {
    constructor();
    findById(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any, updatedBy?: string): Promise<any>;
    delete(id: string): Promise<boolean>;
    findMany(query: any, options?: any): Promise<any[]>;
    findOne(query: any): Promise<any>;
    count(query: any): Promise<number>;
    createVehicle(vehicleData: Partial<ISimpleVehicle>, createdBy?: string): Promise<ISimpleVehicle>;
    getVehicleByNumber(vehicleNumber: string, companyId: string): Promise<ISimpleVehicle | null>;
    getVehiclesByCompany(companyId: string, options?: any): Promise<ISimpleVehicle[]>;
    getVehiclesByPurpose(companyId: string, purpose: string): Promise<ISimpleVehicle[]>;
    checkoutVehicle(vehicleId: string, updatedBy?: string): Promise<ISimpleVehicle | null>;
    updateVehicleStatus(vehicleId: string, status: string, updatedBy?: string): Promise<ISimpleVehicle | null>;
    addMaintenanceRecord(vehicleId: string, maintenanceData: any, addedBy?: string): Promise<ISimpleVehicle | null>;
    getVehiclesDueForMaintenance(companyId: string): Promise<ISimpleVehicle[]>;
    getVehicleStats(companyId: string): Promise<any>;
    getMaintenanceHistory(vehicleId: string): Promise<any[]>;
    private validateVehicleData;
    getVehiclesByType(companyId: string, vehicleType: string): Promise<any[]>;
}
export {};
//# sourceMappingURL=VehicleService.d.ts.map