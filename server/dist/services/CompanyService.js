"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("../utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
class CompanyService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Company);
    }
    async createCompany(companyData, userId) {
        try {
            this.validateCompanyData(companyData);
            const existingCompany = await this.findOne({
                companyCode: companyData.companyCode?.toUpperCase()
            });
            if (existingCompany) {
                throw new errors_1.AppError('Company code already exists', 400);
            }
            if (companyData.contactInfo?.emails && companyData.contactInfo.emails.length > 0) {
                const primaryEmail = companyData.contactInfo.emails.find(email => email.type === 'primary');
                if (primaryEmail) {
                    const existingEmail = await this.findOne({
                        'contactInfo.emails': { $elemMatch: { type: 'primary', label: primaryEmail.label } }
                    });
                    if (existingEmail) {
                        throw new errors_1.AppError('Company email already exists', 400);
                    }
                }
            }
            if (!companyData.companyCode) {
                companyData.companyCode = await this.generateCompanyCode(companyData.companyName);
            }
            const company = await this.create({
                ...companyData,
                companyCode: companyData.companyCode.toUpperCase(),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, userId);
            logger_1.logger.info('Company created successfully', {
                companyId: company._id,
                companyCode: company.companyCode,
                userId
            });
            return company;
        }
        catch (error) {
            logger_1.logger.error('Error creating company', { error, companyData, userId });
            throw error;
        }
    }
    async findByCode(companyCode) {
        try {
            return await this.findOne({
                companyCode: companyCode.toUpperCase(),
                isActive: true
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding company by code', { error, companyCode });
            throw error;
        }
    }
    async getActiveCompanies(page = 1, limit = 10) {
        try {
            return await this.paginate({ isActive: true }, page, limit, { companyName: 1 });
        }
        catch (error) {
            logger_1.logger.error('Error getting active companies', { error, page, limit });
            throw error;
        }
    }
    async updateSettings(companyId, settings, userId) {
        try {
            const company = await this.update(companyId, {
                $set: {
                    'settings': settings,
                    lastModifiedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined
                }
            }, userId);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            logger_1.logger.info('Company settings updated', { companyId, userId });
            return company;
        }
        catch (error) {
            logger_1.logger.error('Error updating company settings', { error, companyId, settings, userId });
            throw error;
        }
    }
    async addBranch(companyId, branchData, userId) {
        try {
            const company = await this.findById(companyId);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            throw new errors_1.AppError('Branch functionality not implemented', 501);
        }
        catch (error) {
            logger_1.logger.error('Error adding branch to company', { error, companyId, branchData, userId });
            throw error;
        }
    }
    async getCompanyStats(companyId) {
        try {
            const company = await this.findById(companyId, [
                'departments',
                'branches'
            ]);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            const stats = {
                companyCode: company.companyCode,
                companyName: company.companyName,
                legalName: company.legalName,
                gstin: company.registrationDetails.gstin,
                pan: company.registrationDetails.pan,
                currency: company.businessConfig.currency,
                timezone: company.businessConfig.timezone,
                totalBankAccounts: company.bankAccounts?.length || 0,
                activeBankAccounts: company.bankAccounts?.filter(acc => acc.isActive).length || 0,
                totalLicenses: company.licenses?.length || 0,
                isActive: company.isActive
            };
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error getting company stats', { error, companyId });
            throw error;
        }
    }
    async searchCompanies(searchTerm, page = 1, limit = 10) {
        try {
            const searchRegex = new RegExp(searchTerm, 'i');
            const filter = {
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { companyName: searchRegex },
                            { companyCode: searchRegex },
                            { 'contactInfo.email': searchRegex },
                            { industry: searchRegex }
                        ]
                    }
                ]
            };
            return await this.paginate(filter, page, limit, { companyName: 1 });
        }
        catch (error) {
            logger_1.logger.error('Error searching companies', { error, searchTerm, page, limit });
            throw error;
        }
    }
    async deactivateCompany(companyId, userId) {
        try {
            const result = await this.update(companyId, {
                isActive: false,
                deactivatedAt: new Date(),
                deactivatedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined
            }, userId);
            if (!result) {
                throw new errors_1.AppError('Company not found', 404);
            }
            logger_1.logger.info('Company deactivated', { companyId, userId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error deactivating company', { error, companyId, userId });
            throw error;
        }
    }
    async reactivateCompany(companyId, userId) {
        try {
            const result = await this.update(companyId, {
                isActive: true,
                reactivatedAt: new Date(),
                reactivatedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
                $unset: { deactivatedAt: 1, deactivatedBy: 1 }
            }, userId);
            if (!result) {
                throw new errors_1.AppError('Company not found', 404);
            }
            logger_1.logger.info('Company reactivated', { companyId, userId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error reactivating company', { error, companyId, userId });
            throw error;
        }
    }
    async generateCompanyCode(companyName) {
        try {
            const baseCode = companyName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 6);
            let code = baseCode;
            let counter = 1;
            while (await this.exists({ companyCode: code })) {
                code = `${baseCode}${counter.toString().padStart(2, '0')}`;
                counter++;
            }
            return code;
        }
        catch (error) {
            logger_1.logger.error('Error generating company code', { error, companyName });
            throw new errors_1.AppError('Failed to generate company code', 500);
        }
    }
    validateCompanyData(companyData) {
        if (!companyData.companyName) {
            throw new errors_1.AppError('Company name is required', 400);
        }
        if (!companyData.legalName) {
            throw new errors_1.AppError('Legal name is required', 400);
        }
        if (!companyData.registrationDetails?.gstin) {
            throw new errors_1.AppError('GSTIN is required', 400);
        }
        if (!companyData.registrationDetails?.pan) {
            throw new errors_1.AppError('PAN is required', 400);
        }
        if (!companyData.contactInfo?.emails || companyData.contactInfo.emails.length === 0) {
            throw new errors_1.AppError('At least one email is required', 400);
        }
        if (!companyData.contactInfo?.phones || companyData.contactInfo.phones.length === 0) {
            throw new errors_1.AppError('At least one phone number is required', 400);
        }
        const primaryEmail = companyData.contactInfo.emails.find(email => email.type === 'primary');
        if (primaryEmail && primaryEmail.label) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(primaryEmail.label)) {
                throw new errors_1.AppError('Invalid email format', 400);
            }
        }
    }
}
exports.CompanyService = CompanyService;
//# sourceMappingURL=CompanyService.js.map