"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserManagementController_1 = require("../controllers/UserManagementController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const createUserValidation = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('firstName')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters'),
    (0, express_validator_1.body)('lastName')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('companyId')
        .isMongoId()
        .withMessage('Please provide a valid company ID'),
    (0, express_validator_1.body)('role')
        .isIn(['super_admin', 'owner', 'manager', 'accountant', 'production_manager', 'sales_executive', 'security_guard', 'operator', 'helper'])
        .withMessage('Please provide a valid role'),
    (0, express_validator_1.body)('department')
        .optional()
        .isIn(['Management', 'Production', 'Sales', 'Accounts', 'Security', 'Quality', 'Warehouse'])
        .withMessage('Please provide a valid department'),
    (0, express_validator_1.body)('designation')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Designation must be less than 100 characters'),
    (0, express_validator_1.body)('employeeId')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Employee ID must be less than 50 characters')
];
const updateUserValidation = [
    (0, express_validator_1.param)('userId')
        .isMongoId()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be less than 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
];
const getUserValidation = [
    (0, express_validator_1.param)('userId')
        .isMongoId()
        .withMessage('Please provide a valid user ID')
];
const getUsersValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('search')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters'),
    (0, express_validator_1.query)('role')
        .optional()
        .isIn(['super_admin', 'owner', 'manager', 'accountant', 'production_manager', 'sales_executive', 'security_guard', 'operator', 'helper'])
        .withMessage('Please provide a valid role'),
    (0, express_validator_1.query)('companyId')
        .optional()
        .isMongoId()
        .withMessage('Please provide a valid company ID')
];
router.get('/', auth_1.authenticate, getUsersValidation, UserManagementController_1.UserManagementController.getAllUsers);
router.post('/', auth_1.authenticate, createUserValidation, UserManagementController_1.UserManagementController.createUser);
router.get('/:userId', auth_1.authenticate, getUserValidation, UserManagementController_1.UserManagementController.getUserById);
router.put('/:userId', auth_1.authenticate, updateUserValidation, UserManagementController_1.UserManagementController.updateUser);
router.delete('/:userId', auth_1.authenticate, getUserValidation, UserManagementController_1.UserManagementController.deleteUser);
exports.default = router;
//# sourceMappingURL=userManagement.js.map