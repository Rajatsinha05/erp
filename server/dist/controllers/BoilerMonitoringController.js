"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoilerMonitoringController = void 0;
const BaseController_1 = require("./BaseController");
const BoilerMonitoringService_1 = require("../services/BoilerMonitoringService");
class BoilerMonitoringController extends BaseController_1.BaseController {
    boilerMonitoringService;
    constructor() {
        const boilerMonitoringService = new BoilerMonitoringService_1.BoilerMonitoringService();
        super(boilerMonitoringService, 'BoilerMonitoring');
        this.boilerMonitoringService = boilerMonitoringService;
    }
    async createMonitoringEntry(req, res) {
        try {
            const monitoringData = req.body;
            const createdBy = req.user?.id;
            const monitoring = await this.boilerMonitoringService.createBoilerMonitoring(monitoringData, createdBy);
            this.sendSuccess(res, monitoring, 'Boiler monitoring entry created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create boiler monitoring entry');
        }
    }
    async getMonitoringByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, boilerId, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (boilerId) {
                options.boilerId = boilerId;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const monitoring = await this.boilerMonitoringService.getMonitoringByCompany(companyId.toString(), options);
            this.sendSuccess(res, monitoring, 'Boiler monitoring data retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get boiler monitoring data');
        }
    }
    async getTemperatureAlerts(req, res) {
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
            const alerts = await this.boilerMonitoringService.getBoilerAlerts(companyId.toString(), dateRange);
            this.sendSuccess(res, alerts, 'Temperature alerts retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get temperature alerts');
        }
    }
    async getBoilerStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { boilerId, startDate, endDate } = req.query;
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
            const stats = await this.boilerMonitoringService.getBoilerStats(companyId.toString(), boilerId, dateRange);
            this.sendSuccess(res, stats, 'Boiler statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get boiler statistics');
        }
    }
    async getMonitoringById(req, res) {
        try {
            const { id } = req.params;
            const monitoring = await this.boilerMonitoringService.findById(id);
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
exports.BoilerMonitoringController = BoilerMonitoringController;
//# sourceMappingURL=BoilerMonitoringController.js.map