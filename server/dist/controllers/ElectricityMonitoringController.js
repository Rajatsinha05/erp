"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectricityMonitoringController = void 0;
const BaseController_1 = require("./BaseController");
const ElectricityMonitoringService_1 = require("../services/ElectricityMonitoringService");
class ElectricityMonitoringController extends BaseController_1.BaseController {
    electricityMonitoringService;
    constructor() {
        const electricityMonitoringService = new ElectricityMonitoringService_1.ElectricityMonitoringService();
        super(electricityMonitoringService, 'ElectricityMonitoring');
        this.electricityMonitoringService = electricityMonitoringService;
    }
    async createMonitoringEntry(req, res) {
        try {
            const monitoringData = req.body;
            const createdBy = req.user?.id;
            const monitoring = await this.electricityMonitoringService.createMonitoringSystem(monitoringData, createdBy);
            this.sendSuccess(res, monitoring, 'Electricity monitoring entry created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create electricity monitoring entry');
        }
    }
    async getMonitoringByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, meterNumber, sourceType, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (meterNumber) {
                options.meterNumber = meterNumber;
            }
            if (sourceType) {
                options.sourceType = sourceType;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const monitoring = await this.electricityMonitoringService.getMonitoringByCompany(companyId.toString(), options);
            this.sendSuccess(res, monitoring, 'Electricity monitoring data retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get electricity monitoring data');
        }
    }
    async getConsumptionStats(req, res) {
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
            const stats = await this.electricityMonitoringService.getConsumptionStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Consumption statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get consumption statistics');
        }
    }
    async getSolarVsPGVCLComparison(req, res) {
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
            const comparison = await this.electricityMonitoringService.getEnergySourceComparison(companyId.toString(), dateRange);
            this.sendSuccess(res, comparison, 'Solar vs PGVCL comparison retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get solar vs PGVCL comparison');
        }
    }
    async getMonitoringById(req, res) {
        try {
            const { id } = req.params;
            const monitoring = await this.electricityMonitoringService.findById(id);
            if (!monitoring) {
                this.sendError(res, new Error('Monitoring entry not found'), 'Monitoring entry not found', 404);
                return;
            }
            this.sendSuccess(res, monitoring, 'Monitoring entry retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get monitoring entry');
        }
    }
}
exports.ElectricityMonitoringController = ElectricityMonitoringController;
//# sourceMappingURL=ElectricityMonitoringController.js.map