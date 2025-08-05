"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class StockMovementService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.StockMovement);
    }
    async createStockMovement(movementData, createdBy) {
        try {
            this.validateMovementData(movementData);
            if (!movementData.movementNumber) {
                movementData.movementNumber = await this.generateMovementNumber(movementData.companyId.toString());
            }
            const movement = await this.create({
                ...movementData,
                movementDate: movementData.movementDate || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Stock movement created successfully', {
                movementId: movement._id,
                movementNumber: movement.movementNumber,
                movementType: movement.movementType,
                itemId: movement.itemId,
                quantity: movement.quantity,
                createdBy
            });
            return movement;
        }
        catch (error) {
            logger_1.logger.error('Error creating stock movement', { error, movementData, createdBy });
            throw error;
        }
    }
    async getMovementsByItem(itemId, options = {}) {
        try {
            const query = {
                itemId: new mongoose_1.Types.ObjectId(itemId)
            };
            if (options.movementType) {
                query.movementType = options.movementType;
            }
            if (options.dateRange) {
                query.movementDate = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { movementDate: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting movements by item', { error, itemId });
            throw error;
        }
    }
    async getMovementsByWarehouse(warehouseId, options = {}) {
        try {
            const query = {
                warehouseId: new mongoose_1.Types.ObjectId(warehouseId)
            };
            if (options.movementType) {
                query.movementType = options.movementType;
            }
            if (options.dateRange) {
                query.movementDate = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { movementDate: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting movements by warehouse', { error, warehouseId });
            throw error;
        }
    }
    async getMovementsByDateRange(companyId, startDate, endDate, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                movementDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            };
            return await this.findMany(query, {
                sort: { movementDate: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting movements by date range', { error, companyId, startDate, endDate });
            throw error;
        }
    }
    async getMovementsByType(companyId, movementType, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                movementType
            };
            return await this.findMany(query, {
                sort: { movementDate: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting movements by type', { error, companyId, movementType });
            throw error;
        }
    }
    async getMovementStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.movementDate = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalMovements, movementsByType, totalQuantityIn, totalQuantityOut, movementsByDate] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$movementType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, movementType: 'inward' } },
                    { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, movementType: 'outward' } },
                    { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$movementDate' } },
                            count: { $sum: 1 },
                            totalQuantity: { $sum: '$quantity' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ])
            ]);
            return {
                totalMovements,
                movementsByType,
                totalQuantityIn: totalQuantityIn[0]?.totalQuantity || 0,
                totalQuantityOut: totalQuantityOut[0]?.totalQuantity || 0,
                movementsByDate
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting movement statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async getItemMovementHistory(itemId, companyId) {
        try {
            const movements = await this.findMany({
                itemId: new mongoose_1.Types.ObjectId(itemId),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            }, { sort: { movementDate: 1 } });
            let runningBalance = 0;
            const history = movements.map(movement => {
                if (movement.movementType === 'inward') {
                    runningBalance += movement.quantity;
                }
                else if (movement.movementType === 'outward') {
                    runningBalance -= movement.quantity;
                }
                else if (movement.movementType === 'adjustment') {
                    runningBalance = movement.quantity;
                }
                return {
                    ...movement.toObject(),
                    runningBalance
                };
            });
            return history;
        }
        catch (error) {
            logger_1.logger.error('Error getting item movement history', { error, itemId, companyId });
            throw error;
        }
    }
    async generateMovementNumber(companyId) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const count = await this.count({
            companyId: new mongoose_1.Types.ObjectId(companyId),
            movementDate: {
                $gte: new Date(year, today.getMonth(), 1),
                $lt: new Date(year, today.getMonth() + 1, 1)
            }
        });
        return `MOV${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }
    validateMovementData(movementData) {
        if (!movementData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!movementData.itemId) {
            throw new errors_1.AppError('Item ID is required', 400);
        }
        if (!movementData.movementType) {
            throw new errors_1.AppError('Movement type is required', 400);
        }
        if (!movementData.quantity || movementData.quantity <= 0) {
            throw new errors_1.AppError('Quantity must be greater than 0', 400);
        }
        if (!movementData.unit) {
            throw new errors_1.AppError('Unit is required', 400);
        }
        const validMovementTypes = ['inward', 'outward', 'transfer', 'adjustment'];
        if (!validMovementTypes.includes(movementData.movementType)) {
            throw new errors_1.AppError('Invalid movement type', 400);
        }
    }
}
exports.StockMovementService = StockMovementService;
//# sourceMappingURL=StockMovementService.js.map