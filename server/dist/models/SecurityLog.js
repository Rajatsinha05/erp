"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IncidentSchema = new mongoose_1.Schema({
    incidentType: {
        type: String,
        enum: ['theft', 'vandalism', 'trespassing', 'fire', 'medical', 'accident', 'suspicious_activity', 'violence', 'harassment', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    location: { type: String, required: true },
    description: { type: String, required: true },
    reportedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now },
    witnessIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    witnessNames: [String],
    evidenceUrls: [String],
    actionTaken: { type: String },
    actionTakenBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    actionTakenAt: { type: Date },
    status: {
        type: String,
        enum: ['reported', 'investigating', 'resolved', 'closed', 'escalated'],
        default: 'reported'
    },
    resolution: { type: String },
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    policeInvolved: { type: Boolean, default: false },
    firNumber: { type: String },
    insuranceClaim: { type: Boolean, default: false },
    claimNumber: { type: String },
    estimatedLoss: { type: Number, min: 0 },
    actualLoss: { type: Number, min: 0 }
}, { _id: false });
const PatrolSchema = new mongoose_1.Schema({
    patrolType: {
        type: String,
        enum: ['routine', 'random', 'incident_response', 'special', 'emergency'],
        required: true
    },
    patrolRoute: { type: String, required: true },
    patrolAreas: [String],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    patrolOfficerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    patrolOfficerName: { type: String, required: true },
    backupOfficerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    backupOfficerName: { type: String },
    checkpoints: [{
            checkpointId: { type: String, required: true },
            checkpointName: { type: String, required: true },
            expectedTime: { type: Date },
            actualTime: { type: Date },
            status: { type: String, enum: ['completed', 'missed', 'delayed'], default: 'completed' },
            observations: { type: String },
            photos: [String],
            issues: [String]
        }],
    observations: { type: String },
    issuesFound: [String],
    actionsTaken: [String],
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'interrupted', 'cancelled'],
        default: 'scheduled'
    },
    duration: { type: Number },
    distanceCovered: { type: Number },
    weatherConditions: { type: String },
    equipmentUsed: [String],
    reportSubmitted: { type: Boolean, default: false },
    reportUrl: { type: String }
}, { _id: false });
const CCTVEventSchema = new mongoose_1.Schema({
    cameraId: { type: String, required: true },
    cameraName: { type: String, required: true },
    cameraLocation: { type: String, required: true },
    eventType: {
        type: String,
        enum: ['motion_detected', 'person_detected', 'vehicle_detected', 'intrusion', 'loitering', 'crowd_detected', 'object_left', 'object_removed', 'line_crossing', 'area_entered', 'area_exited', 'face_recognized', 'license_plate_read', 'alarm_triggered'],
        required: true
    },
    detectionTime: { type: Date, required: true },
    confidence: { type: Number, min: 0, max: 100 },
    boundingBox: {
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number }
    },
    snapshotUrl: { type: String },
    videoClipUrl: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    isProcessed: { type: Boolean, default: false },
    processedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    actionRequired: { type: Boolean, default: false },
    actionTaken: { type: String },
    falseAlarm: { type: Boolean, default: false },
    relatedIncidentId: { type: mongoose_1.Schema.Types.ObjectId }
}, { _id: false });
const AccessEventSchema = new mongoose_1.Schema({
    accessType: {
        type: String,
        enum: ['door', 'gate', 'turnstile', 'barrier', 'elevator', 'parking'],
        required: true
    },
    accessPointId: { type: String, required: true },
    accessPointName: { type: String, required: true },
    location: { type: String, required: true },
    eventType: {
        type: String,
        enum: ['access_granted', 'access_denied', 'door_opened', 'door_closed', 'door_forced', 'door_held_open', 'tailgating_detected', 'card_read', 'biometric_scan', 'manual_override'],
        required: true
    },
    eventTime: { type: Date, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    visitorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Visitor' },
    visitorName: { type: String },
    credentialType: {
        type: String,
        enum: ['card', 'biometric', 'pin', 'mobile', 'qr_code', 'manual']
    },
    credentialId: { type: String },
    accessResult: {
        type: String,
        enum: ['success', 'denied', 'error', 'timeout'],
        required: true
    },
    denialReason: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    photo: { type: String },
    isAuthorized: { type: Boolean, default: true },
    overrideBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    overrideReason: { type: String }
}, { _id: false });
const SecurityLogSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    logId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    logNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    eventDateTime: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    eventType: {
        type: String,
        enum: ['incident', 'patrol', 'cctv_event', 'access_event', 'alarm', 'maintenance', 'training', 'drill', 'visitor_management', 'vehicle_management', 'other'],
        required: true,
        index: true
    },
    eventCategory: {
        type: String,
        enum: ['security', 'safety', 'operational', 'maintenance', 'compliance', 'emergency'],
        required: true,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical', 'emergency'],
        default: 'medium',
        index: true
    },
    location: {
        area: { type: String, required: true },
        zone: { type: String },
        building: { type: String },
        floor: { type: String },
        room: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        landmark: { type: String }
    },
    personnel: {
        reportedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
        reporterName: { type: String, required: true },
        reporterRole: { type: String },
        reporterDepartment: { type: String },
        assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        assigneeName: { type: String },
        supervisorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        supervisorName: { type: String },
        witnessIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
        witnessNames: [String]
    },
    incident: IncidentSchema,
    patrol: PatrolSchema,
    cctvEvent: CCTVEventSchema,
    accessEvent: AccessEventSchema,
    description: { type: String, required: true },
    detailedDescription: { type: String },
    immediateAction: { type: String },
    followUpAction: { type: String },
    preventiveMeasures: { type: String },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated', 'cancelled'],
        default: 'open',
        index: true
    },
    resolution: { type: String },
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    closedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    evidence: {
        photos: [String],
        videos: [String],
        documents: [String],
        audioRecordings: [String],
        cctvFootage: [String],
        screenshots: [String],
        otherFiles: [String]
    },
    impact: {
        peopleAffected: { type: Number, default: 0, min: 0 },
        propertyDamage: { type: Boolean, default: false },
        estimatedLoss: { type: Number, default: 0, min: 0 },
        actualLoss: { type: Number, default: 0, min: 0 },
        businessImpact: { type: String, enum: ['none', 'minimal', 'moderate', 'significant', 'severe'] },
        reputationImpact: { type: String, enum: ['none', 'minimal', 'moderate', 'significant', 'severe'] },
        operationalImpact: { type: String, enum: ['none', 'minimal', 'moderate', 'significant', 'severe'] }
    },
    externalInvolvement: {
        policeInformed: { type: Boolean, default: false },
        policeStationName: { type: String },
        firNumber: { type: String },
        firDate: { type: Date },
        fireServiceCalled: { type: Boolean, default: false },
        ambulanceCalled: { type: Boolean, default: false },
        insuranceInformed: { type: Boolean, default: false },
        claimNumber: { type: String },
        mediaInvolved: { type: Boolean, default: false },
        legalActionRequired: { type: Boolean, default: false },
        regulatoryReporting: { type: Boolean, default: false }
    },
    compliance: {
        complianceIssue: { type: Boolean, default: false },
        regulationViolated: [String],
        auditRequired: { type: Boolean, default: false },
        auditDate: { type: Date },
        auditBy: { type: String },
        auditFindings: { type: String },
        correctiveActions: [String],
        preventiveActions: [String]
    },
    notifications: {
        managementNotified: { type: Boolean, default: false },
        managementNotifiedAt: { type: Date },
        clientNotified: { type: Boolean, default: false },
        clientNotifiedAt: { type: Date },
        authoritiesNotified: { type: Boolean, default: false },
        authoritiesNotifiedAt: { type: Date },
        mediaStatement: { type: String },
        internalCommunication: { type: String }
    },
    weatherConditions: { type: String },
    lightingConditions: { type: String, enum: ['daylight', 'artificial', 'dim', 'dark'] },
    crowdLevel: { type: String, enum: ['empty', 'light', 'moderate', 'heavy', 'overcrowded'] },
    specialCircumstances: { type: String },
    lessonsLearned: { type: String },
    recommendations: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    relatedLogIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'SecurityLog' }],
    parentLogId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SecurityLog' },
    childLogIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'SecurityLog' }],
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, {
    timestamps: true,
    collection: 'security_logs'
});
SecurityLogSchema.index({ companyId: 1, eventDateTime: -1 });
SecurityLogSchema.index({ companyId: 1, eventType: 1, eventDateTime: -1 });
SecurityLogSchema.index({ companyId: 1, priority: 1, status: 1 });
SecurityLogSchema.index({ companyId: 1, 'location.area': 1, eventDateTime: -1 });
SecurityLogSchema.index({ companyId: 1, 'personnel.reportedBy': 1 });
SecurityLogSchema.index({ companyId: 1, status: 1, eventDateTime: -1 });
SecurityLogSchema.index({
    description: 'text',
    detailedDescription: 'text',
    'location.area': 'text',
    'personnel.reporterName': 'text'
});
SecurityLogSchema.pre('save', function (next) {
    if (!this.logNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.logNumber = `SEC${year}${month}${day}${random}`;
    }
    if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
    if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
        this.closedAt = new Date();
    }
    next();
});
SecurityLogSchema.methods.isOpen = function () {
    return ['open', 'in_progress'].includes(this.status);
};
SecurityLogSchema.methods.isCritical = function () {
    return ['critical', 'emergency'].includes(this.priority);
};
SecurityLogSchema.methods.requiresEscalation = function () {
    const hoursSinceCreated = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
    if (this.priority === 'emergency' && hoursSinceCreated > 1)
        return true;
    if (this.priority === 'critical' && hoursSinceCreated > 4)
        return true;
    if (this.priority === 'high' && hoursSinceCreated > 24)
        return true;
    if (this.priority === 'medium' && hoursSinceCreated > 72)
        return true;
    return false;
};
SecurityLogSchema.methods.getResponseTime = function () {
    if (!this.resolvedAt)
        return 0;
    return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60));
};
SecurityLogSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true }).sort({ eventDateTime: -1 });
};
SecurityLogSchema.statics.findOpenLogs = function (companyId) {
    return this.find({
        companyId,
        status: { $in: ['open', 'in_progress'] },
        isActive: true
    }).sort({ priority: -1, eventDateTime: -1 });
};
SecurityLogSchema.statics.findCriticalLogs = function (companyId) {
    return this.find({
        companyId,
        priority: { $in: ['critical', 'emergency'] },
        isActive: true
    }).sort({ eventDateTime: -1 });
};
SecurityLogSchema.statics.findByLocation = function (companyId, area) {
    return this.find({
        companyId,
        'location.area': area,
        isActive: true
    }).sort({ eventDateTime: -1 });
};
SecurityLogSchema.statics.getSecurityStats = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                eventDateTime: { $gte: startDate, $lte: endDate },
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    eventType: '$eventType',
                    priority: '$priority',
                    status: '$status'
                },
                count: { $sum: 1 },
                avgResponseTime: {
                    $avg: {
                        $cond: [
                            { $ne: ['$resolvedAt', null] },
                            { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('SecurityLog', SecurityLogSchema);
//# sourceMappingURL=SecurityLog.js.map