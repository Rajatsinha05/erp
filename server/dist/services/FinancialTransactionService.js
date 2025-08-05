"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialTransactionService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const FinancialTransaction_1 = __importDefault(require("../models/FinancialTransaction"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class FinancialTransactionService extends BaseService_1.BaseService {
    constructor() {
        super(FinancialTransaction_1.default);
    }
    async createTransaction(transactionData, createdBy) {
        try {
            this.validateTransactionData(transactionData);
            if (!transactionData.transactionNumber) {
                transactionData.transactionNumber = await this.generateTransactionNumber(transactionData.companyId.toString());
            }
            const transaction = await this.create({
                ...transactionData,
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Financial transaction created successfully', {
                transactionId: transaction._id,
                transactionNumber: transaction.transactionNumber,
                amount: transaction.amount,
                type: transaction.transactionType,
                createdBy
            });
            return transaction;
        }
        catch (error) {
            logger_1.logger.error('Error creating financial transaction', { error, transactionData, createdBy });
            throw error;
        }
    }
    async updateTransactionStatus(transactionId, status, updatedBy) {
        try {
            const transaction = await this.findById(transactionId);
            if (!transaction) {
                throw new errors_1.AppError('Financial transaction not found', 404);
            }
            const updateData = {
                'paymentDetails.paymentStatus': status,
                lastModifiedBy: updatedBy ? new mongoose_1.Types.ObjectId(updatedBy) : undefined
            };
            const updatedTransaction = await this.update(transactionId, updateData, updatedBy);
            logger_1.logger.info('Financial transaction status updated', {
                transactionId,
                oldStatus: transaction.paymentDetails?.paymentStatus,
                newStatus: status,
                updatedBy
            });
            return updatedTransaction;
        }
        catch (error) {
            logger_1.logger.error('Error updating transaction status', { error, transactionId, status, updatedBy });
            throw error;
        }
    }
    async getTransactionsByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.transactionType) {
                query.transactionType = options.transactionType;
            }
            if (options.status) {
                query['paymentDetails.paymentStatus'] = options.status;
            }
            if (options.dateRange) {
                query.transactionDate = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            if (options.search) {
                query.$or = [
                    { transactionNumber: { $regex: options.search, $options: 'i' } },
                    { description: { $regex: options.search, $options: 'i' } },
                    { 'partyDetails.partyName': { $regex: options.search, $options: 'i' } }
                ];
            }
            return await this.findMany(query, {
                sort: { transactionDate: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting transactions by company', { error, companyId, options });
            throw error;
        }
    }
    async getTransactionsByType(companyId, transactionType, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                transactionType
            };
            return await this.findMany(query, {
                sort: { transactionDate: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting transactions by type', { error, companyId, transactionType });
            throw error;
        }
    }
    async getTransactionStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.transactionDate = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalTransactions, transactionsByType, transactionsByStatus, totalAmount, averageAmount] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$transactionType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$paymentDetails.paymentStatus', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
                ])
            ]);
            return {
                totalTransactions,
                transactionsByType,
                transactionsByStatus,
                totalAmount: totalAmount[0]?.totalAmount || 0,
                averageAmount: averageAmount[0]?.avgAmount || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting transaction statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async generateTransactionNumber(companyId) {
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
        return `TXN${year}${month}${(count + 1).toString().padStart(6, '0')}`;
    }
    validateTransactionData(transactionData) {
        if (!transactionData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!transactionData.amount || transactionData.amount <= 0) {
            throw new errors_1.AppError('Valid amount is required', 400);
        }
        if (!transactionData.transactionType) {
            throw new errors_1.AppError('Transaction type is required', 400);
        }
        if (!transactionData.transactionDate) {
            throw new errors_1.AppError('Transaction date is required', 400);
        }
        if (!transactionData.description) {
            throw new errors_1.AppError('Transaction description is required', 400);
        }
    }
}
exports.FinancialTransactionService = FinancialTransactionService;
//# sourceMappingURL=FinancialTransactionService.js.map