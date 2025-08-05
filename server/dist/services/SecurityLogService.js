"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLogService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const SecurityLog_1 = __importDefault(require("../models/SecurityLog"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class SecurityLogService extends BaseService_1.BaseService {
    constructor() {
        super(SecurityLog_1.default);
    }
    async createSecurityLog(securityData, createdBy) {
        try {
            this.validateSecurityData(securityData);
            const securityLog = await this.create({
                ...securityData,
                logId: `SEC-${Date.now()}`,
                logNumber: `SL-${Date.now()}`,
                eventDateTime: securityData.eventDateTime || new Date(),
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Security log created successfully', {
                logId: securityLog.logId,
                eventType: securityLog.eventType,
                priority: securityLog.priority,
                createdBy
            });
            return securityLog;
        }
        catch (error) {
            logger_1.logger.error('Error creating security log', { error, securityData, createdBy });
            throw error;
        }
    }
    async getSecurityLogsByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.eventType) {
                query.eventType = options.eventType;
            }
            if (options.priority) {
                query.priority = options.priority;
            }
            if (options.dateRange) {
                query.eventDateTime = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { eventDateTime: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting security logs by company', { error, companyId, options });
            throw error;
        }
    }
    async getSecurityStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.eventDateTime = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalLogs, logsByEventType, logsByPriority] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$eventType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$priority', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);
            return {
                totalLogs,
                logsByEventType,
                logsByPriority
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting security statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    validateSecurityData(securityData) {
        if (!securityData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!securityData.eventType) {
            throw new errors_1.AppError('Event type is required', 400);
        }
        if (!securityData.description) {
            throw new errors_1.AppError('Description is required', 400);
        }
    }
}
exports.SecurityLogService = SecurityLogService;
//# sourceMappingURL=SecurityLogService.js.map