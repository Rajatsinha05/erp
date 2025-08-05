"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionService = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("../utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
const InventoryService_1 = require("./InventoryService");
const query_optimizer_1 = __importDefault(require("../utils/query-optimizer"));
class ProductionService extends BaseService_1.BaseService {
    inventoryService;
    constructor() {
        super(models_1.ProductionOrder);
        this.inventoryService = new InventoryService_1.InventoryService();
    }
    async createProductionOrder(orderData, createdBy) {
        try {
            this.validateProductionOrderData(orderData);
            const orderNumber = await this.generateOrderNumber(orderData.companyId.toString());
            if (orderData.rawMaterials && orderData.rawMaterials.length > 0) {
                await this.validateRawMaterials(orderData.rawMaterials, orderData.companyId.toString());
            }
            const materialCost = await this.calculateMaterialCost(orderData.rawMaterials || [], orderData.orderQuantity || 0);
            const order = await this.create({
                ...orderData,
                productionOrderNumber: orderNumber,
                costSummary: {
                    materialCost,
                    laborCost: 0,
                    machineCost: 0,
                    overheadCost: 0,
                    jobWorkCost: 0,
                    totalProductionCost: materialCost,
                    costPerUnit: orderData.orderQuantity ? materialCost / orderData.orderQuantity : 0
                },
                status: 'draft',
                completedQuantity: 0,
                rejectedQuantity: 0,
                pendingQuantity: orderData.orderQuantity || 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Production order created successfully', {
                orderId: order._id,
                orderNumber,
                companyId: orderData.companyId,
                createdBy
            });
            return order;
        }
        catch (error) {
            logger_1.logger.error('Error creating production order', { error, orderData, createdBy });
            throw error;
        }
    }
    async startProduction(orderId, startedBy) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Production order not found', 404);
            }
            if (order.status !== 'approved') {
                throw new errors_1.AppError('Production order must be approved before starting', 400);
            }
            await this.checkMaterialAvailability(order.rawMaterials || [], order.orderQuantity || 0);
            await this.reserveMaterials(order.rawMaterials || [], order.orderQuantity || 0, orderId, startedBy);
            const updatedOrder = await this.update(orderId, {
                status: 'in_progress',
                'schedule.actualStartDate': new Date(),
                'productionStages.0.status': 'in_progress',
                'productionStages.0.timing.actualStartTime': new Date()
            }, startedBy);
            logger_1.logger.info('Production order started successfully', {
                orderId,
                orderNumber: order.productionOrderNumber,
                startedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error starting production order', { error, orderId, startedBy });
            throw error;
        }
    }
    async completeStage(orderId, stageIndex, completionData) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Production order not found', 404);
            }
            if (!order.productionStages || stageIndex >= order.productionStages.length) {
                throw new errors_1.AppError('Invalid stage index', 400);
            }
            const stage = order.productionStages[stageIndex];
            if (stage.status === 'completed') {
                throw new errors_1.AppError('Stage is already completed', 400);
            }
            const updateData = {
                [`productionStages.${stageIndex}.status`]: 'completed',
                [`productionStages.${stageIndex}.timing.actualEndTime`]: new Date(),
                [`productionStages.${stageIndex}.output.producedQuantity`]: completionData.actualQuantity,
                [`productionStages.${stageIndex}.qualityControl.notes`]: completionData.qualityNotes,
                [`productionStages.${stageIndex}.updatedBy`]: completionData.completedBy ? new mongoose_1.Types.ObjectId(completionData.completedBy) : undefined
            };
            const isLastStage = stageIndex === order.productionStages.length - 1;
            if (isLastStage) {
                updateData.status = 'completed';
                updateData['schedule.actualEndDate'] = new Date();
                updateData.completedQuantity = completionData.actualQuantity || order.orderQuantity;
                updateData.pendingQuantity = 0;
            }
            else {
                updateData[`productionStages.${stageIndex + 1}.status`] = 'in_progress';
                updateData[`productionStages.${stageIndex + 1}.timing.actualStartTime`] = new Date();
            }
            const updatedOrder = await this.update(orderId, updateData, completionData.completedBy);
            logger_1.logger.info('Production stage completed successfully', {
                orderId,
                stageIndex,
                stageName: stage.stageName,
                completedBy: completionData.completedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error completing production stage', { error, orderId, stageIndex, completionData });
            throw error;
        }
    }
    async completeProduction(orderId, completionData) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Production order not found', 404);
            }
            if (order.status !== 'in_progress') {
                throw new errors_1.AppError('Production order is not in progress', 400);
            }
            const updatedOrder = await this.update(orderId, {
                status: 'completed',
                'schedule.actualEndDate': new Date(),
                completedQuantity: completionData.actualQuantity,
                pendingQuantity: 0,
                'qualitySummary.totalProduced': completionData.actualQuantity,
                'qualitySummary.totalApproved': completionData.actualQuantity
            }, completionData.completedBy);
            logger_1.logger.info('Production order completed successfully', {
                orderId,
                orderNumber: order.productionOrderNumber,
                actualQuantity: completionData.actualQuantity,
                completedBy: completionData.completedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error completing production order', { error, orderId, completionData });
            throw error;
        }
    }
    async cancelProduction(orderId, reason, cancelledBy) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Production order not found', 404);
            }
            if (order.status === 'completed') {
                throw new errors_1.AppError('Cannot cancel completed production order', 400);
            }
            if (order.status === 'in_progress') {
                await this.releaseMaterials(order.rawMaterials || [], order.orderQuantity || 0, orderId, cancelledBy);
            }
            const updatedOrder = await this.update(orderId, {
                status: 'cancelled',
                notes: reason,
                updatedBy: cancelledBy ? new mongoose_1.Types.ObjectId(cancelledBy) : undefined
            }, cancelledBy);
            logger_1.logger.info('Production order cancelled successfully', {
                orderId,
                orderNumber: order.productionOrderNumber,
                reason,
                cancelledBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error cancelling production order', { error, orderId, reason, cancelledBy });
            throw error;
        }
    }
    async getProductionStats(companyId, startDate, endDate) {
        try {
            const startTime = Date.now();
            let filter = query_optimizer_1.default.createCompanyFilter(companyId);
            if (startDate && endDate) {
                filter = { ...filter, ...query_optimizer_1.default.createDateRangeFilter('createdAt', startDate, endDate) };
            }
            const pipeline = query_optimizer_1.default.optimizeAggregationPipeline([
                { $match: filter },
                {
                    $facet: {
                        statusStats: [
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        quantityStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalPlannedQuantity: { $sum: '$quantityToProduce' },
                                    totalActualQuantity: { $sum: '$quantityProduced' },
                                    avgPlannedQuantity: { $avg: '$quantityToProduce' },
                                    avgActualQuantity: { $avg: '$quantityProduced' }
                                }
                            }
                        ],
                        totalStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalOrders: { $sum: 1 }
                                }
                            }
                        ]
                    }
                }
            ]);
            const [result] = await this.aggregate(pipeline);
            const statusCounts = result.statusStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});
            const totalOrders = result.totalStats[0]?.totalOrders || 0;
            const completedOrders = statusCounts.completed || 0;
            const inProgressOrders = statusCounts.in_progress || 0;
            const cancelledOrders = statusCounts.cancelled || 0;
            const draftOrders = statusCounts.draft || 0;
            const quantityStats = result.quantityStats[0] || {};
            const totalPlannedQuantity = quantityStats.totalPlannedQuantity || 0;
            const totalActualQuantity = quantityStats.totalActualQuantity || 0;
            const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100) : 0;
            const efficiency = totalPlannedQuantity > 0 ? ((totalActualQuantity / totalPlannedQuantity) * 100) : 0;
            query_optimizer_1.default.logQueryPerformance('getProductionStats', startTime, 1, { companyId, startDate, endDate });
            return {
                totalOrders,
                completedOrders,
                inProgressOrders,
                cancelledOrders,
                draftOrders,
                totalPlannedQuantity,
                totalActualQuantity,
                averagePlannedQuantity: quantityStats.avgPlannedQuantity || 0,
                averageActualQuantity: quantityStats.avgActualQuantity || 0,
                completionRate: Math.round(completionRate * 100) / 100,
                efficiency: Math.round(efficiency * 100) / 100
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting production statistics', { error, companyId, startDate, endDate });
            throw error;
        }
    }
    async checkMaterialAvailability(rawMaterials, orderQuantity) {
        for (const material of rawMaterials) {
            const item = await models_1.InventoryItem.findById(material.itemId);
            if (!item) {
                throw new errors_1.AppError(`Material not found: ${material.itemName}`, 404);
            }
            const requiredQuantity = material.requiredQuantity * orderQuantity;
            const availableStock = item.stock?.currentStock || 0;
            if (availableStock < requiredQuantity) {
                throw new errors_1.AppError(`Insufficient stock for ${material.itemName}. Required: ${requiredQuantity}, Available: ${availableStock}`, 400);
            }
        }
    }
    async reserveMaterials(rawMaterials, orderQuantity, orderId, reservedBy) {
        for (const material of rawMaterials) {
            const requiredQuantity = material.requiredQuantity * orderQuantity;
            await this.inventoryService.reserveStock(material.itemId.toString(), requiredQuantity, `Production Order: ${orderId}`, reservedBy);
        }
    }
    async releaseMaterials(rawMaterials, orderQuantity, orderId, releasedBy) {
        for (const material of rawMaterials) {
            const requiredQuantity = material.requiredQuantity * orderQuantity;
            await this.inventoryService.releaseReservedStock(material.itemId.toString(), requiredQuantity, `Production Order Cancelled: ${orderId}`, releasedBy);
        }
    }
    async calculateMaterialCost(rawMaterials, orderQuantity) {
        let totalCost = 0;
        for (const material of rawMaterials) {
            const item = await models_1.InventoryItem.findById(material.itemId);
            if (item && item.pricing?.costPrice) {
                totalCost += material.requiredQuantity * orderQuantity * item.pricing.costPrice;
            }
        }
        return totalCost;
    }
    async validateRawMaterials(rawMaterials, companyId) {
        for (const material of rawMaterials) {
            const item = await models_1.InventoryItem.findOne({
                _id: material.itemId,
                companyId: new mongoose_1.Types.ObjectId(companyId),
                status: { isActive: true }
            });
            if (!item) {
                throw new errors_1.AppError(`Raw material not found or inactive: ${material.itemName}`, 400);
            }
        }
    }
    async generateOrderNumber(companyId) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const todayCount = await this.count({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });
            const sequence = (todayCount + 1).toString().padStart(4, '0');
            return `PO-${dateStr}-${sequence}`;
        }
        catch (error) {
            logger_1.logger.error('Error generating production order number', { error, companyId });
            throw new errors_1.AppError('Failed to generate production order number', 500);
        }
    }
    async getTotalPlannedQuantity(filter) {
        try {
            const result = await models_1.ProductionOrder.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$plannedQuantity' } } }
            ]);
            return result.length > 0 ? result[0].total : 0;
        }
        catch (error) {
            return 0;
        }
    }
    async getTotalActualQuantity(filter) {
        try {
            const result = await models_1.ProductionOrder.aggregate([
                { $match: { ...filter, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$actualQuantity' } } }
            ]);
            return result.length > 0 ? result[0].total : 0;
        }
        catch (error) {
            return 0;
        }
    }
    validateProductionOrderData(orderData) {
        if (!orderData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!orderData.product?.productType) {
            throw new errors_1.AppError('Product type is required', 400);
        }
        if (!orderData.orderQuantity || orderData.orderQuantity <= 0) {
            throw new errors_1.AppError('Order quantity must be greater than 0', 400);
        }
        if (!orderData.schedule?.plannedStartDate) {
            throw new errors_1.AppError('Planned start date is required', 400);
        }
        if (!orderData.schedule?.plannedEndDate) {
            throw new errors_1.AppError('Planned end date is required', 400);
        }
        if (new Date(orderData.schedule.plannedStartDate) >= new Date(orderData.schedule.plannedEndDate)) {
            throw new errors_1.AppError('Planned end date must be after start date', 400);
        }
    }
}
exports.ProductionService = ProductionService;
//# sourceMappingURL=ProductionService.js.map