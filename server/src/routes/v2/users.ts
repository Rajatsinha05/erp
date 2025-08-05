import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requirePermission } from '@/middleware/auth';
import { ControllerFactory } from '@/controllers';

const router = Router();
const userController = ControllerFactory.getUserController();

// Validation middleware
const validateUser = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('contactInfo.primaryPhone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('workInfo.employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty'),
  body('workInfo.department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('workInfo.designation').optional().notEmpty().withMessage('Designation cannot be empty')
];

const validateUserUpdate = [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('personalInfo.firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('personalInfo.lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('contactInfo.primaryPhone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required')
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

const validatePasswordReset = [
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

const validateCompanyAccess = [
  body('companyId').isMongoId().withMessage('Valid company ID is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('permissions').optional().isObject().withMessage('Permissions must be an object')
];

const validateAccountLock = [
  body('isLocked').isBoolean().withMessage('isLocked must be a boolean')
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Valid user ID is required')
];

const validateCompanyId = [
  param('companyId').isMongoId().withMessage('Valid company ID is required')
];

const validateSearch = [
  query('q').notEmpty().withMessage('Search term is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Routes

/**
 * @route   GET /api/v2/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin)
 */
router.get('/', 
  authenticate, 
  requirePermission('users', 'view'),
  validatePagination,
  userController.getAll.bind(userController)
);

/**
 * @route   POST /api/v2/users
 * @desc    Create a new user
 * @access  Private (Admin)
 */
router.post('/', 
  authenticate, 
  requirePermission('users', 'create'),
  validateUser,
  userController.create.bind(userController)
);

/**
 * @route   GET /api/v2/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', 
  authenticate,
  userController.getProfile.bind(userController)
);

/**
 * @route   PUT /api/v2/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', 
  authenticate,
  validateUserUpdate,
  userController.updateProfile.bind(userController)
);

/**
 * @route   POST /api/v2/users/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.post('/change-password', 
  authenticate,
  validatePasswordChange,
  userController.changePassword.bind(userController)
);

/**
 * @route   GET /api/v2/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', 
  authenticate, 
  requirePermission('users', 'view'),
  validateSearch,
  userController.search.bind(userController)
);

/**
 * @route   GET /api/v2/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/stats', 
  authenticate, 
  requirePermission('users', 'view'),
  query('companyId').optional().isMongoId().withMessage('Valid company ID is required'),
  userController.getUserStats.bind(userController)
);

/**
 * @route   GET /api/v2/users/company/:companyId
 * @desc    Get users by company
 * @access  Private
 */
router.get('/company/:companyId', 
  authenticate, 
  requirePermission('users', 'view'),
  validateCompanyId,
  validatePagination,
  userController.getUsersByCompany.bind(userController)
);

/**
 * @route   GET /api/v2/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  requirePermission('users', 'view'),
  validateMongoId,
  userController.getById.bind(userController)
);

/**
 * @route   PUT /api/v2/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', 
  authenticate, 
  requirePermission('users', 'edit'),
  validateMongoId,
  validateUserUpdate,
  userController.update.bind(userController)
);

/**
 * @route   DELETE /api/v2/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', 
  authenticate, 
  requirePermission('users', 'delete'),
  validateMongoId,
  userController.delete.bind(userController)
);

/**
 * @route   POST /api/v2/users/:id/reset-password
 * @desc    Reset user password (admin function)
 * @access  Private (Admin)
 */
router.post('/:id/reset-password', 
  authenticate, 
  requirePermission('users', 'edit'),
  validateMongoId,
  validatePasswordReset,
  userController.resetPassword.bind(userController)
);

/**
 * @route   POST /api/v2/users/:id/toggle-lock
 * @desc    Lock/Unlock user account
 * @access  Private (Admin)
 */
router.post('/:id/toggle-lock', 
  authenticate, 
  requirePermission('users', 'edit'),
  validateMongoId,
  validateAccountLock,
  userController.toggleAccountLock.bind(userController)
);

/**
 * @route   POST /api/v2/users/:id/company-access
 * @desc    Add company access to user
 * @access  Private (Admin)
 */
router.post('/:id/company-access', 
  authenticate, 
  requirePermission('users', 'edit'),
  validateMongoId,
  validateCompanyAccess,
  userController.addCompanyAccess.bind(userController)
);

/**
 * @route   DELETE /api/v2/users/:id/company-access/:companyId
 * @desc    Remove company access from user
 * @access  Private (Admin)
 */
router.delete('/:id/company-access/:companyId', 
  authenticate, 
  requirePermission('users', 'edit'),
  validateMongoId,
  validateCompanyId,
  userController.removeCompanyAccess.bind(userController)
);

/**
 * @route   GET /api/v2/users/export
 * @desc    Export users
 * @access  Private (Admin)
 */
router.get('/export', 
  authenticate, 
  requirePermission('users', 'export'),
  query('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'),
  query('companyId').optional().isMongoId().withMessage('Valid company ID is required'),
  userController.export.bind(userController)
);

/**
 * @route   POST /api/v2/users/bulk
 * @desc    Bulk create users
 * @access  Private (Admin)
 */
router.post('/bulk', 
  authenticate, 
  requirePermission('users', 'create'),
  body('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'),
  userController.bulkCreate.bind(userController)
);

export default router;
