"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SessionDetailsSchema = new mongoose_1.Schema({
    sessionId: { type: String },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
    browser: { type: String },
    operatingSystem: { type: String },
    location: {
        country: { type: String },
        region: { type: String },
        city: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    }
}, { _id: false });
const RequestDetailsSchema = new mongoose_1.Schema({
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
    endpoint: { type: String, required: true },
    requestId: { type: String },
    correlationId: { type: String },
    requestBody: { type: mongoose_1.Schema.Types.Mixed },
    queryParams: { type: mongoose_1.Schema.Types.Mixed },
    headers: { type: mongoose_1.Schema.Types.Mixed },
    responseStatus: { type: Number },
    responseTime: { type: Number },
    responseSize: { type: Number }
}, { _id: false });
const DataChangesSchema = new mongoose_1.Schema({
    field: { type: String, required: true },
    oldValue: { type: mongoose_1.Schema.Types.Mixed },
    newValue: { type: mongoose_1.Schema.Types.Mixed },
    dataType: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array', 'date'] }
}, { _id: false });
const SecurityContextSchema = new mongoose_1.Schema({
    authenticationMethod: { type: String, enum: ['password', 'otp', '2fa', 'sso', 'api_key'] },
    authenticationStatus: { type: String, enum: ['success', 'failed', 'locked', 'expired'] },
    permissionLevel: { type: String },
    accessAttempts: { type: Number, default: 1 },
    riskScore: { type: Number, min: 0, max: 100 },
    threatIndicators: [String],
    securityFlags: [String]
}, { _id: false });
const AuditLogSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    userName: { type: String },
    userEmail: { type: String },
    userRole: { type: String },
    impersonatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    action: {
        type: String,
        required: true,
        index: true
    },
    actionCategory: {
        type: String,
        enum: [
            'authentication', 'authorization', 'data_access', 'data_modification',
            'system_configuration', 'user_management', 'financial_transaction',
            'inventory_management', 'production_management', 'order_management',
            'security_event', 'system_event', 'integration_event', 'backup_restore'
        ],
        required: true,
        index: true
    },
    actionType: {
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject'],
        required: true,
        index: true
    },
    resource: {
        type: String,
        required: true,
        index: true
    },
    resourceId: { type: String, index: true },
    resourceType: {
        type: String,
        enum: [
            'user', 'company', 'customer', 'supplier', 'inventory_item', 'stock_movement',
            'production_order', 'customer_order', 'financial_transaction', 'invoice',
            'purchase_order', 'quotation', 'report', 'system_setting', 'backup'
        ],
        index: true
    },
    parentResource: {
        type: { type: String },
        id: { type: String }
    },
    eventTimestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    eventId: {
        type: String,
        unique: true,
        required: true
    },
    eventSource: {
        type: String,
        enum: ['web_app', 'mobile_app', 'api', 'system', 'integration', 'scheduled_job'],
        default: 'web_app',
        index: true
    },
    eventSeverity: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info',
        index: true
    },
    sessionDetails: SessionDetailsSchema,
    requestDetails: RequestDetailsSchema,
    dataChanges: [DataChangesSchema],
    oldData: { type: mongoose_1.Schema.Types.Mixed },
    newData: { type: mongoose_1.Schema.Types.Mixed },
    securityContext: SecurityContextSchema,
    businessContext: {
        department: { type: String },
        process: { type: String },
        workflow: { type: String },
        businessRule: { type: String },
        complianceRequirement: { type: String }
    },
    result: {
        status: {
            type: String,
            enum: ['success', 'failure', 'partial', 'pending'],
            default: 'success',
            index: true
        },
        errorCode: { type: String },
        errorMessage: { type: String },
        affectedRecords: { type: Number, default: 1 },
        impactLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        }
    },
    description: { type: String, required: true },
    additionalInfo: { type: mongoose_1.Schema.Types.Mixed },
    tags: [String],
    retentionPeriod: { type: Number, default: 2555 },
    complianceFlags: [String],
    isPersonalData: { type: Boolean, default: false },
    dataClassification: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'restricted'],
        default: 'internal'
    },
    systemInfo: {
        serverName: { type: String },
        applicationVersion: { type: String },
        databaseVersion: { type: String },
        environment: { type: String, enum: ['development', 'staging', 'production'] }
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs'
});
AuditLogSchema.index({ companyId: 1, eventTimestamp: -1 });
AuditLogSchema.index({ companyId: 1, userId: 1, eventTimestamp: -1 });
AuditLogSchema.index({ companyId: 1, actionCategory: 1, eventTimestamp: -1 });
AuditLogSchema.index({ companyId: 1, resource: 1, resourceId: 1, eventTimestamp: -1 });
AuditLogSchema.index({ companyId: 1, 'result.status': 1, eventTimestamp: -1 });
AuditLogSchema.index({ eventSeverity: 1, eventTimestamp: -1 });
AuditLogSchema.index({ 'securityContext.riskScore': 1, eventTimestamp: -1 });
AuditLogSchema.index({
    eventTimestamp: 1
}, {
    expireAfterSeconds: 0,
    partialFilterExpression: { retentionPeriod: { $exists: true } }
});
AuditLogSchema.index({
    description: 'text',
    action: 'text',
    resource: 'text',
    userName: 'text',
    'result.errorMessage': 'text'
});
AuditLogSchema.pre('save', function (next) {
    if (!this.eventId) {
        this.eventId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!this.systemInfo.environment) {
        this.systemInfo.environment = process.env.NODE_ENV || 'development';
    }
    if (!this.systemInfo.applicationVersion) {
        this.systemInfo.applicationVersion = process.env.APP_VERSION || '1.0.0';
    }
    if (!this.dataClassification) {
        const sensitiveResources = ['user', 'financial_transaction', 'customer', 'supplier'];
        if (sensitiveResources.includes(this.resourceType || '')) {
            this.dataClassification = 'confidential';
        }
    }
    if (!this.isPersonalData) {
        const personalDataResources = ['user', 'customer'];
        this.isPersonalData = personalDataResources.includes(this.resourceType || '');
    }
    next();
});
AuditLogSchema.methods.isSecurityEvent = function () {
    return this.actionCategory === 'security_event' ||
        this.eventSeverity === 'critical' ||
        (this.securityContext?.riskScore || 0) > 70;
};
AuditLogSchema.methods.isFailureEvent = function () {
    return this.result.status === 'failure';
};
AuditLogSchema.methods.hasDataChanges = function () {
    return this.dataChanges && this.dataChanges.length > 0;
};
AuditLogSchema.methods.getRetentionDate = function () {
    const retentionMs = this.retentionPeriod * 24 * 60 * 60 * 1000;
    return new Date(this.eventTimestamp.getTime() + retentionMs);
};
AuditLogSchema.statics.findByCompany = function (companyId, limit = 100) {
    return this.find({ companyId })
        .sort({ eventTimestamp: -1 })
        .limit(limit);
};
AuditLogSchema.statics.findByUser = function (companyId, userId, limit = 100) {
    return this.find({ companyId, userId })
        .sort({ eventTimestamp: -1 })
        .limit(limit);
};
AuditLogSchema.statics.findByResource = function (companyId, resource, resourceId) {
    const query = { companyId, resource };
    if (resourceId) {
        query.resourceId = resourceId;
    }
    return this.find(query).sort({ eventTimestamp: -1 });
};
AuditLogSchema.statics.findSecurityEvents = function (companyId, startDate, endDate) {
    const query = {
        companyId,
        $or: [
            { actionCategory: 'security_event' },
            { eventSeverity: 'critical' },
            { 'securityContext.riskScore': { $gt: 70 } }
        ]
    };
    if (startDate || endDate) {
        query.eventTimestamp = {};
        if (startDate)
            query.eventTimestamp.$gte = startDate;
        if (endDate)
            query.eventTimestamp.$lte = endDate;
    }
    return this.find(query).sort({ eventTimestamp: -1 });
};
AuditLogSchema.statics.findFailedActions = function (companyId, startDate, endDate) {
    const query = {
        companyId,
        'result.status': 'failure'
    };
    if (startDate || endDate) {
        query.eventTimestamp = {};
        if (startDate)
            query.eventTimestamp.$gte = startDate;
        if (endDate)
            query.eventTimestamp.$lte = endDate;
    }
    return this.find(query).sort({ eventTimestamp: -1 });
};
AuditLogSchema.statics.getActivitySummary = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                eventTimestamp: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    actionCategory: '$actionCategory',
                    actionType: '$actionType',
                    status: '$result.status'
                },
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                avgResponseTime: { $avg: '$requestDetails.responseTime' }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};
AuditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
    throw new Error('Audit logs cannot be modified');
});
exports.default = (0, mongoose_1.model)('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLog.js.map