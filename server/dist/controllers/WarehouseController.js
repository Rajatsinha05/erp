"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseController = void 0;
const BaseController_1 = require("./BaseController");
const WarehouseService_1 = require("../services/WarehouseService");
class WarehouseController extends BaseController_1.BaseController {
    warehouseService;
    constructor() {
        const warehouseService = new WarehouseService_1.WarehouseService();
        super(warehouseService, 'Warehouse');
        this.warehouseService = warehouseService;
    }
    async createWarehouse(req, res) {
        try {
            const warehouseData = req.body;
            const createdBy = req.user?.id;
            const warehouse = await this.warehouseService.createWarehouse(warehouseData, createdBy);
            this.sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create warehouse');
        }
    }
    async getWarehouseByCode(req, res) {
        try {
            const { warehouseCode } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const warehouse = await this.warehouseService.getWarehouseByCode(warehouseCode, companyId.toString());
            if (!warehouse) {
                this.sendError(res, new Error('Warehouse not found'), 'Warehouse not found', 404);
                return;
            }
            this.sendSuccess(res, warehouse, 'Warehouse retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouse');
        }
    }
    async getWarehousesByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, search, warehouseType } = req.query;
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
            if (warehouseType) {
                options.warehouseType = warehouseType;
            }
            const warehouses = await this.warehouseService.getWarehousesByCompany(companyId.toString(), options);
            this.sendSuccess(res, warehouses, 'Warehouses retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouses');
        }
    }
    async getWarehousesByType(req, res) {
        try {
            const { warehouseType } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const warehouses = await this.warehouseService.getWarehousesByType(companyId.toString(), warehouseType);
            this.sendSuccess(res, warehouses, 'Warehouses retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouses');
        }
    }
    async updateWarehouseCapacity(req, res) {
        try {
            const { warehouseId } = req.params;
            const capacity = req.body;
            const updatedBy = req.user?.id;
            const warehouse = await this.warehouseService.updateWarehouseCapacity(warehouseId, capacity, updatedBy);
            this.sendSuccess(res, warehouse, 'Warehouse capacity updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update warehouse capacity');
        }
    }
    async addStorageZone(req, res) {
        try {
            const { warehouseId } = req.params;
            const zoneData = req.body;
            const addedBy = req.user?.id;
            const warehouse = await this.warehouseService.addStorageZone(warehouseId, zoneData, addedBy);
            this.sendSuccess(res, warehouse, 'Storage zone added successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to add storage zone');
        }
    }
    async getWarehouseUtilization(req, res) {
        try {
            const { warehouseId } = req.params;
            const utilization = await this.warehouseService.getWarehouseUtilization(warehouseId);
            this.sendSuccess(res, utilization, 'Warehouse utilization retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouse utilization');
        }
    }
    async getWarehouseStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const stats = await this.warehouseService.getWarehouseStats(companyId.toString());
            this.sendSuccess(res, stats, 'Warehouse statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouse statistics');
        }
    }
    async updateWarehouse(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const warehouse = await this.warehouseService.update(id, updateData, updatedBy);
            if (!warehouse) {
                this.sendError(res, new Error('Warehouse not found'), 'Warehouse not found', 404);
                return;
            }
            this.sendSuccess(res, warehouse, 'Warehouse updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update warehouse');
        }
    }
    async getWarehouseById(req, res) {
        try {
            const { id } = req.params;
            const warehouse = await this.warehouseService.findById(id);
            if (!warehouse) {
                this.sendError(res, new Error('Warehouse not found'), 'Warehouse not found', 404);
                return;
            }
            this.sendSuccess(res, warehouse, 'Warehouse retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get warehouse');
        }
    }
    async deleteWarehouse(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const warehouse = await this.warehouseService.update(id, {
                isActive: false,
                deletedAt: new Date()
            }, deletedBy);
            if (!warehouse) {
                this.sendError(res, new Error('Warehouse not found'), 'Warehouse not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Warehouse deleted successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete warehouse');
        }
    }
    async searchWarehouses(req, res) {
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
            const warehouses = await this.warehouseService.findMany({
                companyId,
                $or: [
                    { warehouseName: { $regex: searchTerm, $options: 'i' } },
                    { warehouseCode: { $regex: searchTerm, $options: 'i' } },
                    { 'address.city': { $regex: searchTerm, $options: 'i' } }
                ],
                isActive: true
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, warehouses, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search warehouses');
        }
    }
}
exports.WarehouseController = WarehouseController;
//# sourceMappingURL=WarehouseController.js.map