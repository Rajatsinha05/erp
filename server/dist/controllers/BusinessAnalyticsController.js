"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAnalyticsController = void 0;
const BaseController_1 = require("./BaseController");
const BusinessAnalyticsService_1 = require("../services/BusinessAnalyticsService");
class BusinessAnalyticsController extends BaseController_1.BaseController {
    businessAnalyticsService;
    constructor() {
        const businessAnalyticsService = new BusinessAnalyticsService_1.BusinessAnalyticsService();
        super(businessAnalyticsService, 'BusinessAnalytics');
        this.businessAnalyticsService = businessAnalyticsService;
    }
    async createAnalytics(req, res) {
        try {
            const analyticsData = req.body;
            const createdBy = req.user?.id;
            const analytics = await this.businessAnalyticsService.createAnalytics(analyticsData, createdBy);
            this.sendSuccess(res, analytics, 'Business analytics created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create business analytics');
        }
    }
    async getAnalyticsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, reportType, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (reportType) {
                options.reportType = reportType;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const analytics = await this.businessAnalyticsService.getAnalyticsByCompany(companyId.toString(), options);
            this.sendSuccess(res, analytics, 'Business analytics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get business analytics');
        }
    }
    async generateSalesAnalytics(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!startDate || !endDate) {
                this.sendError(res, new Error('Start date and end date are required'), 'Date range is required', 400);
                return;
            }
            const dateRange = {
                start: new Date(startDate),
                end: new Date(endDate)
            };
            const salesAnalytics = await this.businessAnalyticsService.generateSalesAnalytics(companyId.toString(), dateRange);
            this.sendSuccess(res, salesAnalytics, 'Sales analytics generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate sales analytics');
        }
    }
    async generateInventoryAnalytics(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const inventoryAnalytics = await this.businessAnalyticsService.generateInventoryAnalytics(companyId.toString());
            this.sendSuccess(res, inventoryAnalytics, 'Inventory analytics generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate inventory analytics');
        }
    }
    async getAnalyticsById(req, res) {
        try {
            const { id } = req.params;
            const analytics = await this.businessAnalyticsService.findById(id);
            if (!analytics) {
                this.sendError(res, new Error('Analytics not found'), 'Analytics not found', 404);
                return;
            }
            this.sendSuccess(res, analytics, 'Analytics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get analytics');
        }
    }
}
exports.BusinessAnalyticsController = BusinessAnalyticsController;
//# sourceMappingURL=BusinessAnalyticsController.js.map