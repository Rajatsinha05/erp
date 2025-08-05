"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SupplierAddressSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['office', 'factory', 'warehouse', 'billing'], required: true },
    isPrimary: { type: Boolean, default: false },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    landmark: { type: String },
    gpsCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const SupplierContactSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    designation: { type: String },
    department: { type: String },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String },
    whatsapp: { type: String },
    isPrimary: { type: Boolean, default: false },
    canReceiveOrders: { type: Boolean, default: false },
    canQuoteRates: { type: Boolean, default: false },
    notes: { type: String },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const ProductCategorySchema = new mongoose_1.Schema({
    category: { type: String, required: true },
    subCategory: { type: String },
    products: [String],
    minimumOrderQuantity: { type: Number, min: 0 },
    leadTime: { type: Number, min: 0 },
    qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C'] },
    certifications: [String],
    isActive: { type: Boolean, default: true }
}, { _id: false });
const PerformanceMetricSchema = new mongoose_1.Schema({
    metric: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    period: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });
const SupplierSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    supplierCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    supplierName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    legalName: {
        type: String,
        trim: true,
        maxlength: 255
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 255
    },
    businessInfo: {
        businessType: {
            type: String,
            enum: ['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited', 'llp', 'trust', 'society', 'government'],
            required: true
        },
        industry: { type: String },
        subIndustry: { type: String },
        businessDescription: { type: String },
        website: { type: String },
        socialMedia: {
            facebook: { type: String },
            instagram: { type: String },
            linkedin: { type: String },
            twitter: { type: String }
        },
        establishedYear: { type: Number },
        employeeCount: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
        annualTurnover: { type: String, enum: ['<1L', '1L-10L', '10L-1Cr', '1Cr-10Cr', '10Cr+'] },
        manufacturingCapacity: { type: String }
    },
    registrationDetails: {
        gstin: {
            type: String,
            uppercase: true,
            match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            sparse: true
        },
        pan: {
            type: String,
            uppercase: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
        },
        cin: { type: String },
        udyogAadhar: { type: String },
        iecCode: { type: String },
        registrationNumber: { type: String },
        vatNumber: { type: String },
        cstNumber: { type: String },
        msmeNumber: { type: String },
        factoryLicense: { type: String }
    },
    contactInfo: {
        primaryPhone: { type: String, required: true },
        alternatePhone: { type: String },
        primaryEmail: { type: String, required: true },
        alternateEmail: { type: String },
        whatsapp: { type: String },
        fax: { type: String },
        tollFree: { type: String }
    },
    addresses: [SupplierAddressSchema],
    contactPersons: [SupplierContactSchema],
    productCategories: [ProductCategorySchema],
    financialInfo: {
        paymentTerms: { type: String },
        creditDays: { type: Number, default: 0, min: 0 },
        securityDeposit: { type: Number, default: 0, min: 0 },
        advancePaid: { type: Number, default: 0, min: 0 },
        outstandingPayable: { type: Number, default: 0 },
        totalPurchases: { type: Number, default: 0, min: 0 },
        lastPaymentDate: { type: Date },
        lastPaymentAmount: { type: Number, min: 0 },
        preferredPaymentMethod: {
            type: String,
            enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'card']
        },
        currency: { type: String, default: 'INR' },
        taxDeductionRate: { type: Number, default: 0, min: 0, max: 100 }
    },
    bankingDetails: {
        bankName: { type: String },
        branchName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        accountHolderName: { type: String },
        accountType: { type: String, enum: ['savings', 'current', 'cc', 'od'] },
        upiId: { type: String },
        isVerified: { type: Boolean, default: false }
    },
    supplyHistory: {
        firstOrderDate: { type: Date },
        lastOrderDate: { type: Date },
        totalOrders: { type: Number, default: 0, min: 0 },
        totalOrderValue: { type: Number, default: 0, min: 0 },
        averageOrderValue: { type: Number, default: 0, min: 0 },
        onTimeDeliveryRate: { type: Number, default: 0, min: 0, max: 100 },
        qualityRejectionRate: { type: Number, default: 0, min: 0, max: 100 },
        averageLeadTime: { type: Number, default: 0, min: 0 },
        suppliedProducts: [String]
    },
    performanceMetrics: [PerformanceMetricSchema],
    quality: {
        qualityRating: { type: Number, min: 1, max: 5 },
        qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C'] },
        certifications: [String],
        qualityAgreements: [String],
        lastQualityAudit: { type: Date },
        nextQualityAudit: { type: Date },
        qualityNotes: { type: String },
        defectRate: { type: Number, default: 0, min: 0, max: 100 },
        returnRate: { type: Number, default: 0, min: 0, max: 100 }
    },
    relationship: {
        supplierType: {
            type: String,
            enum: ['manufacturer', 'trader', 'distributor', 'agent', 'service_provider'],
            required: true
        },
        supplierCategory: {
            type: String,
            enum: ['strategic', 'preferred', 'approved', 'conditional', 'blacklisted'],
            default: 'approved'
        },
        relationshipManager: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        assignedBuyer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        supplierSince: { type: Date },
        lastInteraction: { type: Date },
        nextReview: { type: Date },
        priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        exclusiveSupplier: { type: Boolean, default: false },
        strategicPartner: { type: Boolean, default: false }
    },
    compliance: {
        vendorApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
        approvalDate: { type: Date },
        approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        complianceDocuments: [String],
        riskCategory: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        blacklisted: { type: Boolean, default: false },
        blacklistReason: { type: String },
        complianceNotes: { type: String },
        lastComplianceCheck: { type: Date },
        nextComplianceCheck: { type: Date },
        environmentalCompliance: { type: Boolean, default: false },
        laborCompliance: { type: Boolean, default: false },
        safetyCompliance: { type: Boolean, default: false }
    },
    notes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'suppliers'
});
SupplierSchema.index({ companyId: 1, supplierCode: 1 }, { unique: true });
SupplierSchema.index({ companyId: 1, 'contactInfo.primaryEmail': 1 });
SupplierSchema.index({ companyId: 1, 'contactInfo.primaryPhone': 1 });
SupplierSchema.index({ companyId: 1, 'registrationDetails.gstin': 1 });
SupplierSchema.index({ companyId: 1, 'relationship.supplierType': 1 });
SupplierSchema.index({ companyId: 1, 'relationship.supplierCategory': 1 });
SupplierSchema.index({ companyId: 1, 'compliance.vendorApprovalStatus': 1 });
SupplierSchema.index({ companyId: 1, isActive: 1 });
SupplierSchema.index({
    supplierName: 'text',
    supplierCode: 'text',
    legalName: 'text',
    'contactInfo.primaryEmail': 'text',
    'contactInfo.primaryPhone': 'text'
});
SupplierSchema.pre('save', function (next) {
    if (!this.displayName) {
        this.displayName = this.supplierName;
    }
    if (this.addresses && this.addresses.length > 0) {
        const primaryAddresses = this.addresses.filter(addr => addr.isPrimary);
        if (primaryAddresses.length === 0) {
            this.addresses[0].isPrimary = true;
        }
        else if (primaryAddresses.length > 1) {
            this.addresses.forEach((addr, index) => {
                addr.isPrimary = index === 0;
            });
        }
    }
    if (this.contactPersons && this.contactPersons.length > 0) {
        const primaryContacts = this.contactPersons.filter(contact => contact.isPrimary);
        if (primaryContacts.length === 0) {
            this.contactPersons[0].isPrimary = true;
        }
        else if (primaryContacts.length > 1) {
            this.contactPersons.forEach((contact, index) => {
                contact.isPrimary = index === 0;
            });
        }
    }
    if (this.supplyHistory.totalOrders > 0) {
        this.supplyHistory.averageOrderValue =
            this.supplyHistory.totalOrderValue / this.supplyHistory.totalOrders;
    }
    next();
});
SupplierSchema.methods.getPrimaryAddress = function (type) {
    if (type) {
        return this.addresses.find(addr => addr.type === type && addr.isPrimary && addr.isActive);
    }
    return this.addresses.find(addr => addr.isPrimary && addr.isActive);
};
SupplierSchema.methods.getPrimaryContact = function () {
    return this.contactPersons.find(contact => contact.isPrimary && contact.isActive);
};
SupplierSchema.methods.getQualityScore = function () {
    const onTimeScore = this.supplyHistory.onTimeDeliveryRate || 0;
    const qualityScore = 100 - (this.supplyHistory.qualityRejectionRate || 0);
    const overallRating = (this.quality.qualityRating || 3) * 20;
    return (onTimeScore + qualityScore + overallRating) / 3;
};
SupplierSchema.methods.isApproved = function () {
    return this.compliance.vendorApprovalStatus === 'approved' &&
        !this.compliance.blacklisted &&
        this.isActive;
};
SupplierSchema.methods.canSupply = function (productCategory) {
    return this.productCategories.some(cat => cat.category === productCategory && cat.isActive);
};
SupplierSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
SupplierSchema.statics.findApproved = function (companyId) {
    return this.find({
        companyId,
        'compliance.vendorApprovalStatus': 'approved',
        'compliance.blacklisted': false,
        isActive: true
    });
};
SupplierSchema.statics.findByCategory = function (companyId, category) {
    return this.find({
        companyId,
        'productCategories.category': category,
        'productCategories.isActive': true,
        isActive: true
    });
};
SupplierSchema.statics.findTopPerformers = function (companyId, limit = 10) {
    return this.find({ companyId, isActive: true })
        .sort({
        'supplyHistory.onTimeDeliveryRate': -1,
        'quality.qualityRating': -1,
        'supplyHistory.totalOrderValue': -1
    })
        .limit(limit);
};
exports.default = (0, mongoose_1.model)('Supplier', SupplierSchema);
//# sourceMappingURL=Supplier.js.map