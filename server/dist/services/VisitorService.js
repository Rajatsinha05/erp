"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorService = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("../utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
class VisitorService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Visitor);
    }
    async createVisitor(visitorData, createdBy) {
        try {
            this.validateVisitorData(visitorData);
            const visitorNumber = await this.generateVisitorNumber(visitorData.companyId.toString());
            if (visitorData.hostInfo?.hostId) {
                const host = await models_1.User.findById(visitorData.hostInfo.hostId);
                if (!host) {
                    throw new errors_1.AppError('Host not found', 404);
                }
                visitorData.hostInfo.hostName = `${host.personalInfo?.firstName} ${host.personalInfo?.lastName}`;
            }
            const visitor = await this.create({
                ...visitorData,
                visitorNumber,
                currentStatus: 'scheduled',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Visitor created successfully', {
                visitorId: visitor._id,
                visitorNumber,
                companyId: visitorData.companyId,
                createdBy
            });
            return visitor;
        }
        catch (error) {
            logger_1.logger.error('Error creating visitor', { error, visitorData, createdBy });
            throw error;
        }
    }
    async checkInVisitor(visitorId, entryData, checkedInBy) {
        try {
            const visitor = await this.findById(visitorId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            if (visitor.currentStatus === 'checked_in') {
                throw new errors_1.AppError('Visitor is already checked in', 400);
            }
            if (visitor.approvals && visitor.approvals.length > 0) {
                const hasApproval = visitor.approvals.some((approval) => approval.isActive && approval.status === 'approved');
                if (!hasApproval) {
                    throw new errors_1.AppError('Visitor approval is required before check-in', 400);
                }
            }
            const entry = {
                entryDateTime: new Date(),
                entryGate: entryData.entryGate || 'Main Gate',
                securityGuardId: checkedInBy ? new mongoose_1.Types.ObjectId(checkedInBy) : new mongoose_1.Types.ObjectId(),
                securityGuardName: entryData.securityGuardName || 'Security Guard',
                entryMethod: 'manual',
                healthDeclaration: entryData.healthDeclaration || true,
                belongingsChecked: entryData.belongingsChecked || false,
                belongingsList: entryData.belongingsList || [],
                escortRequired: entryData.escortRequired || false,
                entryNotes: entryData.notes,
                temperatureCheck: entryData.temperatureCheck
            };
            const updatedVisitor = await this.update(visitorId, {
                $push: { entries: entry },
                currentStatus: 'checked_in',
                'visitInfo.actualArrivalTime': entry.entryDateTime,
                lastModifiedBy: checkedInBy ? new mongoose_1.Types.ObjectId(checkedInBy) : undefined
            });
            logger_1.logger.info('Visitor checked in successfully', {
                visitorId,
                entryTime: entry.entryDateTime,
                checkedInBy
            });
            return updatedVisitor;
        }
        catch (error) {
            logger_1.logger.error('Error checking in visitor', { error, visitorId, entryData, checkedInBy });
            throw error;
        }
    }
    async checkOutVisitor(visitorId, exitData, checkedOutBy) {
        try {
            const visitor = await this.findById(visitorId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            if (visitor.currentStatus !== 'checked_in') {
                throw new errors_1.AppError('Visitor is not currently checked in', 400);
            }
            const exit = {
                exitDateTime: new Date(),
                exitGate: exitData.exitGate || 'Main Gate',
                securityGuardId: checkedOutBy ? new mongoose_1.Types.ObjectId(checkedOutBy) : new mongoose_1.Types.ObjectId(),
                securityGuardName: exitData.securityGuardName || 'Security Guard',
                exitMethod: 'manual',
                belongingsReturned: exitData.belongingsReturned || true,
                belongingsNotes: exitData.belongingsNotes,
                feedbackRating: exitData.rating,
                feedbackComments: exitData.feedback,
                exitNotes: exitData.notes
            };
            const updatedVisitor = await this.update(visitorId, {
                $push: { exits: exit },
                currentStatus: 'checked_out',
                'visitInfo.actualDepartureTime': exit.exitDateTime,
                lastModifiedBy: checkedOutBy ? new mongoose_1.Types.ObjectId(checkedOutBy) : undefined
            });
            logger_1.logger.info('Visitor checked out successfully', {
                visitorId,
                exitTime: exit.exitDateTime,
                checkedOutBy
            });
            return updatedVisitor;
        }
        catch (error) {
            logger_1.logger.error('Error checking out visitor', { error, visitorId, exitData, checkedOutBy });
            throw error;
        }
    }
    async approveVisitor(visitorId, approvalData) {
        try {
            const visitor = await this.findById(visitorId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            if (visitor.overallApprovalStatus === 'approved') {
                throw new errors_1.AppError('Visitor is already approved', 400);
            }
            const updatedVisitor = await this.update(visitorId, {
                approvalStatus: 'approved',
                'approval.approvedBy': new mongoose_1.Types.ObjectId(approvalData.approvedBy),
                'approval.approvedAt': new Date(),
                'approval.approvalNotes': approvalData.approvalNotes,
                'approval.conditions': approvalData.conditions || [],
                currentStatus: 'approved',
                lastModifiedBy: new mongoose_1.Types.ObjectId(approvalData.approvedBy)
            });
            logger_1.logger.info('Visitor approved successfully', {
                visitorId,
                approvedBy: approvalData.approvedBy
            });
            return updatedVisitor;
        }
        catch (error) {
            logger_1.logger.error('Error approving visitor', { error, visitorId, approvalData });
            throw error;
        }
    }
    async rejectVisitor(visitorId, rejectionData) {
        try {
            const visitor = await this.findById(visitorId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            if (visitor.overallApprovalStatus === 'rejected') {
                throw new errors_1.AppError('Visitor is already rejected', 400);
            }
            const updatedVisitor = await this.update(visitorId, {
                approvalStatus: 'rejected',
                'approval.rejectedBy': new mongoose_1.Types.ObjectId(rejectionData.rejectedBy),
                'approval.rejectedAt': new Date(),
                'approval.rejectionReason': rejectionData.rejectionReason,
                'approval.rejectionNotes': rejectionData.rejectionNotes,
                currentStatus: 'rejected',
                lastModifiedBy: new mongoose_1.Types.ObjectId(rejectionData.rejectedBy)
            });
            logger_1.logger.info('Visitor rejected successfully', {
                visitorId,
                rejectedBy: rejectionData.rejectedBy,
                reason: rejectionData.rejectionReason
            });
            return updatedVisitor;
        }
        catch (error) {
            logger_1.logger.error('Error rejecting visitor', { error, visitorId, rejectionData });
            throw error;
        }
    }
    async getCurrentlyInside(companyId) {
        try {
            const visitors = await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                currentStatus: 'checked_in',
                isActive: true
            }, {}, ['hostInfo.hostId']);
            return visitors;
        }
        catch (error) {
            logger_1.logger.error('Error getting currently inside visitors', { error, companyId });
            throw error;
        }
    }
    async getScheduledToday(companyId) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const visitors = await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                'visitInfo.scheduledArrivalTime': {
                    $gte: startOfDay,
                    $lt: endOfDay
                },
                isActive: true
            }, { sort: { 'visitInfo.scheduledArrivalTime': 1 } }, ['hostInfo.hostId']);
            return visitors;
        }
        catch (error) {
            logger_1.logger.error('Error getting scheduled visitors for today', { error, companyId });
            throw error;
        }
    }
    async getOverstayingVisitors(companyId) {
        try {
            const visitors = await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                currentStatus: 'checked_in',
                isActive: true
            });
            const overstayingVisitors = visitors.filter(visitor => {
                if (!visitor.visitInfo?.expectedDuration)
                    return false;
                const lastEntry = visitor.entries?.[visitor.entries.length - 1];
                if (!lastEntry)
                    return false;
                const entryTime = new Date(lastEntry.entryDateTime);
                const expectedExitTime = new Date(entryTime.getTime() + visitor.visitInfo.expectedDuration * 60 * 1000);
                return new Date() > expectedExitTime;
            });
            return overstayingVisitors;
        }
        catch (error) {
            logger_1.logger.error('Error getting overstaying visitors', { error, companyId });
            throw error;
        }
    }
    async getVisitorStats(companyId, startDate, endDate) {
        try {
            const dateFilter = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
            const [totalVisitors, currentlyInside, scheduledToday, overstaying, approved, rejected, pending] = await Promise.all([
                this.count(dateFilter),
                this.count({ ...dateFilter, currentStatus: 'checked_in' }),
                this.getScheduledToday(companyId).then(visitors => visitors.length),
                this.getOverstayingVisitors(companyId).then(visitors => visitors.length),
                this.count({ ...dateFilter, approvalStatus: 'approved' }),
                this.count({ ...dateFilter, approvalStatus: 'rejected' }),
                this.count({ ...dateFilter, approvalStatus: 'pending' })
            ]);
            return {
                totalVisitors,
                currentlyInside,
                scheduledToday,
                overstaying,
                approved,
                rejected,
                pending,
                approvalRate: totalVisitors > 0 ? ((approved / totalVisitors) * 100).toFixed(2) : 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting visitor statistics', { error, companyId, startDate, endDate });
            throw error;
        }
    }
    async searchVisitors(companyId, searchTerm, page = 1, limit = 10) {
        try {
            const searchRegex = new RegExp(searchTerm, 'i');
            const filter = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true,
                $or: [
                    { visitorNumber: searchRegex },
                    { 'personalInfo.firstName': searchRegex },
                    { 'personalInfo.lastName': searchRegex },
                    { 'contactInfo.primaryPhone': searchRegex },
                    { 'contactInfo.email': searchRegex },
                    { 'companyInfo.companyName': searchRegex },
                    { 'hostInfo.hostName': searchRegex }
                ]
            };
            return await this.paginate(filter, page, limit, { createdAt: -1 });
        }
        catch (error) {
            logger_1.logger.error('Error searching visitors', { error, companyId, searchTerm });
            throw error;
        }
    }
    async generateVisitorNumber(companyId) {
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
            return `VIS-${dateStr}-${sequence}`;
        }
        catch (error) {
            logger_1.logger.error('Error generating visitor number', { error, companyId });
            throw new errors_1.AppError('Failed to generate visitor number', 500);
        }
    }
    validateVisitorData(visitorData) {
        if (!visitorData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!visitorData.personalInfo?.firstName) {
            throw new errors_1.AppError('First name is required', 400);
        }
        if (!visitorData.personalInfo?.lastName) {
            throw new errors_1.AppError('Last name is required', 400);
        }
        if (!visitorData.contactInfo?.primaryPhone) {
            throw new errors_1.AppError('Phone number is required', 400);
        }
        if (!visitorData.visitInfo?.visitPurpose) {
            throw new errors_1.AppError('Visit purpose is required', 400);
        }
        if (!visitorData.visitInfo?.scheduledDateTime) {
            throw new errors_1.AppError('Scheduled arrival time is required', 400);
        }
        if (visitorData.contactInfo?.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(visitorData.contactInfo.email)) {
                throw new errors_1.AppError('Invalid email format', 400);
            }
        }
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(visitorData.contactInfo.primaryPhone.replace(/[\s\-\(\)]/g, ''))) {
            throw new errors_1.AppError('Invalid phone format', 400);
        }
    }
}
exports.VisitorService = VisitorService;
//# sourceMappingURL=VisitorService.js.map