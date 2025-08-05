"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLogController = void 0;
const BaseController_1 = require("./BaseController");
const SecurityLogService_1 = require("../services/SecurityLogService");
class SecurityLogController extends BaseController_1.BaseController {
    securityLogService;
    constructor() {
        const securityLogService = new SecurityLogService_1.SecurityLogService();
        super(securityLogService, 'SecurityLog');
        this.securityLogService = securityLogService;
    }
    async createSecurityLog(req, res) {
        try {
            const securityData = req.body;
            const createdBy = req.user?.id;
            const securityLog = await this.securityLogService.createSecurityLog(securityData, createdBy);
            this.sendSuccess(res, securityLog, 'Security log created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create security log');
        }
    }
    async getSecurityLogsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, eventType, priority, search, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (eventType) {
                options.eventType = eventType;
            }
            if (priority) {
                options.priority = priority;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const securityLogs = await this.securityLogService.getSecurityLogsByCompany(companyId.toString(), options);
            this.sendSuccess(res, securityLogs, 'Security logs retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get security logs');
        }
    }
    async getSecurityStats(req, res) {
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
            const stats = await this.securityLogService.getSecurityStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Security statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get security statistics');
        }
    }
    async getSecurityLogById(req, res) {
        try {
            const { id } = req.params;
            const securityLog = await this.securityLogService.findById(id);
            if (!securityLog) {
                this.sendError(res, new Error('Security log not found'), 'Security log not found', 404);
                return;
            }
            this.sendSuccess(res, securityLog, 'Security log retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get security log');
        }
    }
    async updateSecurityLog(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const securityLog = await this.securityLogService.update(id, updateData, updatedBy);
            if (!securityLog) {
                this.sendError(res, new Error('Security log not found'), 'Security log not found', 404);
                return;
            }
            this.sendSuccess(res, securityLog, 'Security log updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update security log');
        }
    }
    async searchSecurityLogs(req, res) {
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
            const securityLogs = await this.securityLogService.findMany({
                companyId,
                $or: [
                    { eventType: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { 'location.name': { $regex: searchTerm, $options: 'i' } }
                ]
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, securityLogs, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search security logs');
        }
    }
}
exports.SecurityLogController = SecurityLogController;
//# sourceMappingURL=SecurityLogController.js.map