"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VisitorDocumentSchema = new mongoose_1.Schema({
    documentType: {
        type: String,
        enum: ['aadhar', 'pan', 'driving_license', 'passport', 'voter_id', 'company_id', 'other'],
        required: true
    },
    documentNumber: { type: String, required: true },
    documentUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    expiryDate: { type: Date },
    notes: { type: String }
}, { _id: false });
const VisitorApprovalSchema = new mongoose_1.Schema({
    approvalLevel: { type: Number, required: true, min: 1 },
    approverType: {
        type: String,
        enum: ['employee', 'security', 'manager', 'admin'],
        required: true
    },
    approverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    approverName: { type: String, required: true },
    approverDepartment: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired'],
        default: 'pending'
    },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    approvalNotes: { type: String },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const VisitorEntrySchema = new mongoose_1.Schema({
    entryDateTime: { type: Date, required: true, default: Date.now },
    entryGate: { type: String, required: true },
    securityGuardId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    securityGuardName: { type: String, required: true },
    entryMethod: {
        type: String,
        enum: ['manual', 'qr_code', 'rfid', 'biometric', 'face_recognition'],
        default: 'manual'
    },
    entryPhoto: { type: String },
    temperatureCheck: { type: Number, min: 90, max: 110 },
    healthDeclaration: { type: Boolean, default: false },
    belongingsChecked: { type: Boolean, default: false },
    belongingsList: [String],
    escortRequired: { type: Boolean, default: false },
    escortId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    escortName: { type: String },
    entryNotes: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    gpsLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
}, { _id: false });
const VisitorExitSchema = new mongoose_1.Schema({
    exitDateTime: { type: Date, required: true, default: Date.now },
    exitGate: { type: String, required: true },
    securityGuardId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    securityGuardName: { type: String, required: true },
    exitMethod: {
        type: String,
        enum: ['manual', 'qr_code', 'rfid', 'biometric', 'face_recognition'],
        default: 'manual'
    },
    exitPhoto: { type: String },
    belongingsReturned: { type: Boolean, default: true },
    belongingsNotes: { type: String },
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackComments: { type: String },
    exitNotes: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    gpsLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    totalDuration: { type: Number },
    overstayReason: { type: String }
}, { _id: false });
const VisitorSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    visitorId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    visitorNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    personalInfo: {
        firstName: { type: String, required: true, trim: true, maxlength: 100 },
        lastName: { type: String, required: true, trim: true, maxlength: 100 },
        middleName: { type: String, trim: true, maxlength: 100 },
        fullName: { type: String, trim: true, maxlength: 255 },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        dateOfBirth: { type: Date },
        nationality: { type: String, default: 'Indian' },
        profilePhoto: { type: String },
        signature: { type: String }
    },
    contactInfo: {
        primaryPhone: { type: String, required: true, match: /^[+]?[1-9][\d\s\-\(\)]{7,15}$/ },
        alternatePhone: { type: String, match: /^[+]?[1-9][\d\s\-\(\)]{7,15}$/ },
        email: { type: String, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        whatsapp: { type: String }
    },
    address: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
        landmark: { type: String }
    },
    organizationInfo: {
        companyName: { type: String, trim: true },
        designation: { type: String, trim: true },
        department: { type: String, trim: true },
        companyAddress: { type: String },
        companyPhone: { type: String },
        companyEmail: { type: String },
        businessCard: { type: String },
        isEmployee: { type: Boolean, default: false },
        employeeId: { type: String }
    },
    visitInfo: {
        visitType: {
            type: String,
            enum: ['business', 'interview', 'meeting', 'delivery', 'maintenance', 'audit', 'training', 'personal', 'official', 'other'],
            required: true,
            index: true
        },
        visitPurpose: { type: String, required: true, maxlength: 500 },
        visitCategory: {
            type: String,
            enum: ['vip', 'regular', 'contractor', 'vendor', 'government', 'media', 'student', 'other'],
            default: 'regular',
            index: true
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            index: true
        },
        expectedDuration: { type: Number, min: 15, max: 1440 },
        scheduledDateTime: { type: Date, index: true },
        scheduledEndDateTime: { type: Date },
        isRecurringVisit: { type: Boolean, default: false },
        recurringPattern: { type: String, enum: ['daily', 'weekly', 'monthly'] },
        visitNotes: { type: String }
    },
    hostInfo: {
        hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        hostName: { type: String, required: true },
        hostDepartment: { type: String, required: true },
        hostDesignation: { type: String },
        hostPhone: { type: String },
        hostEmail: { type: String },
        alternateHostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        alternateHostName: { type: String },
        meetingLocation: { type: String, required: true },
        meetingRoom: { type: String },
        specialInstructions: { type: String }
    },
    documents: [VisitorDocumentSchema],
    approvals: [VisitorApprovalSchema],
    overallApprovalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired', 'cancelled'],
        default: 'pending',
        index: true
    },
    entries: [VisitorEntrySchema],
    exits: [VisitorExitSchema],
    currentStatus: {
        type: String,
        enum: ['scheduled', 'approved', 'checked_in', 'inside', 'checked_out', 'completed', 'no_show', 'cancelled'],
        default: 'scheduled',
        index: true
    },
    securityInfo: {
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low',
            index: true
        },
        blacklisted: { type: Boolean, default: false, index: true },
        blacklistReason: { type: String },
        blacklistedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        blacklistedAt: { type: Date },
        securityNotes: { type: String },
        specialRequirements: [String],
        accessAreas: [String],
        restrictedAreas: [String],
        emergencyContact: {
            name: { type: String },
            phone: { type: String },
            relationship: { type: String }
        }
    },
    vehicleInfo: {
        hasVehicle: { type: Boolean, default: false },
        vehicleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle' },
        vehicleNumber: { type: String },
        vehicleType: { type: String, enum: ['car', 'bike', 'truck', 'bus', 'auto', 'cycle', 'other'] },
        driverName: { type: String },
        driverPhone: { type: String },
        parkingLocation: { type: String },
        parkingSlot: { type: String }
    },
    healthInfo: {
        vaccinationStatus: {
            type: String,
            enum: ['not_vaccinated', 'partially_vaccinated', 'fully_vaccinated', 'booster_taken']
        },
        vaccinationCertificate: { type: String },
        lastCovidTest: { type: Date },
        covidTestResult: { type: String, enum: ['positive', 'negative', 'pending'] },
        healthDeclaration: { type: Boolean, default: false },
        temperatureRecords: [{
                temperature: { type: Number },
                recordedAt: { type: Date, default: Date.now },
                recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
            }],
        maskRequired: { type: Boolean, default: true },
        sanitizationDone: { type: Boolean, default: false }
    },
    feedback: {
        overallRating: { type: Number, min: 1, max: 5 },
        securityRating: { type: Number, min: 1, max: 5 },
        hospitalityRating: { type: Number, min: 1, max: 5 },
        facilityRating: { type: Number, min: 1, max: 5 },
        comments: { type: String },
        suggestions: { type: String },
        wouldRecommend: { type: Boolean },
        feedbackDate: { type: Date }
    },
    notes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true }
}, {
    timestamps: true,
    collection: 'visitors'
});
VisitorSchema.index({ companyId: 1, visitorNumber: 1 }, { unique: true });
VisitorSchema.index({ companyId: 1, 'visitInfo.scheduledDateTime': 1 });
VisitorSchema.index({ companyId: 1, 'hostInfo.hostId': 1 });
VisitorSchema.index({ companyId: 1, currentStatus: 1 });
VisitorSchema.index({ companyId: 1, overallApprovalStatus: 1 });
VisitorSchema.index({ companyId: 1, 'visitInfo.visitType': 1 });
VisitorSchema.index({ companyId: 1, 'securityInfo.riskLevel': 1 });
VisitorSchema.index({ companyId: 1, 'securityInfo.blacklisted': 1 });
VisitorSchema.index({ 'contactInfo.primaryPhone': 1 });
VisitorSchema.index({ 'contactInfo.email': 1 });
VisitorSchema.index({
    'personalInfo.fullName': 'text',
    'personalInfo.firstName': 'text',
    'personalInfo.lastName': 'text',
    'organizationInfo.companyName': 'text',
    'visitInfo.visitPurpose': 'text',
    'hostInfo.hostName': 'text'
});
VisitorSchema.pre('save', function (next) {
    if (!this.personalInfo.fullName) {
        this.personalInfo.fullName = [
            this.personalInfo.firstName,
            this.personalInfo.middleName,
            this.personalInfo.lastName
        ].filter(Boolean).join(' ');
    }
    if (this.visitInfo.scheduledDateTime && this.visitInfo.expectedDuration && !this.visitInfo.scheduledEndDateTime) {
        this.visitInfo.scheduledEndDateTime = new Date(this.visitInfo.scheduledDateTime.getTime() + (this.visitInfo.expectedDuration * 60 * 1000));
    }
    next();
});
VisitorSchema.methods.isCurrentlyInside = function () {
    return this.currentStatus === 'inside' || this.currentStatus === 'checked_in';
};
VisitorSchema.methods.isApproved = function () {
    return this.overallApprovalStatus === 'approved';
};
VisitorSchema.methods.isBlacklisted = function () {
    return this.securityInfo.blacklisted;
};
VisitorSchema.methods.getLastEntry = function () {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;
};
VisitorSchema.methods.getLastExit = function () {
    return this.exits.length > 0 ? this.exits[this.exits.length - 1] : null;
};
VisitorSchema.methods.getCurrentDuration = function () {
    const lastEntry = this.getLastEntry();
    if (!lastEntry || this.currentStatus !== 'inside')
        return 0;
    return Math.floor((Date.now() - lastEntry.entryDateTime.getTime()) / (1000 * 60));
};
VisitorSchema.methods.isOverstaying = function () {
    if (!this.visitInfo.expectedDuration)
        return false;
    return this.getCurrentDuration() > this.visitInfo.expectedDuration;
};
VisitorSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
VisitorSchema.statics.findCurrentlyInside = function (companyId) {
    return this.find({
        companyId,
        currentStatus: { $in: ['checked_in', 'inside'] },
        isActive: true
    });
};
VisitorSchema.statics.findByHost = function (companyId, hostId) {
    return this.find({
        companyId,
        'hostInfo.hostId': hostId,
        isActive: true
    }).sort({ 'visitInfo.scheduledDateTime': -1 });
};
VisitorSchema.statics.findScheduledToday = function (companyId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return this.find({
        companyId,
        'visitInfo.scheduledDateTime': {
            $gte: startOfDay,
            $lt: endOfDay
        },
        isActive: true
    }).sort({ 'visitInfo.scheduledDateTime': 1 });
};
VisitorSchema.statics.findOverstaying = function (companyId) {
    return this.find({
        companyId,
        currentStatus: 'inside',
        isActive: true
    }).then((visitors) => {
        return visitors.filter(visitor => visitor.isOverstaying());
    });
};
exports.default = (0, mongoose_1.model)('Visitor', VisitorSchema);
//# sourceMappingURL=Visitor.js.map