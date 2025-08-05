"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuotationItemSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem' },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    description: { type: String },
    specifications: { type: String },
    hsnCode: { type: String },
    sacCode: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    rate: { type: Number, required: true, min: 0 },
    discount: {
        type: { type: String, enum: ['percentage', 'amount'], default: 'percentage' },
        value: { type: Number, default: 0, min: 0 }
    },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    taxBreakup: [{
            taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'CESS'], required: true },
            rate: { type: Number, required: true, min: 0, max: 100 },
            amount: { type: Number, required: true, min: 0 }
        }],
    totalTaxAmount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, default: 0, min: 0 },
    warrantyPeriod: { type: String },
    notes: { type: String }
}, { _id: false });
const QuotationTermSchema = new mongoose_1.Schema({
    termType: {
        type: String,
        enum: ['payment', 'delivery', 'warranty', 'validity', 'penalty', 'other'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isStandard: { type: Boolean, default: false },
    isMandatory: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
}, { _id: false });
const QuotationSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    quotationNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    quotationDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    validUntil: { type: Date, required: true },
    revision: { type: Number, default: 0, min: 0 },
    parentQuotationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quotation' },
    quotationType: {
        type: String,
        enum: ['sales', 'purchase', 'service', 'rental', 'maintenance', 'project'],
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['product', 'service', 'mixed', 'project', 'amc', 'rental'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    party: {
        partyType: { type: String, enum: ['customer', 'supplier'], required: true },
        partyId: { type: mongoose_1.Schema.Types.ObjectId, required: true, index: true },
        partyCode: { type: String, required: true },
        partyName: { type: String, required: true },
        gstin: { type: String },
        pan: { type: String },
        contactPerson: { type: String },
        phone: { type: String },
        email: { type: String },
        address: {
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' }
        }
    },
    references: {
        inquiryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Inquiry' },
        inquiryNumber: { type: String },
        rfqId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RFQ' },
        rfqNumber: { type: String },
        tenderNumber: { type: String },
        projectCode: { type: String },
        opportunityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Opportunity' },
        leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' }
    },
    items: [QuotationItemSchema],
    amounts: {
        subtotal: { type: Number, required: true, min: 0 },
        totalDiscount: { type: Number, default: 0, min: 0 },
        taxableAmount: { type: Number, required: true, min: 0 },
        totalTaxAmount: { type: Number, default: 0, min: 0 },
        freightCharges: { type: Number, default: 0, min: 0 },
        packingCharges: { type: Number, default: 0, min: 0 },
        installationCharges: { type: Number, default: 0, min: 0 },
        otherCharges: { type: Number, default: 0, min: 0 },
        roundingAdjustment: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true, min: 0 }
    },
    taxDetails: {
        placeOfSupply: { type: String, required: true },
        isReverseCharge: { type: Boolean, default: false },
        taxBreakup: [{
                taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'CESS'], required: true },
                rate: { type: Number, required: true, min: 0, max: 100 },
                taxableAmount: { type: Number, required: true, min: 0 },
                taxAmount: { type: Number, required: true, min: 0 }
            }],
        totalTaxAmount: { type: Number, default: 0, min: 0 }
    },
    terms: [QuotationTermSchema],
    paymentTerms: { type: String },
    deliveryTerms: { type: String },
    warrantyTerms: { type: String },
    validityPeriod: { type: String },
    deliveryInfo: {
        deliveryDays: { type: Number, default: 0, min: 0 },
        deliveryLocation: { type: String },
        shippingMethod: { type: String, enum: ['courier', 'transport', 'self_pickup', 'installation'] },
        packingType: { type: String },
        freightTerms: { type: String, enum: ['fob', 'cif', 'ex_works', 'delivered'] },
        installationRequired: { type: Boolean, default: false },
        installationDays: { type: Number, default: 0, min: 0 },
        commissioningDays: { type: Number, default: 0, min: 0 }
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'negotiation', 'accepted', 'rejected', 'expired', 'cancelled', 'converted'],
        default: 'draft',
        index: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    sentAt: { type: Date },
    sentBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    responseDate: { type: Date },
    conversion: {
        isConverted: { type: Boolean, default: false },
        convertedTo: { type: String, enum: ['sales_order', 'purchase_order', 'contract'] },
        convertedId: { type: mongoose_1.Schema.Types.ObjectId },
        convertedNumber: { type: String },
        convertedAt: { type: Date },
        convertedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        conversionRate: { type: Number, min: 0, max: 100 },
        conversionValue: { type: Number, min: 0 }
    },
    competition: {
        hasCompetition: { type: Boolean, default: false },
        competitors: [String],
        competitiveAdvantage: { type: String },
        priceComparison: { type: String, enum: ['lower', 'same', 'higher', 'unknown'] },
        winProbability: { type: Number, min: 0, max: 100 },
        lossReason: { type: String },
        competitorNotes: { type: String }
    },
    followUp: {
        nextFollowUpDate: { type: Date },
        followUpBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        followUpNotes: { type: String },
        communicationHistory: [{
                date: { type: Date, required: true },
                type: { type: String, enum: ['call', 'email', 'meeting', 'presentation'], required: true },
                summary: { type: String, required: true },
                outcome: { type: String },
                nextAction: { type: String },
                communicatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
            }]
    },
    metrics: {
        responseTime: { type: Number },
        preparationTime: { type: Number },
        negotiationRounds: { type: Number, default: 0 },
        revisionCount: { type: Number, default: 0 },
        customerRating: { type: Number, min: 1, max: 5 },
        internalRating: { type: Number, min: 1, max: 5 },
        profitMargin: { type: Number },
        costPrice: { type: Number, min: 0 }
    },
    notes: { type: String },
    internalNotes: { type: String },
    specialInstructions: { type: String },
    assumptions: { type: String },
    exclusions: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    salesPersonId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    salesPersonName: { type: String },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team' },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true, index: true }
}, {
    timestamps: true,
    collection: 'quotations'
});
QuotationSchema.index({ companyId: 1, quotationNumber: 1 }, { unique: true });
QuotationSchema.index({ companyId: 1, quotationDate: -1 });
QuotationSchema.index({ companyId: 1, 'party.partyId': 1, quotationDate: -1 });
QuotationSchema.index({ companyId: 1, status: 1, quotationDate: -1 });
QuotationSchema.index({ companyId: 1, validUntil: 1, status: 1 });
QuotationSchema.index({ validUntil: 1, status: 1 });
QuotationSchema.index({
    quotationNumber: 'text',
    'party.partyName': 'text',
    'party.partyCode': 'text'
});
QuotationSchema.pre('save', function (next) {
    if (this.status !== 'expired' && this.validUntil < new Date()) {
        this.status = 'expired';
    }
    if (this.conversion.isConverted && this.conversion.conversionValue) {
        this.conversion.conversionRate = (this.conversion.conversionValue / this.amounts.grandTotal) * 100;
    }
    next();
});
QuotationSchema.methods.isExpired = function () {
    return this.validUntil < new Date();
};
QuotationSchema.methods.getDaysToExpiry = function () {
    const today = new Date();
    const diffTime = this.validUntil.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
QuotationSchema.methods.calculateTotals = function () {
    this.amounts.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    this.amounts.totalDiscount = this.items.reduce((sum, item) => sum + item.discountAmount, 0);
    this.amounts.taxableAmount = this.amounts.subtotal - this.amounts.totalDiscount;
    this.amounts.totalTaxAmount = this.items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    this.amounts.grandTotal = this.amounts.taxableAmount +
        this.amounts.totalTaxAmount +
        this.amounts.freightCharges +
        this.amounts.packingCharges +
        this.amounts.installationCharges +
        this.amounts.otherCharges +
        this.amounts.roundingAdjustment;
    return this;
};
QuotationSchema.methods.createRevision = function (changes) {
    const revision = new this.constructor({
        ...this.toObject(),
        _id: undefined,
        quotationNumber: `${this.quotationNumber}-R${this.revision + 1}`,
        revision: this.revision + 1,
        parentQuotationId: this._id,
        status: 'draft',
        ...changes,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return revision.save();
};
QuotationSchema.methods.markAsConverted = function (convertedTo, convertedId, convertedNumber, conversionValue) {
    this.conversion.isConverted = true;
    this.conversion.convertedTo = convertedTo;
    this.conversion.convertedId = convertedId;
    this.conversion.convertedNumber = convertedNumber;
    this.conversion.convertedAt = new Date();
    this.conversion.conversionValue = conversionValue || this.amounts.grandTotal;
    this.status = 'converted';
    return this.save();
};
QuotationSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true }).sort({ quotationDate: -1 });
};
QuotationSchema.statics.findExpiringQuotations = function (companyId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.find({
        companyId,
        status: { $in: ['sent', 'acknowledged', 'negotiation'] },
        validUntil: { $lte: futureDate, $gt: new Date() },
        isActive: true
    }).sort({ validUntil: 1 });
};
QuotationSchema.statics.findByParty = function (companyId, partyId) {
    return this.find({
        companyId,
        'party.partyId': partyId,
        isActive: true
    }).sort({ quotationDate: -1 });
};
QuotationSchema.statics.getQuotationStats = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                quotationDate: { $gte: startDate, $lte: endDate },
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    status: '$status',
                    quotationType: '$quotationType'
                },
                count: { $sum: 1 },
                totalValue: { $sum: '$amounts.grandTotal' },
                avgValue: { $avg: '$amounts.grandTotal' },
                conversionRate: {
                    $avg: {
                        $cond: ['$conversion.isConverted', 1, 0]
                    }
                }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('Quotation', QuotationSchema);
//# sourceMappingURL=Quotation.js.map