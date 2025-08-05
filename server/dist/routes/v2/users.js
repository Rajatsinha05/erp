"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const controllers_1 = require("@/controllers");
const router = (0, express_1.Router)();
const userController = controllers_1.ControllerFactory.getUserController();
const validateUser = [
    (0, express_validator_1.body)('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('personalInfo.firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('personalInfo.gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    (0, express_validator_1.body)('contactInfo.primaryPhone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('workInfo.employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty'),
    (0, express_validator_1.body)('workInfo.department').optional().notEmpty().withMessage('Department cannot be empty'),
    (0, express_validator_1.body)('workInfo.designation').optional().notEmpty().withMessage('Designation cannot be empty')
];
const validateUserUpdate = [
    (0, express_validator_1.body)('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('personalInfo.firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('personalInfo.lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('personalInfo.gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    (0, express_validator_1.body)('contactInfo.primaryPhone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('contactInfo.email').optional().isEmail().withMessage('Valid email is required')
];
const validatePasswordChange = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];
const validatePasswordReset = [
    (0, express_validator_1.body)('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];
const validateCompanyAccess = [
    (0, express_validator_1.body)('companyId').isMongoId().withMessage('Valid company ID is required'),
    (0, express_validator_1.body)('role').notEmpty().withMessage('Role is required'),
    (0, express_validator_1.body)('permissions').optional().isObject().withMessage('Permissions must be an object')
];
const validateAccountLock = [
    (0, express_validator_1.body)('isLocked').isBoolean().withMessage('isLocked must be a boolean')
];
const validateMongoId = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid user ID is required')
];
const validateCompanyId = [
    (0, express_validator_1.param)('companyId').isMongoId().withMessage('Valid company ID is required')
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
router.get('/', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'view'), validatePagination, userController.getAll.bind(userController));
router.post('/', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'create'), validateUser, userController.create.bind(userController));
router.get('/profile', auth_1.authenticate, userController.getProfile.bind(userController));
router.put('/profile', auth_1.authenticate, validateUserUpdate, userController.updateProfile.bind(userController));
router.post('/change-password', auth_1.authenticate, validatePasswordChange, userController.changePassword.bind(userController));
router.get('/search', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'view'), validateSearch, userController.search.bind(userController));
router.get('/stats', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'view'), (0, express_validator_1.query)('companyId').optional().isMongoId().withMessage('Valid company ID is required'), userController.getUserStats.bind(userController));
router.get('/company/:companyId', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'view'), validateCompanyId, validatePagination, userController.getUsersByCompany.bind(userController));
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'view'), validateMongoId, userController.getById.bind(userController));
router.put('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'edit'), validateMongoId, validateUserUpdate, userController.update.bind(userController));
router.delete('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'delete'), validateMongoId, userController.delete.bind(userController));
router.post('/:id/reset-password', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'edit'), validateMongoId, validatePasswordReset, userController.resetPassword.bind(userController));
router.post('/:id/toggle-lock', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'edit'), validateMongoId, validateAccountLock, userController.toggleAccountLock.bind(userController));
router.post('/:id/company-access', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'edit'), validateMongoId, validateCompanyAccess, userController.addCompanyAccess.bind(userController));
router.delete('/:id/company-access/:companyId', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'edit'), validateMongoId, validateCompanyId, userController.removeCompanyAccess.bind(userController));
router.get('/export', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'export'), (0, express_validator_1.query)('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'), (0, express_validator_1.query)('companyId').optional().isMongoId().withMessage('Valid company ID is required'), userController.export.bind(userController));
router.post('/bulk', auth_1.authenticate, (0, auth_1.requirePermission)('users', 'create'), (0, express_validator_1.body)('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'), userController.bulkCreate.bind(userController));
exports.default = router;
//# sourceMappingURL=users.js.map