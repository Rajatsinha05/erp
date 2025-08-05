import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requirePermission } from '@/middleware/auth';
import { VisitorControllerSimple } from '@/controllers/VisitorControllerSimple';

const router = Router();
const visitorController = new VisitorControllerSimple();

// Validation middleware
const validateVisitor = [
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('contactInfo.primaryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('visitInfo.visitPurpose').notEmpty().withMessage('Visit purpose is required'),
  body('visitInfo.scheduledDateTime').isISO8601().withMessage('Valid scheduled arrival time is required'),
  body('hostInfo.hostId').optional().isMongoId().withMessage('Valid host ID required'),
  body('hostInfo.hostName').optional().notEmpty().withMessage('Host name is required'),
  body('hostInfo.hostDepartment').optional().notEmpty().withMessage('Host department is required')
];

const validateCheckIn = [
  body('entryGate').optional().notEmpty().withMessage('Entry gate is required'),
  body('securityGuardName').optional().notEmpty().withMessage('Security guard name is required'),
  body('temperatureCheck').optional().isFloat({ min: 0 }).withMessage('Temperature must be a positive number'),
  body('belongingsList').optional().isArray().withMessage('Belongings list must be an array'),
  body('entryNotes').optional().notEmpty().withMessage('Entry notes cannot be empty')
];

const validateCheckOut = [
  body('exitGate').optional().notEmpty().withMessage('Exit gate is required'),
  body('securityGuardName').optional().notEmpty().withMessage('Security guard name is required'),
  body('exitNotes').optional().notEmpty().withMessage('Exit notes cannot be empty'),
  body('feedback.overallRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback.comments').optional().notEmpty().withMessage('Feedback comments cannot be empty')
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
 * @route   GET /api/v2/visitors-simple
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
 * @route   POST /api/v2/visitors-simple
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
 * @route   GET /api/v2/visitors-simple/search
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
 * @route   GET /api/v2/visitors-simple/currently-inside
 * @desc    Get visitors currently inside
 * @access  Private
 */
router.get('/currently-inside', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getCurrentlyInside.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors-simple/scheduled-today
 * @desc    Get visitors scheduled for today
 * @access  Private
 */
router.get('/scheduled-today', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getScheduledToday.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors-simple/dashboard
 * @desc    Get visitor dashboard data
 * @access  Private
 */
router.get('/dashboard', 
  authenticate, 
  requirePermission('security', 'visitorManagement'),
  visitorController.getDashboard.bind(visitorController)
);

/**
 * @route   GET /api/v2/visitors-simple/:id
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
 * @route   PUT /api/v2/visitors-simple/:id
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
 * @route   DELETE /api/v2/visitors-simple/:id
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
 * @route   POST /api/v2/visitors-simple/:id/checkin
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
 * @route   POST /api/v2/visitors-simple/:id/checkout
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

export default router;
