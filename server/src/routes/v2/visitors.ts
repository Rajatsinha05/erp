import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requirePermission } from '@/middleware/auth';
import { ControllerFactory } from '@/controllers';

const router = Router();
const visitorController = ControllerFactory.getVisitorController();

// Validation middleware
const validateVisitor = [
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('contactInfo.primaryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('visitInfo.purpose').notEmpty().withMessage('Visit purpose is required'),
  body('visitInfo.scheduledArrivalTime').isISO8601().withMessage('Valid scheduled arrival time is required'),
  body('hostInfo.hostId').optional().isMongoId().withMessage('Valid host ID required'),
  body('hostInfo.hostName').optional().notEmpty().withMessage('Host name is required'),
  body('hostInfo.hostDepartment').optional().notEmpty().withMessage('Host department is required')
];

const validateCheckIn = [
  body('entryGate').optional().notEmpty().withMessage('Entry gate is required'),
  body('securityOfficer').optional().notEmpty().withMessage('Security officer is required'),
  body('vehicleNumber').optional().notEmpty().withMessage('Vehicle number is required'),
  body('accompaniedBy').optional().isInt({ min: 0 }).withMessage('Accompanied by must be a non-negative number'),
  body('itemsCarried').optional().isArray().withMessage('Items carried must be an array'),
  body('healthCheck.temperature').optional().isFloat({ min: 0 }).withMessage('Temperature must be a positive number'),
  body('healthCheck.symptoms').optional().isBoolean().withMessage('Symptoms must be a boolean'),
  body('healthCheck.contactHistory').optional().isBoolean().withMessage('Contact history must be a boolean')
];

const validateCheckOut = [
  body('exitGate').optional().notEmpty().withMessage('Exit gate is required'),
  body('securityOfficer').optional().notEmpty().withMessage('Security officer is required'),
  body('itemsReturned').optional().isArray().withMessage('Items returned must be an array'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().notEmpty().withMessage('Feedback cannot be empty')
];

const validateApproval = [
  body('approvalNotes').optional().notEmpty().withMessage('Approval notes cannot be empty'),
  body('conditions').optional().isArray().withMessage('Conditions must be an array')
];

const validateRejection = [
  body('rejectionReason').notEmpty().withMessage('Rejection reason is required'),
  body('rejectionNotes').optional().notEmpty().withMessage('Rejection notes cannot be empty')
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Valid visitor ID is required')
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
 * @route   GET /api/v2/visitors
 * @desc    Get all visitors with pagination and filtering
 * @access  Private
 */
router.get('/', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validatePagination,
  visitorController.getAll.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors
 * @desc    Create a new visitor
 * @access  Private
 */
router.post('/', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateVisitor,
  visitorController.create.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/search
 * @desc    Search visitors
 * @access  Private
 */
router.get('/search', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateSearch,
  visitorController.search.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/currently-inside
 * @desc    Get visitors currently inside
 * @access  Private
 */
router.get('/currently-inside', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getCurrentlyInside.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/scheduled-today
 * @desc    Get visitors scheduled for today
 * @access  Private
 */
router.get('/scheduled-today', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getScheduledToday.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/overstaying
 * @desc    Get overstaying visitors
 * @access  Private
 */
router.get('/overstaying', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getOverstaying.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/stats
 * @desc    Get visitor statistics
 * @access  Private
 */
router.get('/stats', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  visitorController.getStats.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/dashboard
 * @desc    Get visitor dashboard data
 * @access  Private
 */
router.get('/dashboard', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getDashboard.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/:id
 * @desc    Get visitor by ID
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateMongoId,
  visitorController.getById.bind(visitorController)
);

/**
 * @route   PUT /api/v2/visitors/:id
 * @desc    Update visitor
 * @access  Private
 */
router.put('/:id', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateMongoId,
  validateVisitor,
  visitorController.update.bind(visitorController)
);

/**
 * @route   DELETE /api/v2/visitors/:id
 * @desc    Delete visitor
 * @access  Private
 */
router.delete('/:id', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateMongoId,
  visitorController.delete.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors/:id/checkin
 * @desc    Check-in visitor
 * @access  Private
 */
router.post('/:id/checkin', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateMongoId,
  validateCheckIn,
  visitorController.checkIn.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors/:id/checkout
 * @desc    Check-out visitor
 * @access  Private
 */
router.post('/:id/checkout', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  validateMongoId,
  validateCheckOut,
  visitorController.checkOut.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors/:id/approve
 * @desc    Approve visitor
 * @access  Private
 */
router.post('/:id/approve', 
  authenticate, 
  requirePermission('security', 'visitorApproval'),
  validateMongoId,
  validateApproval,
  visitorController.approve.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors/:id/reject
 * @desc    Reject visitor
 * @access  Private
 */
router.post('/:id/reject', 
  authenticate, 
  requirePermission('security', 'visitorApproval'),
  validateMongoId,
  validateRejection,
  visitorController.reject.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors/export
 * @desc    Export visitors
 * @access  Private
 */
router.get('/export', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  query('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'),
  visitorController.export.bind(visitorController)
);

/**
 * @route   POST /api/v2/visitors/bulk
 * @desc    Bulk create visitors
 * @access  Private
 */
router.post('/bulk', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  body('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'),
  visitorController.bulkCreate.bind(visitorController)
);

export default router;
