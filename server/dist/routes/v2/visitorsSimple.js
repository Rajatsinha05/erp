"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const VisitorControllerSimple_1 = require("@/controllers/VisitorControllerSimple");
const router = (0, express_1.Router)();
const visitorController = new VisitorControllerSimple_1.VisitorControllerSimple();
const validateVisitor = [
    (0, express_validator_1.body)('personalInfo.firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('contactInfo.primaryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('visitInfo.visitPurpose').notEmpty().withMessage('Visit purpose is required'),
    (0, express_validator_1.body)('visitInfo.scheduledDateTime').isISO8601().withMessage('Valid scheduled arrival time is required'),
    (0, express_validator_1.body)('hostInfo.hostId').optional().isMongoId().withMessage('Valid host ID required'),
    (0, express_validator_1.body)('hostInfo.hostName').optional().notEmpty().withMessage('Host name is required'),
    (0, express_validator_1.body)('hostInfo.hostDepartment').optional().notEmpty().withMessage('Host department is required')
];
const validateCheckIn = [
    (0, express_validator_1.body)('entryGate').optional().notEmpty().withMessage('Entry gate is required'),
    (0, express_validator_1.body)('securityGuardName').optional().notEmpty().withMessage('Security guard name is required'),
    (0, express_validator_1.body)('temperatureCheck').optional().isFloat({ min: 0 }).withMessage('Temperature must be a positive number'),
    (0, express_validator_1.body)('belongingsList').optional().isArray().withMessage('Belongings list must be an array'),
    (0, express_validator_1.body)('entryNotes').optional().notEmpty().withMessage('Entry notes cannot be empty')
];
const validateCheckOut = [
    (0, express_validator_1.body)('exitGate').optional().notEmpty().withMessage('Exit gate is required'),
    (0, express_validator_1.body)('securityGuardName').optional().notEmpty().withMessage('Security guard name is required'),
    (0, express_validator_1.body)('exitNotes').optional().notEmpty().withMessage('Exit notes cannot be empty'),
    (0, express_validator_1.body)('feedback.overallRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('feedback.comments').optional().notEmpty().withMessage('Feedback comments cannot be empty')
];
const validateMongoId = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid visitor ID is required')
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
router.get('/', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validatePagination, visitorController.getAll.bind(visitorController));
router.post('/', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateVisitor, visitorController.create.bind(visitorController));
router.get('/search', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateSearch, visitorController.search.bind(visitorController));
router.get('/currently-inside', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), visitorController.getCurrentlyInside.bind(visitorController));
router.get('/scheduled-today', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), visitorController.getScheduledToday.bind(visitorController));
router.get('/dashboard', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), visitorController.getDashboard.bind(visitorController));
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, visitorController.getById.bind(visitorController));
router.put('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateVisitor, visitorController.update.bind(visitorController));
router.delete('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, visitorController.delete.bind(visitorController));
router.post('/:id/checkin', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateCheckIn, visitorController.checkIn.bind(visitorController));
router.post('/:id/checkout', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateCheckOut, visitorController.checkOut.bind(visitorController));
exports.default = router;
//# sourceMappingURL=visitorsSimple.js.map