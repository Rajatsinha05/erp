import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requirePermission } from '@/middleware/auth';
import { ControllerFactory } from '@/controllers';

const router = Router();
const companyController = ControllerFactory.getCompanyController();

// Validation middleware
const validateCompany = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('companyType').isIn(['private_limited', 'public_limited', 'partnership', 'sole_proprietorship', 'llp', 'government', 'ngo', 'other']).withMessage('Valid company type is required'),
  body('industry').optional().notEmpty().withMessage('Industry cannot be empty'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('address.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('address.country').optional().notEmpty().withMessage('Country cannot be empty')
];

const validateBranch = [
  body('branchName').notEmpty().withMessage('Branch name is required'),
  body('branchCode').notEmpty().withMessage('Branch code is required'),
  body('branchType').isIn(['head_office', 'branch', 'warehouse', 'factory', 'sales_office', 'service_center']).withMessage('Valid branch type is required'),
  body('address.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('contactInfo.phone').notEmpty().withMessage('Phone number is required')
];

const validateSettings = [
  body('timezone').optional().notEmpty().withMessage('Timezone cannot be empty'),
  body('currency').optional().notEmpty().withMessage('Currency cannot be empty'),
  body('dateFormat').optional().notEmpty().withMessage('Date format cannot be empty'),
  body('fiscalYearStart').optional().isISO8601().withMessage('Valid fiscal year start date is required')
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Valid company ID is required')
];

const validateCompanyCode = [
  param('code').notEmpty().withMessage('Company code is required')
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
 * @route   GET /api/v2/companies
 * @desc    Get all companies with pagination and filtering
 * @access  Private (Super Admin)
 */
router.get('/', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validatePagination,
  companyController.getAll.bind(companyController)
);

/**
 * @route   POST /api/v2/companies
 * @desc    Create a new company
 * @access  Private (Super Admin)
 */
router.post('/', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validateCompany,
  companyController.create.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/active
 * @desc    Get active companies
 * @access  Private
 */
router.get('/active',
  authenticate,
  validatePagination,
  companyController.getActiveCompanies.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/invoice-selection
 * @desc    Get companies for invoice selection with essential details
 * @access  Private
 */
router.get('/invoice-selection',
  authenticate,
  companyController.getCompaniesForInvoiceSelection.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/:id/invoice-details
 * @desc    Get company details for invoice auto-fill
 * @access  Private
 */
router.get('/:id/invoice-details',
  authenticate,
  validateMongoId,
  companyController.getCompanyInvoiceDetails.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/search
 * @desc    Search companies
 * @access  Private
 */
router.get('/search', 
  authenticate,
  validateSearch,
  companyController.search.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/code/:code
 * @desc    Get company by code
 * @access  Private
 */
router.get('/code/:code', 
  authenticate,
  validateCompanyCode,
  companyController.getByCode.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/:id
 * @desc    Get company by ID
 * @access  Private
 */
router.get('/:id', 
  authenticate,
  validateMongoId,
  companyController.getById.bind(companyController)
);

/**
 * @route   PUT /api/v2/companies/:id
 * @desc    Update company
 * @access  Private (Super Admin or Company Admin)
 */
router.put('/:id', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validateMongoId,
  validateCompany,
  companyController.update.bind(companyController)
);

/**
 * @route   DELETE /api/v2/companies/:id
 * @desc    Delete company (soft delete)
 * @access  Private (Super Admin)
 */
router.delete('/:id', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validateMongoId,
  companyController.delete.bind(companyController)
);

/**
 * @route   PUT /api/v2/companies/:id/settings
 * @desc    Update company settings
 * @access  Private (Company Admin)
 */
router.put('/:id/settings', 
  authenticate, 
  requirePermission('company', 'settings'),
  validateMongoId,
  validateSettings,
  companyController.updateSettings.bind(companyController)
);

/**
 * @route   POST /api/v2/companies/:id/branches
 * @desc    Add branch to company
 * @access  Private (Company Admin)
 */
router.post('/:id/branches', 
  authenticate, 
  requirePermission('company', 'branchManagement'),
  validateMongoId,
  validateBranch,
  companyController.addBranch.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/:id/stats
 * @desc    Get company statistics
 * @access  Private
 */
router.get('/:id/stats', 
  authenticate,
  validateMongoId,
  companyController.getCompanyStats.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/:id/dashboard
 * @desc    Get company dashboard data
 * @access  Private
 */
router.get('/:id/dashboard', 
  authenticate,
  validateMongoId,
  companyController.getDashboard.bind(companyController)
);

/**
 * @route   POST /api/v2/companies/:id/deactivate
 * @desc    Deactivate company
 * @access  Private (Super Admin)
 */
router.post('/:id/deactivate', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validateMongoId,
  companyController.deactivate.bind(companyController)
);

/**
 * @route   POST /api/v2/companies/:id/reactivate
 * @desc    Reactivate company
 * @access  Private (Super Admin)
 */
router.post('/:id/reactivate', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  validateMongoId,
  companyController.reactivate.bind(companyController)
);

/**
 * @route   GET /api/v2/companies/export
 * @desc    Export companies
 * @access  Private (Super Admin)
 */
router.get('/export', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  query('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'),
  companyController.export.bind(companyController)
);

/**
 * @route   POST /api/v2/companies/bulk
 * @desc    Bulk create companies
 * @access  Private (Super Admin)
 */
router.post('/bulk', 
  authenticate, 
  requirePermission('system', 'companyManagement'),
  body('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'),
  companyController.bulkCreate.bind(companyController)
);

export default router;
