"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const Dispatch_1 = __importDefault(require("../models/Dispatch"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class DispatchService extends BaseService_1.BaseService {
    constructor() {
        super(Dispatch_1.default);
    }
    async createDispatch(dispatchData, createdBy) {
        try {
            this.validateDispatchData(dispatchData);
            const dispatch = await this.create({
                ...dispatchData,
                dispatchNumber: await this.generateDispatchNumber(dispatchData.companyId.toString()),
                dispatchDate: dispatchData.dispatchDate || new Date(),
                totalItems: 0,
                totalQuantity: 0,
                totalWeight: 0,
                totalVolume: 0,
                totalValue: 0,
                items: [],
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Dispatch entry created successfully', {
                dispatchNumber: dispatch.dispatchNumber,
                dispatchType: dispatch.dispatchType,
                totalQuantity: dispatch.totalQuantity,
                createdBy
            });
            return dispatch;
        }
        catch (error) {
            logger_1.logger.error('Error creating dispatch entry', { error, dispatchData, createdBy });
            throw error;
        }
    }
    async updateDispatchStatus(dispatchId, status, updatedBy) {
        try {
            const dispatch = await this.findById(dispatchId);
            if (!dispatch) {
                throw new errors_1.AppError('Dispatch not found', 404);
            }
            const updateData = {
                status,
                lastModifiedBy: updatedBy ? new mongoose_1.Types.ObjectId(updatedBy) : undefined
            };
            if (status === 'dispatched') {
                updateData.actualDispatchDate = new Date();
            }
            else if (status === 'delivered') {
                updateData.deliveryDate = new Date();
            }
            const updatedDispatch = await this.update(dispatchId, updateData, updatedBy);
            logger_1.logger.info('Dispatch status updated', {
                dispatchId,
                oldStatus: dispatch.status,
                newStatus: status,
                updatedBy
            });
            return updatedDispatch;
        }
        catch (error) {
            logger_1.logger.error('Error updating dispatch status', { error, dispatchId, status, updatedBy });
            throw error;
        }
    }
    async getDispatchesByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.status) {
                query.status = options.status;
            }
            if (options.customerName) {
                query.customerName = { $regex: options.customerName, $options: 'i' };
            }
            if (options.dateRange) {
                query.dispatchDate = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { dispatchDate: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting dispatches by company', { error, companyId, options });
            throw error;
        }
    }
    async getDispatchStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.dispatchDate = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalDispatches, dispatchesByStatus, totalQuantity, avgDeliveryTime, topCustomers] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalQty: { $sum: '$totalQuantity' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalQty: { $sum: '$totalQuantity' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, deliveryDate: { $exists: true }, actualDispatchDate: { $exists: true } } },
                    { $project: {
                            deliveryTime: { $subtract: ['$deliveryDate', '$actualDispatchDate'] }
                        } },
                    { $group: { _id: null, avgTime: { $avg: '$deliveryTime' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$customerName', totalDispatches: { $sum: 1 }, totalQuantity: { $sum: '$totalQuantity' } } },
                    { $sort: { totalDispatches: -1 } },
                    { $limit: 10 }
                ])
            ]);
            return {
                totalDispatches,
                dispatchesByStatus,
                totalQuantity: totalQuantity[0]?.totalQty || 0,
                averageDeliveryTime: avgDeliveryTime[0]?.avgTime || 0,
                topCustomers
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting dispatch statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async generateDispatchNumber(companyId) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const count = await this.count({
            companyId: new mongoose_1.Types.ObjectId(companyId),
            createdAt: {
                $gte: new Date(year, today.getMonth(), 1),
                $lt: new Date(year, today.getMonth() + 1, 1)
            }
        });
        return `DSP${year}${month}${(count + 1).toString().padStart(6, '0')}`;
    }
    validateDispatchData(dispatchData) {
        if (!dispatchData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!dispatchData.dispatchType) {
            throw new errors_1.AppError('Dispatch type is required', 400);
        }
        if (!dispatchData.priority) {
            throw new errors_1.AppError('Priority is required', 400);
        }
    }
}
exports.DispatchService = DispatchService;
//# sourceMappingURL=DispatchService.js.map