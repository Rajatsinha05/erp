"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Visitor_1 = __importDefault(require("@/models/Visitor"));
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const VisitorController_1 = require("@/controllers/VisitorController");
const upload_1 = require("@/middleware/upload");
const router = (0, express_1.Router)();
const visitorController = new VisitorController_1.VisitorController();
const validateVisitor = [
    (0, express_validator_1.body)('personalInfo.firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('contactInfo.primaryPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('visitInfo.visitType').isIn(['business', 'interview', 'meeting', 'delivery', 'maintenance', 'audit', 'training', 'personal', 'official', 'other']).withMessage('Valid visit type is required'),
    (0, express_validator_1.body)('visitInfo.visitPurpose').notEmpty().withMessage('Visit purpose is required'),
    (0, express_validator_1.body)('hostInfo.hostId').isMongoId().withMessage('Valid host ID is required'),
    (0, express_validator_1.body)('hostInfo.hostName').notEmpty().withMessage('Host name is required'),
    (0, express_validator_1.body)('hostInfo.hostDepartment').notEmpty().withMessage('Host department is required'),
    (0, express_validator_1.body)('hostInfo.meetingLocation').notEmpty().withMessage('Meeting location is required')
];
const validateVisitorEntry = [
    (0, express_validator_1.body)('entryGate').notEmpty().withMessage('Entry gate is required'),
    (0, express_validator_1.body)('securityGuardId').isMongoId().withMessage('Valid security guard ID is required'),
    (0, express_validator_1.body)('securityGuardName').notEmpty().withMessage('Security guard name is required'),
    (0, express_validator_1.body)('temperatureCheck').optional().isFloat({ min: 90, max: 110 }).withMessage('Temperature must be between 90-110°F'),
    (0, express_validator_1.body)('healthDeclaration').isBoolean().withMessage('Health declaration is required')
];
const validateVisitorExit = [
    (0, express_validator_1.body)('exitGate').notEmpty().withMessage('Exit gate is required'),
    (0, express_validator_1.body)('securityGuardId').isMongoId().withMessage('Valid security guard ID is required'),
    (0, express_validator_1.body)('securityGuardName').notEmpty().withMessage('Security guard name is required'),
    (0, express_validator_1.body)('belongingsReturned').isBoolean().withMessage('Belongings returned status is required')
];
router.get('/', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), async (req, res) => {
    try {
        const { companyId } = req.user;
        const { page = 1, limit = 20, status, visitType, hostId, startDate, endDate, search } = req.query;
        const query = { companyId, isActive: true };
        if (status)
            query.currentStatus = status;
        if (visitType)
            query['visitInfo.visitType'] = visitType;
        if (hostId)
            query['hostInfo.hostId'] = hostId;
        if (startDate || endDate) {
            query['visitInfo.scheduledDateTime'] = {};
            if (startDate)
                query['visitInfo.scheduledDateTime'].$gte = new Date(startDate);
            if (endDate)
                query['visitInfo.scheduledDateTime'].$lte = new Date(endDate);
        }
        if (search) {
            query.$text = { $search: search };
        }
        const visitors = await Visitor_1.default.find(query)
            .populate('hostInfo.hostId', 'personalInfo.firstName personalInfo.lastName')
            .populate('createdBy', 'personalInfo.firstName personalInfo.lastName')
            .sort({ 'visitInfo.scheduledDateTime': -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Visitor_1.default.countDocuments(query);
        logger_1.apiLogger.response(req, res, {
            visitorsCount: visitors.length,
            totalVisitors: total
        });
        res.json({
            success: true,
            data: visitors,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visitors',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), (0, express_validator_1.param)('id').isMongoId().withMessage('Valid visitor ID is required'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { companyId } = req.user;
        const visitor = await Visitor_1.default.findOne({
            _id: req.params.id,
            companyId,
            isActive: true
        })
            .populate('hostInfo.hostId', 'personalInfo.firstName personalInfo.lastName email phone')
            .populate('createdBy', 'personalInfo.firstName personalInfo.lastName')
            .populate('entries.securityGuardId', 'personalInfo.firstName personalInfo.lastName')
            .populate('exits.securityGuardId', 'personalInfo.firstName personalInfo.lastName');
        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }
        res.json({
            success: true,
            data: visitor
        });
    }
    catch (error) {
        console.error('Error fetching visitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visitor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), validateVisitor, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { companyId, userId } = req.user;
        const visitorCount = await Visitor_1.default.countDocuments({ companyId });
        const visitorNumber = `VIS${new Date().getFullYear()}${String(visitorCount + 1).padStart(4, '0')}`;
        const visitorId = `${companyId}_${visitorNumber}`;
        const visitor = new Visitor_1.default({
            ...req.body,
            companyId,
            visitorId,
            visitorNumber,
            createdBy: userId
        });
        await visitor.save();
        logger_1.businessLogger.userAction(userId.toString(), 'create_visitor', 'visitor', { visitorId: visitor._id, visitorNumber });
        res.status(201).json({
            success: true,
            message: 'Visitor created successfully',
            data: visitor
        });
    }
    catch (error) {
        console.error('Error creating visitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create visitor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), (0, express_validator_1.param)('id').isMongoId().withMessage('Valid visitor ID is required'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { companyId, userId } = req.user;
        const visitor = await Visitor_1.default.findOneAndUpdate({ _id: req.params.id, companyId, isActive: true }, { ...req.body, lastModifiedBy: userId }, { new: true, runValidators: true });
        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }
        logger_1.businessLogger.userAction(userId.toString(), 'update_visitor', 'visitor', { visitorId: visitor._id, visitorNumber: visitor.visitorNumber });
        res.json({
            success: true,
            message: 'Visitor updated successfully',
            data: visitor
        });
    }
    catch (error) {
        console.error('Error updating visitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update visitor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/:id/checkin', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'gateManagement'), (0, express_validator_1.param)('id').isMongoId().withMessage('Valid visitor ID is required'), validateVisitorEntry, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { companyId, userId } = req.user;
        const visitor = await Visitor_1.default.findOne({
            _id: req.params.id,
            companyId,
            isActive: true
        });
        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }
        if (visitor.overallApprovalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Visitor is not approved for entry'
            });
        }
        if (visitor.isCurrentlyInside()) {
            return res.status(400).json({
                success: false,
                message: 'Visitor is already checked in'
            });
        }
        visitor.entries.push({
            ...req.body,
            entryDateTime: new Date()
        });
        visitor.currentStatus = 'checked_in';
        visitor.lastModifiedBy = userId;
        await visitor.save();
        logger_1.businessLogger.userAction(userId.toString(), 'visitor_checkin', 'visitor', {
            visitorId: visitor._id,
            visitorName: visitor.personalInfo.fullName,
            entryGate: req.body.entryGate
        });
        res.json({
            success: true,
            message: 'Visitor checked in successfully',
            data: visitor
        });
    }
    catch (error) {
        console.error('Error checking in visitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check in visitor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/:id/checkout', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'gateManagement'), (0, express_validator_1.param)('id').isMongoId().withMessage('Valid visitor ID is required'), validateVisitorExit, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { companyId, userId } = req.user;
        const visitor = await Visitor_1.default.findOne({
            _id: req.params.id,
            companyId,
            isActive: true
        });
        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }
        if (!visitor.isCurrentlyInside()) {
            return res.status(400).json({
                success: false,
                message: 'Visitor is not currently inside'
            });
        }
        const lastEntry = visitor.getLastEntry();
        const exitDateTime = new Date();
        const totalDuration = lastEntry ?
            Math.floor((exitDateTime.getTime() - lastEntry.entryDateTime.getTime()) / (1000 * 60)) : 0;
        visitor.exits.push({
            ...req.body,
            exitDateTime,
            totalDuration
        });
        visitor.currentStatus = 'checked_out';
        visitor.lastModifiedBy = userId;
        await visitor.save();
        logger_1.businessLogger.userAction(userId.toString(), 'visitor_checkout', 'visitor', {
            visitorId: visitor._id,
            visitorName: visitor.personalInfo.fullName,
            exitGate: req.body.exitGate,
            duration: totalDuration
        });
        res.json({
            success: true,
            message: 'Visitor checked out successfully',
            data: visitor
        });
    }
    catch (error) {
        console.error('Error checking out visitor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check out visitor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/reports/currently-inside', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'securityReports'), async (req, res) => {
    try {
        const { companyId } = req.user;
        const visitors = await Visitor_1.default.findCurrentlyInside(companyId.toString())
            .populate('hostInfo.hostId', 'personalInfo.firstName personalInfo.lastName')
            .select('personalInfo visitInfo hostInfo entries currentStatus');
        res.json({
            success: true,
            data: visitors,
            count: visitors.length
        });
    }
    catch (error) {
        console.error('Error fetching visitors inside:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visitors currently inside',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/reports/scheduled-today', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'visitorManagement'), async (req, res) => {
    try {
        const { companyId } = req.user;
        const visitors = await Visitor_1.default.findScheduledToday(companyId.toString())
            .populate('hostInfo.hostId', 'personalInfo.firstName personalInfo.lastName')
            .select('personalInfo visitInfo hostInfo currentStatus overallApprovalStatus');
        res.json({
            success: true,
            data: visitors,
            count: visitors.length
        });
    }
    catch (error) {
        console.error('Error fetching scheduled visitors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scheduled visitors',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/reports/overstaying', auth_1.authenticate, (0, auth_1.requirePermission)('security', 'securityReports'), async (req, res) => {
    try {
        const { companyId } = req.user;
        const visitors = await Visitor_1.default.findOverstaying(companyId.toString());
        res.json({
            success: true,
            data: visitors,
            count: visitors.length
        });
    }
    catch (error) {
        console.error('Error fetching overstaying visitors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overstaying visitors',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/with-files', auth_1.authenticate, (0, auth_1.requirePermission)('visitors', 'create'), upload_1.uploadVisitorFiles, upload_1.validateUploadedFiles, visitorController.create.bind(visitorController));
router.post('/:id/entry-photo', auth_1.authenticate, (0, auth_1.requirePermission)('visitors', 'update'), (0, upload_1.uploadSingle)('entryPhoto', 'visitors/entry'), upload_1.validateUploadedFiles, visitorController.uploadEntryPhoto.bind(visitorController));
router.post('/:id/exit-photo', auth_1.authenticate, (0, auth_1.requirePermission)('visitors', 'update'), (0, upload_1.uploadSingle)('exitPhoto', 'visitors/exit'), upload_1.validateUploadedFiles, visitorController.uploadExitPhoto.bind(visitorController));
router.post('/upload-url', auth_1.authenticate, (0, auth_1.requirePermission)('visitors', 'create'), visitorController.getUploadUrl.bind(visitorController));
router.get('/download/:key', auth_1.authenticate, (0, auth_1.requirePermission)('visitors', 'view'), visitorController.getDownloadUrl.bind(visitorController));
exports.default = router;
//# sourceMappingURL=visitors.js.map