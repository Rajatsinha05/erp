import { Request, Response } from 'express';
export declare class VehicleController {
    private vehicleService;
    constructor();
    private sendSuccess;
    private sendError;
    createVehicle(req: Request, res: Response): Promise<void>;
    getVehicleByNumber(req: Request, res: Response): Promise<void>;
    getVehiclesByCompany(req: Request, res: Response): Promise<void>;
    getVehiclesByType(req: Request, res: Response): Promise<void>;
    updateVehicleStatus(req: Request, res: Response): Promise<void>;
    addMaintenanceRecord(req: Request, res: Response): Promise<void>;
    getVehiclesDueForMaintenance(req: Request, res: Response): Promise<void>;
    getVehicleStats(req: Request, res: Response): Promise<void>;
    getMaintenanceHistory(req: Request, res: Response): Promise<void>;
    updateVehicle(req: Request, res: Response): Promise<void>;
    getVehicleById(req: Request, res: Response): Promise<void>;
    checkoutVehicle(req: Request, res: Response): Promise<void>;
    deleteVehicle(req: Request, res: Response): Promise<void>;
    searchVehicles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=VehicleController.d.ts.map