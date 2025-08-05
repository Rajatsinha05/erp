"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const controllers_1 = require("@/controllers");
const router = (0, express_1.Router)();
const visitorController = controllers_1.ControllerFactory.getVisitorController();
const validateVisitor = [
    (0, express_validator_1.body)('personalInfo.firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('contactInfo.primaryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('visitInfo.purpose').notEmpty().withMessage('Visit purpose is required'),
    (0, express_validator_1.body)('visitInfo.scheduledArrivalTime').isISO8601().withMessage('Valid scheduled arrival time is required'),
    (0, express_validator_1.body)('hostInfo.hostId').optional().isMongoId().withMessage('Valid host ID required'),
    (0, express_validator_1.body)('hostInfo.hostName').optional().notEmpty().withMessage('Host name is required'),
    (0, express_validator_1.body)('hostInfo.hostDepartment').optional().notEmpty().withMessage('Host department is required')
];
const validateCheckIn = [
    (0, express_validator_1.body)('entryGate').optional().notEmpty().withMessage('Entry gate is required'),
    (0, express_validator_1.body)('securityOfficer').optional().notEmpty().withMessage('Security officer is required'),
    (0, express_validator_1.body)('vehicleNumber').optional().notEmpty().withMessage('Vehicle number is required'),
    (0, express_validator_1.body)('accompaniedBy').optional().isInt({ min: 0 }).withMessage('Accompanied by must be a non-negative number'),
    (0, express_validator_1.body)('itemsCarried').optional().isArray().withMessage('Items carried must be an array'),
    (0, express_validator_1.body)('healthCheck.temperature').optional().isFloat({ min: 0 }).withMessage('Temperature must be a positive number'),
    (0, express_validator_1.body)('healthCheck.symptoms').optional().isBoolean().withMessage('Symptoms must be a boolean'),
    (0, express_validator_1.body)('healthCheck.contactHistory').optional().isBoolean().withMessage('Contact history must be a boolean')
];
const validateCheckOut = [
    (0, express_validator_1.body)('exitGate').optional().notEmpty().withMessage('Exit gate is required'),
    (0, express_validator_1.body)('securityOfficer').optional().notEmpty().withMessage('Security officer is required'),
    (0, express_validator_1.body)('itemsReturned').optional().isArray().withMessage('Items returned must be an array'),
    (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('feedback').optional().notEmpty().withMessage('Feedback cannot be empty')
];
const validateApproval = [
    (0, express_validator_1.body)('approvalNotes').optional().notEmpty().withMessage('Approval notes cannot be empty'),
    (0, express_validator_1.body)('conditions').optional().isArray().withMessage('Conditions must be an array')
];
const validateRejection = [
    (0, express_validator_1.body)('rejectionReason').notEmpty().withMessage('Rejection reason is required'),
    (0, express_validator_1.body)('rejectionNotes').optional().notEmpty().withMessage('Rejection notes cannot be empty')
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
router.get('/overstaying', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), visitorController.getOverstaying.bind(visitorController));
router.get('/stats', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Valid start date is required'), (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Valid end date is required'), visitorController.getStats.bind(visitorController));
router.get('/dashboard', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), visitorController.getDashboard.bind(visitorController));
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, visitorController.getById.bind(visitorController));
router.put('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateVisitor, visitorController.update.bind(visitorController));
router.delete('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, visitorController.delete.bind(visitorController));
router.post('/:id/checkin', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateCheckIn, visitorController.checkIn.bind(visitorController));
router.post('/:id/checkout', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateMongoId, validateCheckOut, visitorController.checkOut.bind(visitorController));
router.post('/:id/approve', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorApproval'), validateMongoId, validateApproval, visitorController.approve.bind(visitorController));
router.post('/:id/reject', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorApproval'), validateMongoId, validateRejection, visitorController.reject.bind(visitorController));
router.get('/export', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), (0, express_validator_1.query)('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel'), visitorController.export.bind(visitorController));
router.post('/bulk', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), (0, express_validator_1.body)('documents').isArray({ min: 1 }).withMessage('Documents array is required and cannot be empty'), visitorController.bulkCreate.bind(visitorController));
exports.default = router;
//# sourceMappingURL=visitors.js.map