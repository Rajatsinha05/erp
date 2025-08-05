"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpareService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const Spare_1 = __importDefault(require("@/models/Spare"));
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
class SpareService extends BaseService_1.BaseService {
    constructor() {
        super(Spare_1.default);
    }
    async getSparesByCompany(filters) {
        try {
            const { companyId, category, manufacturer, isActive, isLowStock, isCritical, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
            const query = {};
            if (companyId) {
                query.companyId = new mongoose_1.Types.ObjectId(companyId);
            }
            if (category) {
                query.category = category;
            }
            if (manufacturer) {
                query.manufacturer = new RegExp(manufacturer, 'i');
            }
            if (isActive !== undefined) {
                query['status.isActive'] = isActive;
            }
            if (isCritical !== undefined) {
                query['status.isCritical'] = isCritical;
            }
            if (search) {
                query.$or = [
                    { spareCode: new RegExp(search, 'i') },
                    { spareName: new RegExp(search, 'i') },
                    { partNumber: new RegExp(search, 'i') },
                    { manufacturer: new RegExp(search, 'i') },
                    { brand: new RegExp(search, 'i') }
                ];
            }
            if (isLowStock) {
                query.$expr = {
                    $lte: ['$stock.currentStock', '$stock.reorderLevel']
                };
            }
            const skip = (page - 1) * limit;
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const [spares, total] = await Promise.all([
                this.model
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('suppliers.supplierId', 'supplierName supplierCode')
                    .populate('locations.warehouseId', 'warehouseName')
                    .lean(),
                this.model.countDocuments(query)
            ]);
            const totalPages = Math.ceil(total / limit);
            logger_1.logger.info(`Retrieved ${spares.length} spares for company ${companyId}`, {
                total,
                page,
                limit,
                totalPages
            });
            return {
                spares: spares,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting spares by company', { error, filters });
            throw new errors_1.AppError('Failed to retrieve spares', 500, error);
        }
    }
    async getSpareStats(companyId) {
        try {
            const pipeline = [
                { $match: { companyId: new mongoose_1.Types.ObjectId(companyId) } },
                {
                    $facet: {
                        totalStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalSpares: { $sum: 1 },
                                    activeSpares: {
                                        $sum: { $cond: [{ $eq: ['$status.isActive', true] }, 1, 0] }
                                    },
                                    lowStockSpares: {
                                        $sum: { $cond: [{ $lte: ['$stock.currentStock', '$stock.reorderLevel'] }, 1, 0] }
                                    },
                                    criticalSpares: {
                                        $sum: { $cond: [{ $eq: ['$status.isCritical', true] }, 1, 0] }
                                    },
                                    outOfStockSpares: {
                                        $sum: { $cond: [{ $eq: ['$stock.currentStock', 0] }, 1, 0] }
                                    },
                                    totalValue: { $sum: '$stock.totalValue' }
                                }
                            }
                        ],
                        categoriesBreakdown: [
                            {
                                $group: {
                                    _id: '$category',
                                    count: { $sum: 1 },
                                    value: { $sum: '$stock.totalValue' }
                                }
                            },
                            { $sort: { count: -1 } }
                        ],
                        criticalityBreakdown: [
                            {
                                $group: {
                                    _id: '$maintenance.criticality',
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { count: -1 } }
                        ]
                    }
                }
            ];
            const [result] = await this.model.aggregate(pipeline);
            const stats = {
                totalSpares: result.totalStats[0]?.totalSpares || 0,
                activeSpares: result.totalStats[0]?.activeSpares || 0,
                lowStockSpares: result.totalStats[0]?.lowStockSpares || 0,
                criticalSpares: result.totalStats[0]?.criticalSpares || 0,
                outOfStockSpares: result.totalStats[0]?.outOfStockSpares || 0,
                totalValue: result.totalStats[0]?.totalValue || 0,
                categoriesBreakdown: result.categoriesBreakdown.map((item) => ({
                    category: item._id,
                    count: item.count,
                    value: item.value
                })),
                criticalityBreakdown: result.criticalityBreakdown.map((item) => ({
                    criticality: item._id,
                    count: item.count
                }))
            };
            logger_1.logger.info(`Retrieved spare stats for company ${companyId}`, stats);
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error getting spare stats', { error, companyId });
            throw new errors_1.AppError('Failed to retrieve spare statistics', 500, error);
        }
    }
    async getLowStockSpares(companyId) {
        try {
            const spares = await this.model
                .find({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                'status.isActive': true,
                $expr: {
                    $lte: ['$stock.currentStock', '$stock.reorderLevel']
                }
            })
                .sort({ 'stock.currentStock': 1 })
                .populate('suppliers.supplierId', 'supplierName supplierCode')
                .lean();
            logger_1.logger.info(`Retrieved ${spares.length} low stock spares for company ${companyId}`);
            return spares;
        }
        catch (error) {
            logger_1.logger.error('Error getting low stock spares', { error, companyId });
            throw new errors_1.AppError('Failed to retrieve low stock spares', 500, error);
        }
    }
    async updateStock(spareId, stockUpdate) {
        try {
            const { quantity, type, reason, userId, warehouseId } = stockUpdate;
            const spare = await this.model.findById(spareId);
            if (!spare) {
                throw new errors_1.AppError('Spare not found', 404);
            }
            switch (type) {
                case 'inward':
                    spare.stock.currentStock += quantity;
                    spare.tracking.totalInward += quantity;
                    break;
                case 'outward':
                    if (spare.stock.currentStock < quantity) {
                        throw new errors_1.AppError('Insufficient stock', 400);
                    }
                    spare.stock.currentStock -= quantity;
                    spare.tracking.totalOutward += quantity;
                    break;
                case 'adjustment':
                    spare.stock.currentStock = quantity;
                    spare.tracking.totalAdjustments += 1;
                    break;
            }
            spare.tracking.lastStockUpdate = new Date();
            spare.tracking.lastMovementDate = new Date();
            spare.tracking.lastModifiedBy = new mongoose_1.Types.ObjectId(userId);
            spare.stock.availableStock = spare.stock.currentStock - spare.stock.reservedStock;
            spare.stock.totalValue = spare.stock.currentStock * spare.stock.averageCost;
            const updatedSpare = await spare.save();
            logger_1.logger.info(`Updated stock for spare ${spareId}`, {
                type,
                quantity,
                newStock: updatedSpare.stock.currentStock,
                userId
            });
            return updatedSpare;
        }
        catch (error) {
            logger_1.logger.error('Error updating spare stock', { error, spareId, stockUpdate });
            throw error instanceof errors_1.AppError ? error : new errors_1.AppError('Failed to update spare stock', 500, error);
        }
    }
    async isSpareCodeUnique(companyId, spareCode, excludeId) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                spareCode: spareCode.toUpperCase()
            };
            if (excludeId) {
                query._id = { $ne: new mongoose_1.Types.ObjectId(excludeId) };
            }
            const existingSpare = await this.model.findOne(query);
            return !existingSpare;
        }
        catch (error) {
            logger_1.logger.error('Error checking spare code uniqueness', { error, companyId, spareCode });
            throw new errors_1.AppError('Failed to check spare code uniqueness', 500, error);
        }
    }
    async getSparesByCategory(companyId, category) {
        try {
            const spares = await this.model
                .find({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                category,
                'status.isActive': true
            })
                .sort({ spareName: 1 })
                .lean();
            logger_1.logger.info(`Retrieved ${spares.length} spares for category ${category} in company ${companyId}`);
            return spares;
        }
        catch (error) {
            logger_1.logger.error('Error getting spares by category', { error, companyId, category });
            throw new errors_1.AppError('Failed to retrieve spares by category', 500, error);
        }
    }
}
exports.SpareService = SpareService;
//# sourceMappingURL=SpareService.js.map