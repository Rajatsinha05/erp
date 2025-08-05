"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const BaseController_1 = require("./BaseController");
const AuditLogService_1 = require("../services/AuditLogService");
class AuditLogController extends BaseController_1.BaseController {
    auditLogService;
    constructor() {
        const auditLogService = new AuditLogService_1.AuditLogService();
        super(auditLogService, 'AuditLog');
        this.auditLogService = auditLogService;
    }
    async createAuditLog(req, res) {
        try {
            const auditData = req.body;
            const createdBy = req.user?.id;
            const auditLog = await this.auditLogService.createAuditLog(auditData, createdBy);
            this.sendSuccess(res, auditLog, 'Audit log created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create audit log');
        }
    }
    async logUserAction(req, res) {
        try {
            const { action, resourceType, resourceId, details } = req.body;
            const userId = req.user?.id;
            const companyId = req.user?.companyId;
            if (!userId || !companyId) {
                this.sendError(res, new Error('User ID and Company ID are required'), 'Authentication required', 401);
                return;
            }
            const auditLog = await this.auditLogService.logUserAction(userId.toString(), companyId.toString(), action, resourceType, resourceId, details);
            this.sendSuccess(res, auditLog, 'User action logged successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to log user action');
        }
    }
    async getAuditLogsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, action, resourceType, search, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (action) {
                options.action = action;
            }
            if (resourceType) {
                options.resourceType = resourceType;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const auditLogs = await this.auditLogService.getAuditLogsByCompany(companyId.toString(), options);
            this.sendSuccess(res, auditLogs, 'Audit logs retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get audit logs');
        }
    }
    async getAuditLogsByUser(req, res) {
        try {
            const { userId } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, action, resourceType } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                action: action,
                resourceType: resourceType
            };
            const auditLogs = await this.auditLogService.getAuditLogsByUser(userId, companyId.toString(), options);
            this.sendSuccess(res, auditLogs, 'User audit logs retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get user audit logs');
        }
    }
    async getAuditLogsByResource(req, res) {
        try {
            const { resourceType, resourceId } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const auditLogs = await this.auditLogService.getAuditLogsByResource(resourceType, resourceId, companyId.toString(), options);
            this.sendSuccess(res, auditLogs, 'Resource audit logs retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get resource audit logs');
        }
    }
    async getAuditStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            let dateRange;
            if (startDate && endDate) {
                dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const stats = await this.auditLogService.getAuditStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Audit statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get audit statistics');
        }
    }
    async getAuditLogById(req, res) {
        try {
            const { id } = req.params;
            const auditLog = await this.auditLogService.findById(id);
            if (!auditLog) {
                this.sendError(res, new Error('Audit log not found'), 'Audit log not found', 404);
                return;
            }
            this.sendSuccess(res, auditLog, 'Audit log retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get audit log');
        }
    }
    async searchAuditLogs(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { q: searchTerm, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!searchTerm) {
                this.sendError(res, new Error('Search term is required'), 'Search term is required', 400);
                return;
            }
            const auditLogs = await this.auditLogService.findMany({
                companyId,
                $or: [
                    { action: { $regex: searchTerm, $options: 'i' } },
                    { resourceType: { $regex: searchTerm, $options: 'i' } },
                    { userName: { $regex: searchTerm, $options: 'i' } }
                ]
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, auditLogs, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search audit logs');
        }
    }
}
exports.AuditLogController = AuditLogController;
//# sourceMappingURL=AuditLogController.js.map