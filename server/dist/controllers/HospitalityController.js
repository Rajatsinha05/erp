"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalityController = void 0;
const BaseController_1 = require("./BaseController");
const HospitalityService_1 = require("../services/HospitalityService");
class HospitalityController extends BaseController_1.BaseController {
    hospitalityService;
    constructor() {
        const hospitalityService = new HospitalityService_1.HospitalityService();
        super(hospitalityService, 'Hospitality');
        this.hospitalityService = hospitalityService;
    }
    async createHospitalityEntry(req, res) {
        try {
            const hospitalityData = req.body;
            const createdBy = req.user?.id;
            const hospitality = await this.hospitalityService.createHospitalityFacility(hospitalityData, createdBy);
            this.sendSuccess(res, hospitality, 'Hospitality entry created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create hospitality entry');
        }
    }
    async getHospitalityByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, guestName, visitPurpose, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (guestName) {
                options.guestName = guestName;
            }
            if (visitPurpose) {
                options.visitPurpose = visitPurpose;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const hospitality = await this.hospitalityService.getHospitalityByCompany(companyId.toString(), options);
            this.sendSuccess(res, hospitality, 'Hospitality entries retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get hospitality entries');
        }
    }
    async getHospitalityStats(req, res) {
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
            const stats = await this.hospitalityService.getHospitalityStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Hospitality statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get hospitality statistics');
        }
    }
    async getMonthlyReport(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { year, month } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!year || !month) {
                this.sendError(res, new Error('Year and month are required'), 'Year and month are required', 400);
                return;
            }
            const report = await this.hospitalityService.getMonthlyReport(companyId.toString(), parseInt(year), parseInt(month));
            this.sendSuccess(res, report, 'Monthly hospitality report retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get monthly hospitality report');
        }
    }
    async getHospitalityById(req, res) {
        try {
            const { id } = req.params;
            const hospitality = await this.hospitalityService.findById(id);
            if (!hospitality) {
                this.sendError(res, new Error('Hospitality entry not found'), 'Hospitality entry not found', 404);
                return;
            }
            this.sendSuccess(res, hospitality, 'Hospitality entry retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get hospitality entry');
        }
    }
    async updateHospitality(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const hospitality = await this.hospitalityService.update(id, updateData, updatedBy);
            if (!hospitality) {
                this.sendError(res, new Error('Hospitality entry not found'), 'Hospitality entry not found', 404);
                return;
            }
            this.sendSuccess(res, hospitality, 'Hospitality entry updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update hospitality entry');
        }
    }
}
exports.HospitalityController = HospitalityController;
//# sourceMappingURL=HospitalityController.js.map