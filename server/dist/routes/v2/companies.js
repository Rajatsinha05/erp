"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const controllers_1 = require("@/controllers");
const router = (0, express_1.Router)();
const companyController = controllers_1.ControllerFactory.getCompanyController();
const validateCompany = [
    (0, express_validator_1.body)('companyName').notEmpty().withMessage('Company name is required'),
    (0, express_validator_1.body)('companyType').isIn(['private_limited', 'public_limited', 'partnership', 'sole_proprietorship', 'llp', 'government', 'ngo', 'other']).withMessage('Valid company type is required'),
    (0, express_validator_1.body)('industry').optional().notEmpty().withMessage('Industry cannot be empty'),
    (0, express_validator_1.body)('contactInfo.email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('contactInfo.phone').notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('address.addressLine1').notEmpty().withMessage('Address line 1 is required'),
    (0, express_validator_1.body)('address.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('address.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('address.pincode').notEmpty().withMessage('Pincode is required'),
    (0, express_validator_1.body)('address.country').optional().notEmpty().withMessage('Country cannot be empty')
];
const validateBranch = [
    (0, express_validator_1.body)('branchName').notEmpty().withMessage('Branch name is required'),
    (0, express_validator_1.body)('branchCode').notEmpty().withMessage('Branch code is required'),
    (0, express_validator_1.body)('branchType').isIn(['head_office', 'branch', 'warehouse', 'factory', 'sales_office', 'service_center']).withMessage('Valid branch type is required'),
    (0, express_validator_1.body)('address.addressLine1').notEmpty().withMessage('Address line 1 is required'),
    (0, express_validator_1.body)('address.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('address.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('address.pincode').notEmpty().withMessage('Pincode is required'),
    (0, express_validator_1.body)('contactInfo.phone').notEmpty().withMessage('Phone number is required')
];
const validateSettings = [
    (0, express_validator_1.body)('timezone').optional().notEmpty().withMessage('Timezone cannot be empty'),
    (0, express_validator_1.body)('currency').optional().notEmpty().withMessage('Currency cannot be empty'),
    (0, express_validator_1.body)('dateFormat').optional().notEmpty().withMessage('Date format cannot be empty'),
    (0, express_validator_1.body)('fiscalYearStart').optional().isISO8601().withMessage('Valid fiscal year start date is required')
];
const validateMongoId = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid company ID is required')
];
const validateCompanyCode = [
    (0, express_validator_1.param)('code').notEmpty().withMessage('Company code is required')
];
const validateSearch = [
    (0, express_validator_1.query)('q').notEmpty().withMessage('Search term is required'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
const validatePagination = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
router.get('/', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validatePagination, companyController.getAll.bind(companyController));
router.post('/', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validateCompany, companyController.create.bind(companyController));
router.get('/active', auth_1.authenticate, validatePagination, companyController.getActiveCompanies.bind(companyController));
router.get('/invoice-selection', auth_1.authenticate, companyController.getCompaniesForInvoiceSelection.bind(companyController));
router.get('/:id/invoice-details', auth_1.authenticate, validateMongoId, companyController.getCompanyInvoiceDetails.bind(companyController));
router.get('/search', auth_1.authenticate, validateSearch, companyController.search.bind(companyController));
router.get('/code/:code', auth_1.authenticate, validateCompanyCode, companyController.getByCode.bind(companyController));
router.get('/:id', auth_1.authenticate, validateMongoId, companyController.getById.bind(companyController));
router.put('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validateMongoId, validateCompany, companyController.update.bind(companyController));
router.delete('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validateMongoId, companyController.delete.bind(companyController));
router.put('/:id/settings', auth_1.authenticate, (0, auth_1.requirePermission)('company', 'settings'), validateMongoId, validateSettings, companyController.updateSettings.bind(companyController));
router.post('/:id/branches', auth_1.authenticate, (0, auth_1.requirePermission)('company', 'branchManagement'), validateMongoId, validateBranch, companyController.addBranch.bind(companyController));
router.get('/:id/stats', auth_1.authenticate, validateMongoId, companyController.getCompanyStats.bind(companyController));
router.get('/:id/dashboard', auth_1.authenticate, validateMongoId, companyController.getDashboard.bind(companyController));
router.post('/:id/deactivate', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validateMongoId, companyController.deactivate.bind(companyController));
router.post('/:id/reactivate', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), validateMongoId, companyController.reactivate.bind(companyController));
router.get('/export', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), (0, express_validator_1.query)('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'), companyController.export.bind(companyController));
router.post('/bulk', auth_1.authenticate, (0, auth_1.requirePermission)('system', 'companyManagement'), (0, express_validator_1.body)('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'), companyController.bulkCreate.bind(companyController));
exports.default = router;
//# sourceMappingURL=companies.js.map