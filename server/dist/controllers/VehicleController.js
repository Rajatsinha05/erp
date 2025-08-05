"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const VehicleService_1 = require("../services/VehicleService");
class VehicleController {
    vehicleService;
    constructor() {
        this.vehicleService = new VehicleService_1.VehicleService();
    }
    sendSuccess(res, data, message, statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }
    sendError(res, error, message, statusCode = 500) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error.message || error
        });
    }
    async createVehicle(req, res) {
        try {
            const vehicleData = req.body;
            const createdBy = req.user?.id;
            const vehicle = await this.vehicleService.createVehicle(vehicleData, createdBy);
            this.sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create vehicle');
        }
    }
    async getVehicleByNumber(req, res) {
        try {
            const { vehicleNumber } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const vehicle = await this.vehicleService.getVehicleByNumber(vehicleNumber, companyId.toString());
            if (!vehicle) {
                this.sendError(res, new Error('Vehicle not found'), 'Vehicle not found', 404);
                return;
            }
            this.sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicle');
        }
    }
    async getVehiclesByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, search, vehicleType, status } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (search) {
                options.search = search;
            }
            if (vehicleType) {
                options.vehicleType = vehicleType;
            }
            if (status) {
                options.status = status;
            }
            const vehicles = await this.vehicleService.getVehiclesByCompany(companyId.toString(), options);
            res.status(200).json(vehicles);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicles');
        }
    }
    async getVehiclesByType(req, res) {
        try {
            const { vehicleType } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const vehicles = await this.vehicleService.getVehiclesByType(companyId.toString(), vehicleType);
            this.sendSuccess(res, vehicles, 'Vehicles retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicles');
        }
    }
    async updateVehicleStatus(req, res) {
        try {
            const { vehicleId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const vehicle = await this.vehicleService.updateVehicleStatus(vehicleId, status, updatedBy);
            this.sendSuccess(res, vehicle, 'Vehicle status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update vehicle status');
        }
    }
    async addMaintenanceRecord(req, res) {
        try {
            const { vehicleId } = req.params;
            const maintenanceData = req.body;
            const addedBy = req.user?.id;
            const vehicle = await this.vehicleService.addMaintenanceRecord(vehicleId, maintenanceData, addedBy);
            this.sendSuccess(res, vehicle, 'Maintenance record added successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to add maintenance record');
        }
    }
    async getVehiclesDueForMaintenance(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const vehicles = await this.vehicleService.getVehiclesDueForMaintenance(companyId.toString());
            this.sendSuccess(res, vehicles, 'Vehicles due for maintenance retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicles due for maintenance');
        }
    }
    async getVehicleStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const stats = await this.vehicleService.getVehicleStats(companyId.toString());
            this.sendSuccess(res, stats, 'Vehicle statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicle statistics');
        }
    }
    async getMaintenanceHistory(req, res) {
        try {
            const { vehicleId } = req.params;
            const history = await this.vehicleService.getMaintenanceHistory(vehicleId);
            this.sendSuccess(res, history, 'Maintenance history retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get maintenance history');
        }
    }
    async updateVehicle(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const vehicle = await this.vehicleService.update(id, updateData, updatedBy);
            if (!vehicle) {
                this.sendError(res, new Error('Vehicle not found'), 'Vehicle not found', 404);
                return;
            }
            this.sendSuccess(res, vehicle, 'Vehicle updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update vehicle');
        }
    }
    async getVehicleById(req, res) {
        try {
            const { id } = req.params;
            const vehicle = await this.vehicleService.findById(id);
            if (!vehicle) {
                this.sendError(res, new Error('Vehicle not found'), 'Vehicle not found', 404);
                return;
            }
            this.sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get vehicle');
        }
    }
    async checkoutVehicle(req, res) {
        try {
            const { id } = req.params;
            const updatedBy = req.user?.id;
            const vehicle = await this.vehicleService.checkoutVehicle(id, updatedBy);
            if (!vehicle) {
                this.sendError(res, new Error('Vehicle not found'), 'Vehicle not found', 404);
                return;
            }
            this.sendSuccess(res, vehicle, 'Vehicle checked out successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to checkout vehicle');
        }
    }
    async deleteVehicle(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.vehicleService.delete(id);
            if (!deleted) {
                this.sendError(res, new Error('Vehicle not found'), 'Vehicle not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Vehicle deleted successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete vehicle');
        }
    }
    async searchVehicles(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { q: searchTerm, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!searchTerm) {
                this.sendError(res, new Error('Search term is required'), 'Search term is required', 400);
                return;
            }
            const vehicles = await this.vehicleService.findMany({
                companyId,
                $or: [
                    { vehicleNumber: { $regex: searchTerm, $options: 'i' } },
                    { 'vehicleInfo.make': { $regex: searchTerm, $options: 'i' } },
                    { 'vehicleInfo.model': { $regex: searchTerm, $options: 'i' } }
                ],
                isActive: true
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, vehicles, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search vehicles');
        }
    }
}
exports.VehicleController = VehicleController;
//# sourceMappingURL=VehicleController.js.map