"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class AuditLogService extends BaseService_1.BaseService {
    constructor() {
        super(AuditLog_1.default);
    }
    async createAuditLog(auditData, createdBy) {
        try {
            this.validateAuditData(auditData);
            const auditLog = await this.create({
                ...auditData,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            return auditLog;
        }
        catch (error) {
            logger_1.logger.error('Error creating audit log', { error, auditData, createdBy });
            throw error;
        }
    }
    async logUserAction(userId, companyId, action, resourceType, resourceId, details, ipAddress, userAgent) {
        try {
            const auditData = {
                userId: new mongoose_1.Types.ObjectId(userId),
                companyId: new mongoose_1.Types.ObjectId(companyId),
                action,
                actionCategory: 'user_action',
                actionType: 'create',
                resource: resourceType,
                resourceType,
                resourceId: resourceId,
                eventTimestamp: new Date(),
                eventId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                eventSource: 'web_app',
                eventSeverity: 'info',
                oldData: details?.oldData,
                newData: details?.newData
            };
            return await this.createAuditLog(auditData, userId);
        }
        catch (error) {
            logger_1.logger.error('Error logging user action', { error, userId, action, resourceType });
            throw error;
        }
    }
    async logSystemEvent(companyId, action, resourceType, resourceId, details, severity = 'medium') {
        try {
            const auditData = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                action,
                actionCategory: 'system_event',
                actionType: 'create',
                resource: resourceType,
                resourceType,
                resourceId: resourceId,
                eventTimestamp: new Date(),
                eventId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                eventSource: 'system',
                eventSeverity: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info',
                oldData: details?.oldData,
                newData: details?.newData
            };
            return await this.createAuditLog(auditData);
        }
        catch (error) {
            logger_1.logger.error('Error logging system event', { error, companyId, action, resourceType });
            throw error;
        }
    }
    async getAuditLogsByUser(userId, companyId, options = {}) {
        try {
            let query = {
                userId: new mongoose_1.Types.ObjectId(userId),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.action) {
                query.action = options.action;
            }
            if (options.resourceType) {
                query.resourceType = options.resourceType;
            }
            if (options.dateRange) {
                query.timestamp = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { timestamp: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting audit logs by user', { error, userId, companyId, options });
            throw error;
        }
    }
    async getAuditLogsByResource(resourceType, resourceId, companyId, options = {}) {
        try {
            const query = {
                resourceType,
                resourceId: new mongoose_1.Types.ObjectId(resourceId),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            return await this.findMany(query, {
                sort: { timestamp: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting audit logs by resource', { error, resourceType, resourceId, companyId });
            throw error;
        }
    }
    async getAuditLogsByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.action) {
                query.action = options.action;
            }
            if (options.resourceType) {
                query.resourceType = options.resourceType;
            }
            if (options.severity) {
                query.severity = options.severity;
            }
            if (options.dateRange) {
                query.timestamp = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            if (options.search) {
                query.$or = [
                    { action: { $regex: options.search, $options: 'i' } },
                    { resourceType: { $regex: options.search, $options: 'i' } },
                    { 'details.description': { $regex: options.search, $options: 'i' } }
                ];
            }
            return await this.findMany(query, {
                sort: { timestamp: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting audit logs by company', { error, companyId, options });
            throw error;
        }
    }
    async getAuditStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.timestamp = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalLogs, logsByAction, logsByResourceType, logsBySeverity, topUsers] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$action', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$resourceType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$severity', count: { $sum: 1 } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, userId: { $exists: true } } },
                    { $group: { _id: '$userId', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ])
            ]);
            return {
                totalLogs,
                logsByAction,
                logsByResourceType,
                logsBySeverity,
                topUsers
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting audit statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async cleanOldLogs(companyId, retentionDays = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const result = await this.model.deleteMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                timestamp: { $lt: cutoffDate }
            });
            logger_1.logger.info('Old audit logs cleaned', {
                companyId,
                retentionDays,
                deletedCount: result.deletedCount
            });
            return result.deletedCount || 0;
        }
        catch (error) {
            logger_1.logger.error('Error cleaning old audit logs', { error, companyId, retentionDays });
            throw error;
        }
    }
    validateAuditData(auditData) {
        if (!auditData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!auditData.action) {
            throw new errors_1.AppError('Action is required', 400);
        }
        if (!auditData.resourceType) {
            throw new errors_1.AppError('Resource type is required', 400);
        }
    }
}
exports.AuditLogService = AuditLogService;
//# sourceMappingURL=AuditLogService.js.map