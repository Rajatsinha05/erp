"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const BaseController_1 = require("./BaseController");
const InventoryService_1 = require("../services/InventoryService");
const query_optimizer_1 = __importDefault(require("../utils/query-optimizer"));
class InventoryController extends BaseController_1.BaseController {
    inventoryService;
    constructor() {
        const inventoryService = new InventoryService_1.InventoryService();
        super(inventoryService, 'InventoryItem');
        this.inventoryService = inventoryService;
    }
    async createInventoryItem(req, res) {
        try {
            const itemData = req.body;
            const createdBy = req.user?.id;
            const item = await this.inventoryService.createInventoryItem(itemData, createdBy);
            this.sendSuccess(res, item, 'Inventory item created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create inventory item');
        }
    }
    async getItemByCode(req, res) {
        try {
            const { itemCode } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const item = await this.inventoryService.findOne({
                itemCode: itemCode.toUpperCase(),
                companyId,
                'status.isActive': true
            });
            if (!item) {
                this.sendError(res, new Error('Item not found'), 'Inventory item not found', 404);
                return;
            }
            this.sendSuccess(res, item, 'Inventory item retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get inventory item');
        }
    }
    async getItemsByCompany(req, res) {
        try {
            const startTime = Date.now();
            this.validateRequestWithTracking(req);
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const { page = 1, limit = 10, search, category, lowStock } = req.query;
            let filter = query_optimizer_1.default.createCompanyFilter(companyId.toString(), {
                'status.isActive': true
            });
            if (search && typeof search === 'string') {
                const searchFilter = query_optimizer_1.default.createTextSearchFilter(search, ['itemName', 'itemCode', 'description']);
                filter = { ...filter, ...searchFilter };
            }
            if (category) {
                filter.category = category;
            }
            if (lowStock === 'true') {
                filter.$expr = { $lte: ['$stock.currentStock', '$stock.reorderLevel'] };
            }
            const total = await this.inventoryService.count(filter);
            const items = await this.inventoryService.findManyLean(filter, {
                ...query_optimizer_1.default.createPaginationOptions(Number(page), Number(limit)),
                sort: { createdAt: -1 }
            });
            this.setCacheHeaders(res, 180);
            this.logControllerPerformance('getItemsByCompany', startTime, req, items.length);
            this.sendOptimizedPaginatedResponse(res, items, total, Number(page), Number(limit), 'Inventory items retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get inventory items');
        }
    }
    async updateStock(req, res) {
        try {
            const { itemId } = req.params;
            const { warehouseId, quantity, movementType, reference, notes } = req.body;
            const updatedBy = req.user?.id;
            const result = await this.inventoryService.updateStock(itemId, warehouseId, quantity, movementType, reference, notes, updatedBy);
            res.json({
                success: true,
                message: 'Stock updated successfully',
                data: result
            });
        }
        catch (error) {
            this.sendError(res, error, 'Operation failed');
        }
    }
    async reserveStock(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity, reference, notes } = req.body;
            const reservedBy = req.user?.id;
            const result = await this.inventoryService.reserveStock(itemId, quantity, reference, reservedBy);
            res.json({
                success: true,
                message: 'Stock reserved successfully',
                data: result
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to reserve stock');
        }
    }
    async releaseReservedStock(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity, reference, notes } = req.body;
            const releasedBy = req.user?.id;
            const result = await this.inventoryService.releaseReservedStock(itemId, quantity, reference, releasedBy);
            this.sendSuccess(res, result, 'Reserved stock released successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to release reserved stock');
        }
    }
    async getLowStockItems(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const items = await this.inventoryService.getLowStockItems(companyId.toString());
            this.sendSuccess(res, items, 'Low stock items retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get low stock items');
        }
    }
    async getInventoryStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const stats = await this.inventoryService.getInventoryStats(companyId.toString());
            this.sendSuccess(res, stats, 'Inventory statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get inventory statistics');
        }
    }
    async updateInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const item = await this.inventoryService.update(id, updateData, updatedBy);
            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Inventory item updated successfully',
                data: item
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update inventory item');
        }
    }
    async deleteInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const item = await this.inventoryService.update(id, {
                'status.isActive': false,
                'status.deletedAt': new Date()
            }, deletedBy);
            if (!item) {
                this.sendError(res, new Error('Item not found'), 'Inventory item not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Inventory item deleted successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete inventory item');
        }
    }
    async searchItems(req, res) {
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
            const items = await this.inventoryService.findMany({
                companyId,
                $or: [
                    { itemName: { $regex: searchTerm, $options: 'i' } },
                    { itemCode: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ],
                'status.isActive': true
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, items, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search inventory items');
        }
    }
}
exports.InventoryController = InventoryController;
//# sourceMappingURL=InventoryController.js.map