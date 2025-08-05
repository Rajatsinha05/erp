"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpareController = void 0;
const BaseController_1 = require("./BaseController");
const SpareService_1 = require("../services/SpareService");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
class SpareController extends BaseController_1.BaseController {
    spareService;
    constructor() {
        const spareService = new SpareService_1.SpareService();
        super(spareService, 'Spare');
        this.spareService = spareService;
    }
    async createSpare(req, res) {
        try {
            this.handleValidationErrors(req);
            const { userId, companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const spareData = {
                ...req.body,
                companyId
            };
            const isUnique = await this.spareService.isSpareCodeUnique(companyId, spareData.spareCode);
            if (!isUnique) {
                throw new errors_1.AppError('Spare code already exists in this company', 400);
            }
            const spare = await this.spareService.create(spareData, userId);
            logger_1.logger.info(`Spare created successfully`, {
                spareId: spare._id,
                spareCode: spare.spareCode,
                userId,
                companyId
            });
            this.sendSuccess(res, spare, 'Spare created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async getSparesByCompany(req, res) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const filters = {
                companyId,
                category: req.query.category,
                manufacturer: req.query.manufacturer,
                isActive: req.query.isActive === 'true',
                isLowStock: req.query.isLowStock === 'true',
                isCritical: req.query.isCritical === 'true',
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc'
            };
            const result = await this.spareService.getSparesByCompany(filters);
            logger_1.logger.info(`Retrieved spares for company ${companyId}`, {
                total: result.total,
                page: result.page,
                limit: result.limit
            });
            this.sendSuccess(res, result, 'Spares retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async getSpareStats(req, res) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const stats = await this.spareService.getSpareStats(companyId);
            logger_1.logger.info(`Retrieved spare stats for company ${companyId}`, stats);
            this.sendSuccess(res, stats, 'Spare statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async getLowStockSpares(req, res) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const spares = await this.spareService.getLowStockSpares(companyId);
            logger_1.logger.info(`Retrieved ${spares.length} low stock spares for company ${companyId}`);
            this.sendSuccess(res, spares, 'Low stock spares retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async updateStock(req, res) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const { spareId } = req.params;
            const { quantity, type, reason, warehouseId } = req.body;
            if (!userId) {
                throw new errors_1.AppError('User ID is required', 400);
            }
            const stockUpdate = {
                quantity: parseFloat(quantity),
                type,
                reason,
                userId,
                warehouseId
            };
            const updatedSpare = await this.spareService.updateStock(spareId, stockUpdate);
            if (!updatedSpare) {
                throw new errors_1.AppError('Spare not found', 404);
            }
            logger_1.logger.info(`Stock updated for spare ${spareId}`, {
                type,
                quantity,
                newStock: updatedSpare.stock.currentStock,
                userId
            });
            this.sendSuccess(res, updatedSpare, 'Stock updated successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async getSpareById(req, res) {
        try {
            const { id } = req.params;
            const { companyId } = this.getUserInfo(req);
            const spare = await this.spareService.findById(id, [
                'suppliers.supplierId',
                'locations.warehouseId',
                'tracking.lastModifiedBy'
            ]);
            if (!spare) {
                throw new errors_1.AppError('Spare not found', 404);
            }
            if (companyId && spare.companyId.toString() !== companyId) {
                throw new errors_1.AppError('Access denied', 403);
            }
            logger_1.logger.info(`Retrieved spare ${id}`, { spareCode: spare.spareCode });
            this.sendSuccess(res, spare, 'Spare retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async updateSpare(req, res) {
        try {
            this.handleValidationErrors(req);
            const { userId, companyId } = this.getUserInfo(req);
            const { id } = req.params;
            if (req.body.spareCode && companyId) {
                const isUnique = await this.spareService.isSpareCodeUnique(companyId, req.body.spareCode, id);
                if (!isUnique) {
                    throw new errors_1.AppError('Spare code already exists in this company', 400);
                }
            }
            const updatedSpare = await this.spareService.update(id, req.body, userId);
            if (!updatedSpare) {
                throw new errors_1.AppError('Spare not found', 404);
            }
            logger_1.logger.info(`Spare updated successfully`, {
                spareId: id,
                spareCode: updatedSpare.spareCode,
                userId
            });
            this.sendSuccess(res, updatedSpare, 'Spare updated successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async deleteSpare(req, res) {
        try {
            const { userId } = this.getUserInfo(req);
            const { id } = req.params;
            const deleted = await this.spareService.delete(id, userId);
            if (!deleted) {
                throw new errors_1.AppError('Spare not found', 404);
            }
            logger_1.logger.info(`Spare deleted successfully`, { spareId: id, userId });
            this.sendSuccess(res, null, 'Spare deleted successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async getSparesByCategory(req, res) {
        try {
            const { companyId } = this.getUserInfo(req);
            const { category } = req.params;
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const spares = await this.spareService.getSparesByCategory(companyId, category);
            logger_1.logger.info(`Retrieved ${spares.length} spares for category ${category} in company ${companyId}`);
            this.sendSuccess(res, spares, 'Spares retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
    async checkSpareCodeUnique(req, res) {
        try {
            const { companyId } = this.getUserInfo(req);
            const { spareCode } = req.params;
            const { excludeId } = req.query;
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const isUnique = await this.spareService.isSpareCodeUnique(companyId, spareCode, excludeId);
            this.sendSuccess(res, { isUnique }, 'Spare code uniqueness checked');
        }
        catch (error) {
            this.sendError(res, error);
        }
    }
}
exports.SpareController = SpareController;
//# sourceMappingURL=SpareController.js.map