"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const BaseController_1 = require("./BaseController");
const CompanyService_1 = require("@/services/CompanyService");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
class CompanyController extends BaseController_1.BaseController {
    companyService;
    constructor() {
        const companyService = new CompanyService_1.CompanyService();
        super(companyService, 'Company');
        this.companyService = companyService;
    }
    async create(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const user = req.user;
            if (!user.isSuperAdmin) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
                return;
            }
            const { userId } = this.getUserInfo(req);
            const companyData = req.body;
            logger_1.logger.info('Creating company', { companyData, userId });
            const company = await this.companyService.createCompany(companyData, userId);
            this.sendSuccess(res, company, 'Company created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getByCode(req, res, next) {
        try {
            const { code } = req.params;
            logger_1.logger.info('Getting company by code', { code });
            const company = await this.companyService.findByCode(code);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            this.sendSuccess(res, company, 'Company retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveCompanies(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            logger_1.logger.info('Getting active companies', { page, limit });
            const result = await this.companyService.getActiveCompanies(page, limit);
            this.sendPaginatedResponse(res, result, 'Active companies retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async updateSettings(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const settings = req.body;
            logger_1.logger.info('Updating company settings', { id, settings, userId });
            const company = await this.companyService.updateSettings(id, settings, userId);
            this.sendSuccess(res, company, 'Company settings updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async addBranch(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const branchData = req.body;
            logger_1.logger.info('Adding branch to company', { id, branchData, userId });
            const company = await this.companyService.addBranch(id, branchData, userId);
            this.sendSuccess(res, company, 'Branch added successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getCompanyStats(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Getting company statistics', { id });
            const stats = await this.companyService.getCompanyStats(id);
            this.sendSuccess(res, stats, 'Company statistics retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!searchTerm) {
                throw new errors_1.AppError('Search term is required', 400);
            }
            logger_1.logger.info('Searching companies', { searchTerm, page, limit });
            const result = await this.companyService.searchCompanies(searchTerm, page, limit);
            this.sendPaginatedResponse(res, result, 'Company search results retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async deactivate(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            logger_1.logger.info('Deactivating company', { id, userId });
            const success = await this.companyService.deactivateCompany(id, userId);
            if (!success) {
                throw new errors_1.AppError('Company not found', 404);
            }
            this.sendSuccess(res, null, 'Company deactivated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async reactivate(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            logger_1.logger.info('Reactivating company', { id, userId });
            const success = await this.companyService.reactivateCompany(id, userId);
            if (!success) {
                throw new errors_1.AppError('Company not found', 404);
            }
            this.sendSuccess(res, null, 'Company reactivated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || { companyName: 1 };
            const populate = req.query.populate;
            const filter = this.buildCompanyFilter(req.query);
            logger_1.logger.info('Getting companies with filter', { page, limit, filter });
            const result = await this.companyService.paginate(filter, page, limit, sort, populate);
            this.sendPaginatedResponse(res, result, 'Companies retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    buildCompanyFilter(query) {
        const filter = this.buildFilterFromQuery(query);
        if (query.companyType) {
            filter.companyType = query.companyType;
        }
        if (query.industry) {
            filter.industry = new RegExp(query.industry, 'i');
        }
        if (query.country) {
            filter['address.country'] = query.country;
        }
        if (query.state) {
            filter['address.state'] = new RegExp(query.state, 'i');
        }
        if (query.city) {
            filter['address.city'] = new RegExp(query.city, 'i');
        }
        if (query.establishedFrom || query.establishedTo) {
            filter.establishedYear = {};
            if (query.establishedFrom) {
                filter.establishedYear.$gte = parseInt(query.establishedFrom);
            }
            if (query.establishedTo) {
                filter.establishedYear.$lte = parseInt(query.establishedTo);
            }
        }
        if (query.employeeCountMin || query.employeeCountMax) {
            filter.employeeCount = {};
            if (query.employeeCountMin) {
                filter.employeeCount.$gte = parseInt(query.employeeCountMin);
            }
            if (query.employeeCountMax) {
                filter.employeeCount.$lte = parseInt(query.employeeCountMax);
            }
        }
        return filter;
    }
    async getDashboard(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Getting company dashboard data', { id });
            const [company, stats] = await Promise.all([
                this.companyService.findById(id),
                this.companyService.getCompanyStats(id)
            ]);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            const dashboardData = {
                company,
                statistics: stats,
                lastUpdated: new Date().toISOString()
            };
            this.sendSuccess(res, dashboardData, 'Company dashboard data retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getCompaniesForInvoiceSelection(req, res, next) {
        try {
            logger_1.logger.info('Getting companies for invoice selection');
            const companies = await this.companyService.findMany({ isActive: true }, {
                sort: { companyName: 1 }
            });
            this.sendSuccess(res, companies, 'Companies for invoice selection retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getCompanyInvoiceDetails(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Getting company invoice details', { id });
            const company = await this.companyService.findById(id);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            const companyData = company.toObject();
            companyData.bankAccounts = companyData.bankAccounts?.filter((account) => account.isActive) || [];
            this.sendSuccess(res, companyData, 'Company invoice details retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    validateCompanyAccess(req, documentCompanyId) {
        const user = req.user;
        if (user?.isSuperAdmin) {
            return;
        }
        const userCompanyAccess = user?.companyAccess?.find((access) => access.companyId.toString() === documentCompanyId && access.isActive);
        if (!userCompanyAccess) {
            throw new errors_1.AppError('Access denied: Insufficient company permissions', 403);
        }
    }
}
exports.CompanyController = CompanyController;
//# sourceMappingURL=CompanyController.js.map