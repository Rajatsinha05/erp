"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Company_1 = __importDefault(require("@/models/Company"));
const User_1 = __importDefault(require("@/models/User"));
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.get('/companies', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const companies = await Company_1.default.find({}).lean();
        const companiesWithUserCount = await Promise.all(companies.map(async (company) => {
            const userCount = await User_1.default.countDocuments({
                'companyAccess.companyId': company._id
            });
            return {
                ...company,
                userCount
            };
        }));
        res.json({
            success: true,
            data: companiesWithUserCount
        });
    }
    catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get companies'
        });
    }
});
router.post('/companies', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { companyName, companyCode, legalName, registrationNumber, taxId, email, phone, website, address, isActive } = req.body;
        if (!companyName || !companyCode) {
            return res.status(400).json({
                success: false,
                message: 'Company name and code are required'
            });
        }
        const existingCompany = await Company_1.default.findOne({ companyCode });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this code already exists'
            });
        }
        const newCompany = new Company_1.default({
            companyCode: companyCode.toUpperCase(),
            companyName,
            legalName: legalName || companyName,
            registrationDetails: {
                gstin: taxId || '',
                pan: registrationNumber || '',
                registrationDate: new Date()
            },
            addresses: {
                registeredOffice: {
                    street: address?.street || '',
                    area: address?.area || '',
                    city: address?.city || '',
                    state: address?.state || '',
                    pincode: address?.postalCode || '',
                    country: address?.country || 'India'
                },
                factoryAddress: {
                    street: address?.street || '',
                    area: address?.area || '',
                    city: address?.city || '',
                    state: address?.state || '',
                    pincode: address?.postalCode || '',
                    country: address?.country || 'India'
                },
                warehouseAddresses: []
            },
            contactInfo: {
                phones: phone ? [{ number: phone, type: 'primary', isPrimary: true }] : [],
                emails: email ? [{ email, type: 'primary', isPrimary: true }] : [],
                website,
                socialMedia: {}
            },
            bankAccounts: [],
            businessConfig: {
                currency: 'INR',
                timezone: 'Asia/Kolkata',
                fiscalYearStart: 4,
                gstEnabled: true,
                multiLocationEnabled: false
            },
            isActive: isActive !== undefined ? isActive : true,
            createdBy: currentUser?._id
        });
        await newCompany.save();
        (0, logger_1.logAudit)('Super admin created company', {
            adminId: currentUser?._id,
            targetCompanyId: newCompany._id,
            companyName: newCompany.companyName,
            companyCode: newCompany.companyCode,
            action: 'ADMIN_CREATE_COMPANY'
        });
        res.status(201).json({
            success: true,
            data: newCompany,
            message: 'Company created successfully'
        });
    }
    catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create company'
        });
    }
});
router.put('/companies/:companyId', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { companyId } = req.params;
        const { companyName, companyCode, legalName, registrationNumber, taxId, email, phone, website, address, isActive } = req.body;
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }
        if (companyCode && companyCode !== company.companyCode) {
            const existingCompany = await Company_1.default.findOne({
                companyCode: companyCode.toUpperCase(),
                _id: { $ne: companyId }
            });
            if (existingCompany) {
                return res.status(400).json({
                    success: false,
                    message: 'Company with this code already exists'
                });
            }
        }
        if (companyName)
            company.companyName = companyName;
        if (companyCode)
            company.companyCode = companyCode.toUpperCase();
        if (legalName !== undefined)
            company.legalName = legalName;
        if (registrationNumber !== undefined) {
            company.registrationDetails.pan = registrationNumber;
        }
        if (taxId !== undefined) {
            company.registrationDetails.gstin = taxId;
        }
        if (email !== undefined) {
            if (company.contactInfo.emails.length > 0) {
                company.contactInfo.emails[0].email = email;
            }
            else {
                company.contactInfo.emails.push({ email, type: 'primary', isPrimary: true });
            }
        }
        if (phone !== undefined) {
            if (company.contactInfo.phones.length > 0) {
                company.contactInfo.phones[0].number = phone;
            }
            else {
                company.contactInfo.phones.push({ number: phone, type: 'primary', isPrimary: true });
            }
        }
        if (website !== undefined) {
            company.contactInfo.website = website;
        }
        if (isActive !== undefined)
            company.isActive = isActive;
        if (address) {
            company.addresses.registeredOffice = {
                street: address.street || company.addresses?.registeredOffice?.street || '',
                area: address.area || company.addresses?.registeredOffice?.area || '',
                city: address.city || company.addresses?.registeredOffice?.city || '',
                state: address.state || company.addresses?.registeredOffice?.state || '',
                pincode: address.postalCode || company.addresses?.registeredOffice?.pincode || '',
                country: address.country || company.addresses?.registeredOffice?.country || 'India'
            };
        }
        company.updatedAt = new Date();
        await company.save();
        (0, logger_1.logAudit)('Super admin updated company', {
            adminId: currentUser?._id,
            targetCompanyId: companyId,
            companyName: company.companyName,
            companyCode: company.companyCode,
            action: 'ADMIN_UPDATE_COMPANY'
        });
        res.json({
            success: true,
            data: company,
            message: 'Company updated successfully'
        });
    }
    catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company'
        });
    }
});
router.delete('/companies/:companyId', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { companyId } = req.params;
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }
        const userCount = await User_1.default.countDocuments({
            'companyAccess.companyId': companyId
        });
        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete company with ${userCount} users. Please transfer or delete users first.`
            });
        }
        await Company_1.default.findByIdAndDelete(companyId);
        (0, logger_1.logAudit)('Super admin deleted company', {
            adminId: currentUser?._id,
            targetCompanyId: companyId,
            companyName: company.companyName,
            companyCode: company.companyCode,
            action: 'ADMIN_DELETE_COMPANY'
        });
        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete company'
        });
    }
});
router.get('/companies/:companyId/users', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }
        const users = await User_1.default.find({
            'companyAccess.companyId': companyId
        }, {
            password: 0,
            refreshTokens: 0
        }).lean();
        res.json({
            success: true,
            data: {
                company: {
                    _id: company._id,
                    companyName: company.companyName,
                    companyCode: company.companyCode
                },
                users,
                userCount: users.length
            }
        });
    }
    catch (error) {
        console.error('Get company users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get company users'
        });
    }
});
router.post('/companies/:companyId/toggle-status', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { companyId } = req.params;
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }
        company.isActive = !company.isActive;
        company.updatedAt = new Date();
        await company.save();
        (0, logger_1.logAudit)('Super admin toggled company status', {
            adminId: currentUser?._id,
            targetCompanyId: companyId,
            companyName: company.companyName,
            newStatus: company.isActive,
            action: 'ADMIN_TOGGLE_COMPANY_STATUS'
        });
        res.json({
            success: true,
            data: {
                isActive: company.isActive
            },
            message: `Company ${company.isActive ? 'activated' : 'deactivated'} successfully`
        });
    }
    catch (error) {
        console.error('Toggle company status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle company status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminCompanies.js.map