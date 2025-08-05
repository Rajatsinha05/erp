"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerVisitService = void 0;
const mongoose_1 = require("mongoose");
const CustomerVisit_1 = __importDefault(require("../models/CustomerVisit"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class CustomerVisitService {
    constructor() {
    }
    async findById(id) {
        try {
            return await CustomerVisit_1.default.findById(id)
                .populate('createdBy', 'username email')
                .populate('companyId', 'name')
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error finding customer visit by ID', { error, id });
            throw error;
        }
    }
    async create(data) {
        try {
            const visit = new CustomerVisit_1.default(data);
            return await visit.save();
        }
        catch (error) {
            logger_1.logger.error('Error creating customer visit', { error, data });
            throw error;
        }
    }
    async update(id, data, updatedBy) {
        try {
            return await CustomerVisit_1.default.findByIdAndUpdate(id, { ...data, lastModifiedBy: updatedBy }, { new: true, runValidators: true }).lean();
        }
        catch (error) {
            logger_1.logger.error('Error updating customer visit', { error, id, data });
            throw error;
        }
    }
    async delete(id) {
        try {
            const result = await CustomerVisit_1.default.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            logger_1.logger.error('Error deleting customer visit', { error, id });
            throw error;
        }
    }
    async findMany(query, options) {
        try {
            return await CustomerVisit_1.default.find(query)
                .populate('createdBy', 'username email')
                .populate('companyId', 'name')
                .sort(options?.sort || { createdAt: -1 })
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error finding customer visits', { error, query });
            throw error;
        }
    }
    async createCustomerVisit(visitData, createdBy) {
        try {
            if (!visitData.partyName) {
                throw new errors_1.AppError('Party name is required', 400);
            }
            if (!visitData.contactPerson) {
                throw new errors_1.AppError('Contact person is required', 400);
            }
            if (!visitData.contactPhone) {
                throw new errors_1.AppError('Contact phone is required', 400);
            }
            if (!visitData.visitDate) {
                throw new errors_1.AppError('Visit date is required', 400);
            }
            if (!visitData.purpose) {
                throw new errors_1.AppError('Purpose is required', 400);
            }
            if (!visitData.purposeDescription) {
                throw new errors_1.AppError('Purpose description is required', 400);
            }
            if (!visitData.travelType) {
                throw new errors_1.AppError('Travel type is required', 400);
            }
            if (!visitData.companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const visit = await this.create({
                ...visitData,
                approvalStatus: 'pending',
                totalExpenses: {
                    accommodation: 0,
                    food: 0,
                    transportation: 0,
                    gifts: 0,
                    other: 0,
                    total: 0
                }
            });
            logger_1.logger.info('Customer visit created successfully', {
                visitId: visit._id,
                partyName: visit.partyName,
                purpose: visit.purpose,
                companyId: visitData.companyId,
                createdBy
            });
            return visit;
        }
        catch (error) {
            logger_1.logger.error('Error creating customer visit', { error, visitData, createdBy });
            throw error;
        }
    }
    async getVisitsByCompany(companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            return await this.findMany(query, options);
        }
        catch (error) {
            logger_1.logger.error('Error getting visits by company', { error, companyId });
            throw error;
        }
    }
    async getVisitsByDateRange(companyId, startDate, endDate) {
        try {
            return await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                visitDate: { $gte: startDate, $lte: endDate }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting visits by date range', { error, companyId, startDate, endDate });
            throw error;
        }
    }
    async getPendingApprovals(companyId) {
        try {
            return await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                approvalStatus: 'pending'
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting pending approvals', { error, companyId });
            throw error;
        }
    }
    async approveVisit(visitId, approvedBy, reimbursementAmount) {
        try {
            const visit = await this.findById(visitId);
            if (!visit) {
                throw new errors_1.AppError('Visit not found', 404);
            }
            if (visit.approvalStatus !== 'pending') {
                throw new errors_1.AppError('Visit is not pending approval', 400);
            }
            const updatedVisit = await this.update(visitId, {
                approvalStatus: 'approved',
                approvedBy: new mongoose_1.Types.ObjectId(approvedBy),
                approvedAt: new Date(),
                reimbursementAmount: reimbursementAmount || visit.totalExpenses.total
            }, approvedBy);
            logger_1.logger.info('Visit approved', {
                visitId,
                partyName: visit.partyName,
                approvedBy,
                reimbursementAmount
            });
            return updatedVisit;
        }
        catch (error) {
            logger_1.logger.error('Error approving visit', { error, visitId, approvedBy });
            throw error;
        }
    }
    async rejectVisit(visitId, rejectedBy, reason) {
        try {
            const visit = await this.findById(visitId);
            if (!visit) {
                throw new errors_1.AppError('Visit not found', 404);
            }
            if (visit.approvalStatus !== 'pending') {
                throw new errors_1.AppError('Visit is not pending approval', 400);
            }
            const updatedVisit = await this.update(visitId, {
                approvalStatus: 'rejected',
                approvedBy: new mongoose_1.Types.ObjectId(rejectedBy),
                approvedAt: new Date(),
                ...(reason && { 'visitOutcome.notes': `${visit.visitOutcome?.notes || ''}\n\nRejection Reason: ${reason}` })
            }, rejectedBy);
            logger_1.logger.info('Visit rejected', {
                visitId,
                partyName: visit.partyName,
                rejectedBy,
                reason
            });
            return updatedVisit;
        }
        catch (error) {
            logger_1.logger.error('Error rejecting visit', { error, visitId, rejectedBy });
            throw error;
        }
    }
    async markAsReimbursed(visitId, reimbursedBy) {
        try {
            const visit = await this.findById(visitId);
            if (!visit) {
                throw new errors_1.AppError('Visit not found', 404);
            }
            if (visit.approvalStatus !== 'approved') {
                throw new errors_1.AppError('Visit must be approved before reimbursement', 400);
            }
            const updatedVisit = await this.update(visitId, {
                approvalStatus: 'reimbursed',
                reimbursedAt: new Date()
            }, reimbursedBy);
            logger_1.logger.info('Visit marked as reimbursed', {
                visitId,
                partyName: visit.partyName,
                reimbursedBy
            });
            return updatedVisit;
        }
        catch (error) {
            logger_1.logger.error('Error marking visit as reimbursed', { error, visitId, reimbursedBy });
            throw error;
        }
    }
    async addFoodExpense(visitId, expenseData, updatedBy) {
        try {
            const visit = await this.findById(visitId);
            if (!visit) {
                throw new errors_1.AppError('Visit not found', 404);
            }
            expenseData.totalCost = expenseData.costPerPerson * expenseData.numberOfPeople;
            const updatedVisit = await CustomerVisit_1.default.findByIdAndUpdate(visitId, {
                $push: { foodExpenses: expenseData },
                lastModifiedBy: new mongoose_1.Types.ObjectId(updatedBy),
                updatedAt: new Date()
            }, { new: true });
            logger_1.logger.info('Food expense added', { visitId, expenseData, updatedBy });
            return updatedVisit;
        }
        catch (error) {
            logger_1.logger.error('Error adding food expense', { error, visitId, expenseData, updatedBy });
            throw error;
        }
    }
    async addGift(visitId, giftData, updatedBy) {
        try {
            const visit = await this.findById(visitId);
            if (!visit) {
                throw new errors_1.AppError('Visit not found', 404);
            }
            giftData.totalCost = giftData.unitCost * giftData.quantity;
            const updatedVisit = await CustomerVisit_1.default.findByIdAndUpdate(visitId, {
                $push: { giftsGiven: giftData },
                lastModifiedBy: new mongoose_1.Types.ObjectId(updatedBy),
                updatedAt: new Date()
            }, { new: true });
            logger_1.logger.info('Gift added', { visitId, giftData, updatedBy });
            return updatedVisit;
        }
        catch (error) {
            logger_1.logger.error('Error adding gift', { error, visitId, giftData, updatedBy });
            throw error;
        }
    }
    async getExpenseStats(companyId, startDate, endDate) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (startDate && endDate) {
                matchQuery.visitDate = { $gte: startDate, $lte: endDate };
            }
            const stats = await CustomerVisit_1.default.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalVisits: { $sum: 1 },
                        totalExpenses: { $sum: '$totalExpenses.total' },
                        avgExpensePerVisit: { $avg: '$totalExpenses.total' },
                        accommodationTotal: { $sum: '$totalExpenses.accommodation' },
                        foodTotal: { $sum: '$totalExpenses.food' },
                        transportationTotal: { $sum: '$totalExpenses.transportation' },
                        giftsTotal: { $sum: '$totalExpenses.gifts' },
                        otherTotal: { $sum: '$totalExpenses.other' },
                        pendingApprovals: {
                            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
                        },
                        approvedVisits: {
                            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
                        },
                        reimbursedVisits: {
                            $sum: { $cond: [{ $eq: ['$approvalStatus', 'reimbursed'] }, 1, 0] }
                        }
                    }
                }
            ]);
            return stats[0] || {
                totalVisits: 0,
                totalExpenses: 0,
                avgExpensePerVisit: 0,
                accommodationTotal: 0,
                foodTotal: 0,
                transportationTotal: 0,
                giftsTotal: 0,
                otherTotal: 0,
                pendingApprovals: 0,
                approvedVisits: 0,
                reimbursedVisits: 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting expense stats', { error, companyId });
            throw error;
        }
    }
    async findManyWithPagination(query, options) {
        try {
            const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                CustomerVisit_1.default.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate('createdBy', 'username email')
                    .populate('companyId', 'name')
                    .lean(),
                CustomerVisit_1.default.countDocuments(query)
            ]);
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.logger.error('Error finding customer visits with pagination', { error, query, options });
            throw error;
        }
    }
}
exports.CustomerVisitService = CustomerVisitService;
//# sourceMappingURL=CustomerVisitService.js.map