"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementController = void 0;
const BaseController_1 = require("./BaseController");
const StockMovementService_1 = require("../services/StockMovementService");
class StockMovementController extends BaseController_1.BaseController {
    stockMovementService;
    constructor() {
        const stockMovementService = new StockMovementService_1.StockMovementService();
        super(stockMovementService, 'StockMovement');
        this.stockMovementService = stockMovementService;
    }
    async createStockMovement(req, res) {
        try {
            const movementData = req.body;
            const createdBy = req.user?.id;
            const movement = await this.stockMovementService.createStockMovement(movementData, createdBy);
            this.sendSuccess(res, movement, 'Stock movement created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create stock movement');
        }
    }
    async getMovementsByItem(req, res) {
        try {
            const { itemId } = req.params;
            const { page = 1, limit = 10, movementType, startDate, endDate } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (movementType) {
                options.movementType = movementType;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const movements = await this.stockMovementService.getMovementsByItem(itemId, options);
            this.sendSuccess(res, movements, 'Stock movements retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movements');
        }
    }
    async getMovementsByWarehouse(req, res) {
        try {
            const { warehouseId } = req.params;
            const { page = 1, limit = 10, movementType, startDate, endDate } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (movementType) {
                options.movementType = movementType;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const movements = await this.stockMovementService.getMovementsByWarehouse(warehouseId, options);
            this.sendSuccess(res, movements, 'Stock movements retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movements');
        }
    }
    async getMovementsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, movementType, startDate, endDate, search } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            let query = { companyId };
            if (movementType) {
                query.movementType = movementType;
            }
            if (startDate && endDate) {
                query.movementDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (search) {
                query.$or = [
                    { referenceNumber: { $regex: search, $options: 'i' } },
                    { 'item.itemName': { $regex: search, $options: 'i' } },
                    { 'item.itemCode': { $regex: search, $options: 'i' } }
                ];
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { movementDate: -1 }
            };
            const movements = await this.stockMovementService.findMany(query, options);
            this.sendSuccess(res, movements, 'Stock movements retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movements');
        }
    }
    async getMovementStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            let dateRange;
            if (startDate && endDate) {
                dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const stats = await this.stockMovementService.getMovementStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Stock movement statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movement statistics');
        }
    }
    async getStockMovementById(req, res) {
        try {
            const { id } = req.params;
            const movement = await this.stockMovementService.findById(id);
            if (!movement) {
                this.sendError(res, new Error('Stock movement not found'), 'Stock movement not found', 404);
                return;
            }
            this.sendSuccess(res, movement, 'Stock movement retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movement');
        }
    }
    async updateStockMovement(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const movement = await this.stockMovementService.update(id, updateData, updatedBy);
            if (!movement) {
                this.sendError(res, new Error('Stock movement not found'), 'Stock movement not found', 404);
                return;
            }
            this.sendSuccess(res, movement, 'Stock movement updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update stock movement');
        }
    }
    async getMovementsByReference(req, res) {
        try {
            const { referenceNumber } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const movements = await this.stockMovementService.findMany({
                companyId,
                referenceNumber
            }, { sort: { movementDate: -1 } });
            this.sendSuccess(res, movements, 'Stock movements retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get stock movements');
        }
    }
    async getRecentMovements(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { limit = 20 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const movements = await this.stockMovementService.findMany({
                companyId
            }, {
                limit: parseInt(limit),
                sort: { movementDate: -1 }
            });
            this.sendSuccess(res, movements, 'Recent stock movements retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get recent stock movements');
        }
    }
    async searchMovements(req, res) {
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
            const movements = await this.stockMovementService.findMany({
                companyId,
                $or: [
                    { referenceNumber: { $regex: searchTerm, $options: 'i' } },
                    { 'item.itemName': { $regex: searchTerm, $options: 'i' } },
                    { 'item.itemCode': { $regex: searchTerm, $options: 'i' } },
                    { notes: { $regex: searchTerm, $options: 'i' } }
                ]
            }, {
                limit: parseInt(limit),
                sort: { movementDate: -1 }
            });
            this.sendSuccess(res, movements, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search stock movements');
        }
    }
    async getInventoryLevels(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { warehouseId, category, status, page = 1, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const inventoryLevels = await this.stockMovementService.findMany({
                companyId
            }, {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { updatedAt: -1 }
            });
            this.sendSuccess(res, inventoryLevels, 'Inventory levels retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get inventory levels');
        }
    }
    async generateMovementNumber(req, res) {
        try {
            const { companyId, movementType } = req.body;
            if (!companyId || !movementType) {
                this.sendError(res, new Error('Company ID and movement type are required'), 'Missing required fields', 400);
                return;
            }
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const count = await this.stockMovementService.count({
                companyId,
                createdAt: {
                    $gte: new Date(year, today.getMonth(), 1),
                    $lt: new Date(year, today.getMonth() + 1, 1)
                }
            });
            const movementNumber = `${movementType.toUpperCase()}${year}${month}${(count + 1).toString().padStart(4, '0')}`;
            this.sendSuccess(res, { movementNumber }, 'Movement number generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate movement number');
        }
    }
}
exports.StockMovementController = StockMovementController;
//# sourceMappingURL=StockMovementController.js.map