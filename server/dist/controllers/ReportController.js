"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const BaseController_1 = require("./BaseController");
const ReportService_1 = require("../services/ReportService");
class ReportController extends BaseController_1.BaseController {
    reportService;
    constructor() {
        const reportService = new ReportService_1.ReportService();
        super(reportService, 'Report');
        this.reportService = reportService;
    }
    async createReport(req, res) {
        try {
            const reportData = req.body;
            const createdBy = req.user?.id;
            const report = await this.reportService.createReport(reportData, createdBy);
            this.sendSuccess(res, report, 'Report created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create report');
        }
    }
    async getReportsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, reportType, status, startDate, endDate } = req.query;
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
            if (status) {
                options.status = status;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const reports = await this.reportService.getReportsByCompany(companyId.toString(), options);
            this.sendSuccess(res, reports, 'Reports retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get reports');
        }
    }
    async generateSalesReport(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate, format = 'json' } = req.query;
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
            const salesReport = await this.reportService.generateSalesReport(companyId.toString(), dateRange, format);
            this.sendSuccess(res, salesReport, 'Sales report generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate sales report');
        }
    }
    async generateInventoryReport(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { format = 'json' } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const inventoryReport = await this.reportService.generateInventoryReport(companyId.toString(), format);
            this.sendSuccess(res, inventoryReport, 'Inventory report generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate inventory report');
        }
    }
    async generateProductionReport(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate, format = 'json' } = req.query;
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
            const productionReport = await this.reportService.generateProductionReport(companyId.toString(), dateRange, format);
            this.sendSuccess(res, productionReport, 'Production report generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate production report');
        }
    }
    async getReportStats(req, res) {
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
            const stats = await this.reportService.getReportStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Report statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get report statistics');
        }
    }
    async getReportById(req, res) {
        try {
            const { id } = req.params;
            const report = await this.reportService.findById(id);
            if (!report) {
                this.sendError(res, new Error('Report not found'), 'Report not found', 404);
                return;
            }
            this.sendSuccess(res, report, 'Report retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get report');
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=ReportController.js.map