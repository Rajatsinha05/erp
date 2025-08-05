"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("../utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
const query_optimizer_1 = __importDefault(require("../utils/query-optimizer"));
class InventoryService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.InventoryItem);
    }
    async createInventoryItem(itemData, createdBy) {
        try {
            this.validateInventoryItemData(itemData);
            const existingItem = await this.findOne({
                itemCode: itemData.itemCode?.toUpperCase(),
                companyId: itemData.companyId
            });
            if (existingItem) {
                throw new errors_1.AppError('Item code already exists in this company', 400);
            }
            if (!itemData.itemCode) {
                itemData.itemCode = await this.generateItemCode(itemData.companyId.toString(), itemData.itemName);
            }
            const itemToCreate = {
                ...itemData,
                itemCode: itemData.itemCode.toUpperCase(),
                stock: {
                    ...itemData.stock,
                    currentStock: itemData.stock?.currentStock || 0,
                    availableStock: itemData.stock?.availableStock || 0,
                    reservedStock: itemData.stock?.reservedStock || 0,
                    reorderLevel: itemData.stock?.reorderLevel || 0,
                    maxStockLevel: itemData.stock?.maxStockLevel || 0,
                    unit: itemData.stock?.unit || 'pcs',
                    valuationMethod: itemData.stock?.valuationMethod || 'FIFO',
                    averageCost: itemData.stock?.averageCost || 0,
                    totalValue: itemData.stock?.totalValue || 0,
                    minStockLevel: itemData.stock?.minStockLevel || 0,
                    inTransitStock: itemData.stock?.inTransitStock || 0,
                    damagedStock: itemData.stock?.damagedStock || 0
                },
                pricing: {
                    ...itemData.pricing,
                    costPrice: itemData.pricing?.costPrice || 0,
                    sellingPrice: itemData.pricing?.sellingPrice || 0,
                    mrp: itemData.pricing?.mrp || 0
                }
            };
            const item = await this.create(itemToCreate, createdBy);
            logger_1.logger.info('Inventory item created successfully', {
                itemId: item._id,
                itemCode: item.itemCode,
                companyId: itemData.companyId,
                createdBy
            });
            return item;
        }
        catch (error) {
            logger_1.logger.error('Error creating inventory item', { error, itemData, createdBy });
            throw error;
        }
    }
    async updateStock(itemId, warehouseId, quantity, movementType, reference, notes, updatedBy) {
        try {
            const item = await this.findById(itemId);
            if (!item) {
                throw new errors_1.AppError('Inventory item not found', 404);
            }
            const warehouse = await models_1.Warehouse.findById(warehouseId);
            if (!warehouse) {
                throw new errors_1.AppError('Warehouse not found', 404);
            }
            let newCurrentStock = item.stock?.currentStock || 0;
            let newAvailableStock = item.stock?.availableStock || 0;
            if (movementType === 'in') {
                newCurrentStock += quantity;
                newAvailableStock += quantity;
            }
            else if (movementType === 'out') {
                if (newAvailableStock < quantity) {
                    throw new errors_1.AppError('Insufficient stock available', 400);
                }
                newCurrentStock -= quantity;
                newAvailableStock -= quantity;
            }
            else if (movementType === 'adjustment') {
                newCurrentStock = quantity;
                newAvailableStock = quantity - (item.stock?.reservedStock || 0);
            }
            const updatedItem = await this.update(itemId, {
                'stock.currentStock': newCurrentStock,
                'stock.availableStock': newAvailableStock,
                'stock.totalValue': newCurrentStock * (item.pricing?.costPrice || 0)
            }, updatedBy);
            const mappedMovementType = movementType === 'in' ? 'inward' :
                movementType === 'out' ? 'outward' :
                    movementType;
            await this.createStockMovement({
                companyId: item.companyId,
                itemId: new mongoose_1.Types.ObjectId(itemId),
                movementType: mappedMovementType,
                quantity,
                unit: item.stock?.unit || 'pcs',
                movementDate: new Date(),
                movementNumber: `MOV-${Date.now()}`,
                toLocation: {
                    warehouseId: new mongoose_1.Types.ObjectId(warehouseId),
                    warehouseName: warehouse.warehouseName,
                    isExternal: false
                },
                referenceDocument: reference ? {
                    documentType: 'adjustment_note',
                    documentNumber: reference
                } : undefined,
                notes,
                createdBy: updatedBy ? new mongoose_1.Types.ObjectId(updatedBy) : undefined
            });
            logger_1.logger.info('Stock updated successfully', {
                itemId,
                warehouseId,
                movementType,
                quantity,
                newStock: newCurrentStock,
                updatedBy
            });
            return updatedItem;
        }
        catch (error) {
            logger_1.logger.error('Error updating stock', { error, itemId, warehouseId, quantity, movementType });
            throw error;
        }
    }
    async reserveStock(itemId, quantity, reference, reservedBy) {
        try {
            const item = await this.findById(itemId);
            if (!item) {
                throw new errors_1.AppError('Inventory item not found', 404);
            }
            const availableStock = item.stock?.availableStock || 0;
            if (availableStock < quantity) {
                throw new errors_1.AppError('Insufficient stock available for reservation', 400);
            }
            const newReservedStock = (item.stock?.reservedStock || 0) + quantity;
            const newAvailableStock = availableStock - quantity;
            const updatedItem = await this.update(itemId, {
                'stock.reservedStock': newReservedStock,
                'stock.availableStock': newAvailableStock
            }, reservedBy);
            logger_1.logger.info('Stock reserved successfully', {
                itemId,
                quantity,
                reference,
                newReservedStock,
                newAvailableStock,
                reservedBy
            });
            return updatedItem;
        }
        catch (error) {
            logger_1.logger.error('Error reserving stock', { error, itemId, quantity, reference });
            throw error;
        }
    }
    async releaseReservedStock(itemId, quantity, reference, releasedBy) {
        try {
            const item = await this.findById(itemId);
            if (!item) {
                throw new errors_1.AppError('Inventory item not found', 404);
            }
            const reservedStock = item.stock?.reservedStock || 0;
            if (reservedStock < quantity) {
                throw new errors_1.AppError('Cannot release more stock than reserved', 400);
            }
            const newReservedStock = reservedStock - quantity;
            const newAvailableStock = (item.stock?.availableStock || 0) + quantity;
            const updatedItem = await this.update(itemId, {
                'stock.reservedStock': newReservedStock,
                'stock.availableStock': newAvailableStock
            }, releasedBy);
            logger_1.logger.info('Reserved stock released successfully', {
                itemId,
                quantity,
                reference,
                newReservedStock,
                newAvailableStock,
                releasedBy
            });
            return updatedItem;
        }
        catch (error) {
            logger_1.logger.error('Error releasing reserved stock', { error, itemId, quantity, reference });
            throw error;
        }
    }
    async getLowStockItems(companyId) {
        try {
            const startTime = Date.now();
            const pipeline = query_optimizer_1.default.optimizeAggregationPipeline([
                {
                    $match: query_optimizer_1.default.createCompanyFilter(companyId, {
                        'status.isActive': true,
                        $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] }
                    })
                },
                {
                    $project: {
                        itemCode: 1,
                        itemName: 1,
                        'stock.currentStock': 1,
                        'stock.reorderLevel': 1,
                        unitPrice: 1,
                        category: 1,
                        lastUpdated: 1
                    }
                },
                { $sort: { 'stock.currentStock': 1 } },
                { $limit: 100 }
            ]);
            const items = await this.aggregate(pipeline);
            query_optimizer_1.default.logQueryPerformance('getLowStockItems', startTime, items.length, { companyId });
            logger_1.logger.info(`Found ${items.length} low stock items for company ${companyId}`);
            return items;
        }
        catch (error) {
            logger_1.logger.error('Error getting low stock items', { error, companyId });
            throw error;
        }
    }
    async getStockMovementHistory(itemId, limit = 50) {
        try {
            const movements = await models_1.StockMovement.find({ itemId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('warehouseId', 'warehouseName')
                .populate('createdBy', 'personalInfo.firstName personalInfo.lastName');
            return movements;
        }
        catch (error) {
            logger_1.logger.error('Error getting stock movement history', { error, itemId });
            throw error;
        }
    }
    async searchItems(companyId, searchTerm, page = 1, limit = 10) {
        try {
            const searchRegex = new RegExp(searchTerm, 'i');
            const filter = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true,
                $or: [
                    { itemCode: searchRegex },
                    { itemName: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { subCategory: searchRegex },
                    { brand: searchRegex },
                    { model: searchRegex }
                ]
            };
            return await this.paginate(filter, page, limit, { itemName: 1 });
        }
        catch (error) {
            logger_1.logger.error('Error searching inventory items', { error, companyId, searchTerm });
            throw error;
        }
    }
    async getInventoryStats(companyId) {
        try {
            const [totalItems, activeItems, lowStockItems, outOfStockItems, totalValue] = await Promise.all([
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) }),
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true }),
                this.getLowStockItems(companyId).then(items => items.length),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    'status.isActive': true,
                    'stock.currentStock': 0
                }),
                this.calculateTotalInventoryValue(companyId)
            ]);
            return {
                totalItems,
                activeItems,
                inactiveItems: totalItems - activeItems,
                lowStockItems,
                outOfStockItems,
                totalValue,
                averageValue: activeItems > 0 ? totalValue / activeItems : 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting inventory statistics', { error, companyId });
            throw error;
        }
    }
    async createStockMovement(movementData) {
        try {
            const movement = new models_1.StockMovement({
                ...movementData,
                movementDate: new Date(),
                isActive: true
            });
            return await movement.save();
        }
        catch (error) {
            logger_1.logger.error('Error creating stock movement', { error, movementData });
            throw error;
        }
    }
    async calculateTotalInventoryValue(companyId) {
        try {
            const startTime = Date.now();
            const pipeline = query_optimizer_1.default.optimizeAggregationPipeline([
                {
                    $match: query_optimizer_1.default.createCompanyFilter(companyId, {
                        'status.isActive': true,
                        'stock.currentStock': { $gt: 0 }
                    })
                },
                {
                    $group: {
                        _id: null,
                        totalValue: {
                            $sum: {
                                $multiply: ['$stock.currentStock', '$pricing.costPrice']
                            }
                        },
                        totalItems: { $sum: 1 }
                    }
                }
            ]);
            const result = await this.aggregate(pipeline);
            query_optimizer_1.default.logQueryPerformance('calculateTotalInventoryValue', startTime, 1, { companyId });
            return result.length > 0 ? result[0].totalValue || 0 : 0;
        }
        catch (error) {
            logger_1.logger.error('Error calculating total inventory value', { error, companyId });
            return 0;
        }
    }
    async generateItemCode(companyId, itemName) {
        try {
            const baseCode = itemName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 6);
            let code = baseCode;
            let counter = 1;
            while (await this.exists({ itemCode: code, companyId: new mongoose_1.Types.ObjectId(companyId) })) {
                code = `${baseCode}${counter.toString().padStart(3, '0')}`;
                counter++;
            }
            return code;
        }
        catch (error) {
            logger_1.logger.error('Error generating item code', { error, companyId, itemName });
            throw new errors_1.AppError('Failed to generate item code', 500);
        }
    }
    validateInventoryItemData(itemData) {
        if (!itemData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!itemData.itemName) {
            throw new errors_1.AppError('Item name is required', 400);
        }
        if (!itemData.category) {
            throw new errors_1.AppError('Category is required', 400);
        }
        if (!itemData.stock?.unit) {
            throw new errors_1.AppError('Unit is required', 400);
        }
        if (itemData.pricing?.costPrice && itemData.pricing.costPrice < 0) {
            throw new errors_1.AppError('Cost price cannot be negative', 400);
        }
        if (itemData.pricing?.sellingPrice && itemData.pricing.sellingPrice < 0) {
            throw new errors_1.AppError('Selling price cannot be negative', 400);
        }
        if (itemData.stock?.reorderLevel && itemData.stock.reorderLevel < 0) {
            throw new errors_1.AppError('Reorder level cannot be negative', 400);
        }
    }
}
exports.InventoryService = InventoryService;
//# sourceMappingURL=InventoryService.js.map