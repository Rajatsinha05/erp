"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorController = void 0;
const BaseController_1 = require("./BaseController");
const VisitorService_1 = require("@/services/VisitorService");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const S3Service_1 = __importDefault(require("@/services/S3Service"));
class VisitorController extends BaseController_1.BaseController {
    visitorService;
    constructor() {
        const visitorService = new VisitorService_1.VisitorService();
        super(visitorService, 'Visitor');
        this.visitorService = visitorService;
    }
    async create(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId, companyId } = this.getUserInfo(req);
            const visitorData = { ...req.body, companyId };
            const files = req.files;
            if (files) {
                if (files.entryPhoto && files.entryPhoto[0]) {
                    visitorData.entries = [{
                            ...visitorData.entries?.[0],
                            entryPhoto: files.entryPhoto[0].location
                        }];
                }
                if (files.documents && files.documents.length > 0) {
                    visitorData.documents = files.documents.map((file) => ({
                        documentType: 'other',
                        documentNumber: `DOC-${Date.now()}`,
                        documentUrl: file.location,
                        isVerified: false
                    }));
                }
                if (files.attachments && files.attachments.length > 0) {
                    visitorData.attachments = files.attachments.map((file) => file.location);
                }
            }
            logger_1.logger.info('Creating visitor with files', {
                visitorData: { ...visitorData, documents: visitorData.documents?.length || 0 },
                userId,
                companyId,
                filesUploaded: files ? Object.keys(files).length : 0
            });
            const visitor = await this.visitorService.createVisitor(visitorData, userId);
            this.sendSuccess(res, visitor, 'Visitor created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async checkIn(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const entryData = req.body;
            logger_1.logger.info('Checking in visitor', { visitorId: id, entryData, userId });
            const visitor = await this.visitorService.checkInVisitor(id, entryData, userId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            this.sendSuccess(res, visitor, 'Visitor checked in successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async checkOut(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const exitData = req.body;
            logger_1.logger.info('Checking out visitor', { visitorId: id, exitData, userId });
            const visitor = await this.visitorService.checkOutVisitor(id, exitData, userId);
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            this.sendSuccess(res, visitor, 'Visitor checked out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async approve(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const { approvalNotes, conditions } = req.body;
            logger_1.logger.info('Approving visitor', { visitorId: id, userId });
            const visitor = await this.visitorService.approveVisitor(id, {
                approvedBy: userId,
                approvalNotes,
                conditions
            });
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            this.sendSuccess(res, visitor, 'Visitor approved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async reject(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const { rejectionReason, rejectionNotes } = req.body;
            if (!rejectionReason) {
                throw new errors_1.AppError('Rejection reason is required', 400);
            }
            logger_1.logger.info('Rejecting visitor', { visitorId: id, rejectionReason, userId });
            const visitor = await this.visitorService.rejectVisitor(id, {
                rejectedBy: userId,
                rejectionReason,
                rejectionNotes
            });
            if (!visitor) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            this.sendSuccess(res, visitor, 'Visitor rejected successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentlyInside(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            logger_1.logger.info('Getting currently inside visitors', { companyId });
            const visitors = await this.visitorService.getCurrentlyInside(companyId);
            this.sendSuccess(res, visitors, 'Currently inside visitors retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getScheduledToday(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            logger_1.logger.info('Getting scheduled visitors for today', { companyId });
            const visitors = await this.visitorService.getScheduledToday(companyId);
            this.sendSuccess(res, visitors, 'Scheduled visitors for today retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getOverstaying(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            logger_1.logger.info('Getting overstaying visitors', { companyId });
            const visitors = await this.visitorService.getOverstayingVisitors(companyId);
            this.sendSuccess(res, visitors, 'Overstaying visitors retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getStats(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            const { startDate, endDate } = req.query;
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            logger_1.logger.info('Getting visitor statistics', { companyId, startDate: start, endDate: end });
            const stats = await this.visitorService.getVisitorStats(companyId, start, end);
            this.sendSuccess(res, stats, 'Visitor statistics retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            const { companyId } = this.getUserInfo(req);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!searchTerm) {
                throw new errors_1.AppError('Search term is required', 400);
            }
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            logger_1.logger.info('Searching visitors', { searchTerm, companyId, page, limit });
            const result = await this.visitorService.searchVisitors(companyId, searchTerm, page, limit);
            this.sendPaginatedResponse(res, result, 'Visitor search results retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || { createdAt: -1 };
            const populate = req.query.populate;
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const filter = {
                ...this.buildVisitorFilter(req.query),
                companyId
            };
            logger_1.logger.info('Getting visitors with filter', { page, limit, filter });
            const result = await this.visitorService.paginate(filter, page, limit, sort, populate);
            this.sendPaginatedResponse(res, result, 'Visitors retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const { companyId } = this.getUserInfo(req);
            if (!companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            logger_1.logger.info('Getting visitor dashboard data', { companyId });
            const [stats, currentlyInside, scheduledToday, overstaying] = await Promise.all([
                this.visitorService.getVisitorStats(companyId),
                this.visitorService.getCurrentlyInside(companyId),
                this.visitorService.getScheduledToday(companyId),
                this.visitorService.getOverstayingVisitors(companyId)
            ]);
            const dashboardData = {
                statistics: stats,
                currentlyInside: currentlyInside.slice(0, 10),
                scheduledToday: scheduledToday.slice(0, 10),
                overstaying: overstaying.slice(0, 10),
                lastUpdated: new Date().toISOString()
            };
            this.sendSuccess(res, dashboardData, 'Visitor dashboard data retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    buildVisitorFilter(query) {
        const filter = this.buildFilterFromQuery(query);
        if (query.visitorNumber) {
            filter.visitorNumber = new RegExp(query.visitorNumber, 'i');
        }
        if (query.firstName) {
            filter['personalInfo.firstName'] = new RegExp(query.firstName, 'i');
        }
        if (query.lastName) {
            filter['personalInfo.lastName'] = new RegExp(query.lastName, 'i');
        }
        if (query.phone) {
            filter['contactInfo.primaryPhone'] = new RegExp(query.phone, 'i');
        }
        if (query.email) {
            filter['contactInfo.email'] = new RegExp(query.email, 'i');
        }
        if (query.company) {
            filter['companyInfo.companyName'] = new RegExp(query.company, 'i');
        }
        if (query.purpose) {
            filter['visitInfo.purpose'] = new RegExp(query.purpose, 'i');
        }
        if (query.currentStatus) {
            filter.currentStatus = query.currentStatus;
        }
        if (query.approvalStatus) {
            filter.approvalStatus = query.approvalStatus;
        }
        if (query.hostId) {
            filter['hostInfo.hostId'] = query.hostId;
        }
        if (query.visitType) {
            filter['visitInfo.visitType'] = query.visitType;
        }
        if (query.scheduledFrom || query.scheduledTo) {
            filter['visitInfo.scheduledArrivalTime'] = {};
            if (query.scheduledFrom) {
                filter['visitInfo.scheduledArrivalTime'].$gte = new Date(query.scheduledFrom);
            }
            if (query.scheduledTo) {
                filter['visitInfo.scheduledArrivalTime'].$lte = new Date(query.scheduledTo);
            }
        }
        return filter;
    }
    validateVisitorAccess(req, visitor) {
        const { companyId } = this.getUserInfo(req);
        if (!companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (visitor.companyId.toString() !== companyId) {
            throw new errors_1.AppError('Access denied: Visitor belongs to different company', 403);
        }
    }
    async uploadEntryPhoto(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, companyId } = this.getUserInfo(req);
            if (!req.file) {
                throw new errors_1.AppError('Entry photo is required', 400);
            }
            const photoUrl = req.file.location;
            const visitor = await this.visitorService.findById(id);
            if (!visitor || visitor.companyId.toString() !== companyId) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            const updatedVisitor = await this.visitorService.update(id, {
                $push: {
                    entries: {
                        entryDateTime: new Date(),
                        entryPhoto: photoUrl,
                        entryBy: userId,
                        deviceId: req.headers['user-agent'] || 'unknown',
                        ipAddress: req.ip
                    }
                },
                currentStatus: 'checked_in'
            }, userId);
            logger_1.logger.info('Entry photo uploaded', { visitorId: id, photoUrl, userId });
            this.sendSuccess(res, { photoUrl, visitor: updatedVisitor }, 'Entry photo uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async uploadExitPhoto(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, companyId } = this.getUserInfo(req);
            if (!req.file) {
                throw new errors_1.AppError('Exit photo is required', 400);
            }
            const photoUrl = req.file.location;
            const visitor = await this.visitorService.findById(id);
            if (!visitor || visitor.companyId.toString() !== companyId) {
                throw new errors_1.AppError('Visitor not found', 404);
            }
            const updatedVisitor = await this.visitorService.update(id, {
                $push: {
                    exits: {
                        exitDateTime: new Date(),
                        exitPhoto: photoUrl,
                        exitBy: userId,
                        deviceId: req.headers['user-agent'] || 'unknown',
                        ipAddress: req.ip
                    }
                },
                currentStatus: 'checked_out'
            }, userId);
            logger_1.logger.info('Exit photo uploaded', { visitorId: id, photoUrl, userId });
            this.sendSuccess(res, { photoUrl, visitor: updatedVisitor }, 'Exit photo uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getUploadUrl(req, res, next) {
        try {
            const { fileName, contentType, fileType } = req.body;
            const { companyId } = this.getUserInfo(req);
            if (!fileName || !contentType) {
                throw new errors_1.AppError('fileName and contentType are required', 400);
            }
            const folder = `visitors/${companyId}/${fileType || 'general'}`;
            const { uploadUrl, key } = await S3Service_1.default.getPresignedUploadUrl(fileName, contentType, folder, { expiresIn: 3600 });
            logger_1.logger.info('Generated upload URL for visitor file', {
                fileName,
                contentType,
                folder,
                key
            });
            this.sendSuccess(res, { uploadUrl, key }, 'Upload URL generated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getDownloadUrl(req, res, next) {
        try {
            const { key } = req.params;
            const { companyId } = this.getUserInfo(req);
            if (!key.includes(companyId)) {
                throw new errors_1.AppError('Access denied', 403);
            }
            const downloadUrl = await S3Service_1.default.getPresignedDownloadUrl(key, 3600);
            logger_1.logger.info('Generated download URL for visitor file', { key, companyId });
            this.sendSuccess(res, { downloadUrl }, 'Download URL generated successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VisitorController = VisitorController;
//# sourceMappingURL=VisitorController.js.map