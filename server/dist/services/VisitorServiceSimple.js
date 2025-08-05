"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorServiceSimple = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
class VisitorServiceSimple extends BaseService_1.BaseService {
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
            }
            const visitor = await this.create({
                ...visitorData,
                visitorNumber,
                currentStatus: 'scheduled',
                overallApprovalStatus: 'pending',
                isActive: true,
                entries: [],
                exits: [],
                approvals: [],
                documents: [],
                tags: [],
                attachments: []
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
            if (visitor.currentStatus === 'checked_in' || visitor.currentStatus === 'inside') {
                throw new errors_1.AppError('Visitor is already checked in', 400);
            }
            if (visitor.approvals && visitor.approvals.length > 0) {
                const hasApproval = visitor.approvals.some(approval => approval.isActive);
                if (!hasApproval) {
                    throw new errors_1.AppError('Visitor approval is required before check-in', 400);
                }
            }
            const entry = {
                entryDateTime: new Date(),
                entryGate: entryData.entryGate || 'Main Gate',
                securityGuardId: checkedInBy ? new mongoose_1.Types.ObjectId(checkedInBy) : new mongoose_1.Types.ObjectId(),
                securityGuardName: entryData.securityGuardName || 'Security Guard',
                entryMethod: entryData.entryMethod || 'manual',
                temperatureCheck: entryData.temperatureCheck,
                healthDeclaration: true,
                belongingsChecked: true,
                belongingsList: entryData.belongingsList || [],
                escortRequired: false,
                entryNotes: entryData.entryNotes
            };
            const updatedVisitor = await this.update(visitorId, {
                $push: { entries: entry },
                currentStatus: 'checked_in'
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
            if (visitor.currentStatus !== 'checked_in' && visitor.currentStatus !== 'inside') {
                throw new errors_1.AppError('Visitor is not currently checked in', 400);
            }
            const exit = {
                exitDateTime: new Date(),
                exitGate: exitData.exitGate || 'Main Gate',
                securityGuardId: checkedOutBy ? new mongoose_1.Types.ObjectId(checkedOutBy) : new mongoose_1.Types.ObjectId(),
                securityGuardName: exitData.securityGuardName || 'Security Guard',
                exitMethod: exitData.exitMethod || 'manual',
                belongingsReturned: true,
                exitNotes: exitData.exitNotes
            };
            const updateData = {
                $push: { exits: exit },
                currentStatus: 'checked_out'
            };
            if (exitData.feedback) {
                updateData.feedback = exitData.feedback;
            }
            const updatedVisitor = await this.update(visitorId, updateData);
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
    async getCurrentlyInside(companyId) {
        try {
            const visitors = await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                currentStatus: { $in: ['checked_in', 'inside'] },
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
                'visitInfo.scheduledDateTime': {
                    $gte: startOfDay,
                    $lt: endOfDay
                },
                isActive: true
            }, { sort: { 'visitInfo.scheduledDateTime': 1 } }, ['hostInfo.hostId']);
            return visitors;
        }
        catch (error) {
            logger_1.logger.error('Error getting scheduled visitors for today', { error, companyId });
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
                    { 'organizationInfo.companyName': searchRegex },
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
exports.VisitorServiceSimple = VisitorServiceSimple;
//# sourceMappingURL=VisitorServiceSimple.js.map