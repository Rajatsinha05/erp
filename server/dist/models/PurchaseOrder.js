"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseOrderItemSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    description: { type: String },
    specifications: { type: String },
    hsnCode: { type: String },
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
    receivedQuantity: { type: Number, default: 0, min: 0 },
    pendingQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    deliveryDate: { type: Date },
    notes: { type: String }
}, { _id: false });
const DeliveryScheduleSchema = new mongoose_1.Schema({
    scheduleNumber: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    items: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
            quantity: { type: Number, required: true, min: 0 },
            deliveredQuantity: { type: Number, default: 0, min: 0 },
            status: { type: String, enum: ['pending', 'partial', 'delivered', 'delayed'], default: 'pending' }
        }],
    deliveryAddress: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    contactPerson: { type: String },
    contactPhone: { type: String },
    specialInstructions: { type: String },
    status: { type: String, enum: ['scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled'], default: 'scheduled' },
    actualDeliveryDate: { type: Date },
    deliveryNoteNumber: { type: String },
    transportDetails: {
        transporterName: { type: String },
        vehicleNumber: { type: String },
        driverName: { type: String },
        driverPhone: { type: String },
        lrNumber: { type: String },
        trackingNumber: { type: String }
    },
    notes: { type: String }
}, { _id: false });
const PurchaseOrderSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    poNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    poDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    expectedDeliveryDate: { type: Date, required: true },
    financialYear: {
        type: String,
        required: true,
        index: true
    },
    poType: {
        type: String,
        enum: ['standard', 'blanket', 'contract', 'planned', 'emergency', 'service', 'capital'],
        required: true,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    category: {
        type: String,
        enum: ['raw_material', 'finished_goods', 'consumables', 'services', 'capital_goods', 'maintenance'],
        required: true
    },
    supplier: {
        supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
        supplierCode: { type: String, required: true },
        supplierName: { type: String, required: true },
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
    deliveryInfo: {
        deliveryAddress: {
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' }
        },
        warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
        warehouseName: { type: String },
        contactPerson: { type: String, required: true },
        contactPhone: { type: String, required: true },
        deliveryInstructions: { type: String },
        workingHours: { type: String },
        deliveryType: { type: String, enum: ['standard', 'express', 'scheduled'], default: 'standard' }
    },
    references: {
        requisitionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PurchaseRequisition' },
        requisitionNumber: { type: String },
        quotationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quotation' },
        quotationNumber: { type: String },
        contractId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contract' },
        contractNumber: { type: String },
        budgetCode: { type: String },
        projectCode: { type: String },
        costCenter: { type: String }
    },
    items: [PurchaseOrderItemSchema],
    amounts: {
        subtotal: { type: Number, required: true, min: 0 },
        totalDiscount: { type: Number, default: 0, min: 0 },
        taxableAmount: { type: Number, required: true, min: 0 },
        totalTaxAmount: { type: Number, default: 0, min: 0 },
        freightCharges: { type: Number, default: 0, min: 0 },
        packingCharges: { type: Number, default: 0, min: 0 },
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
    paymentTerms: {
        termType: { type: String, enum: ['advance', 'net', 'cod', 'credit', 'milestone'], required: true },
        days: { type: Number, default: 0, min: 0 },
        advancePercentage: { type: Number, default: 0, min: 0, max: 100 },
        description: { type: String },
        milestones: [{
                milestone: { type: String },
                percentage: { type: Number, min: 0, max: 100 },
                amount: { type: Number, min: 0 },
                dueDate: { type: Date }
            }]
    },
    deliverySchedules: [DeliveryScheduleSchema],
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'in_progress', 'partially_received', 'completed', 'cancelled', 'closed'],
        default: 'draft',
        index: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalWorkflow: [{
            level: { type: Number, required: true },
            approverRole: { type: String, required: true },
            approverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            approverName: { type: String },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            approvedAt: { type: Date },
            comments: { type: String }
        }],
    sentAt: { type: Date },
    sentBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    acknowledgedBy: { type: String },
    receivingStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'over_received'],
        default: 'pending',
        index: true
    },
    totalReceived: { type: Number, default: 0, min: 0 },
    totalPending: { type: Number, default: 0, min: 0 },
    lastReceivedDate: { type: Date },
    qualityRequirements: {
        inspectionRequired: { type: Boolean, default: false },
        qualityParameters: [String],
        acceptanceCriteria: { type: String },
        inspectionLocation: { type: String, enum: ['supplier', 'incoming', 'third_party'] },
        qualityCertificates: [String],
        testReports: [String]
    },
    performance: {
        onTimeDelivery: { type: Boolean },
        qualityRating: { type: Number, min: 1, max: 5 },
        supplierRating: { type: Number, min: 1, max: 5 },
        deliveryRating: { type: Number, min: 1, max: 5 },
        overallRating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        issues: [String],
        improvements: [String]
    },
    terms: { type: String },
    notes: { type: String },
    internalNotes: { type: String },
    specialInstructions: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    buyerName: { type: String },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String },
    isActive: { type: Boolean, default: true, index: true }
}, {
    timestamps: true,
    collection: 'purchase_orders'
});
PurchaseOrderSchema.index({ companyId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ companyId: 1, poDate: -1 });
PurchaseOrderSchema.index({ companyId: 1, 'supplier.supplierId': 1, poDate: -1 });
PurchaseOrderSchema.index({ companyId: 1, status: 1, poDate: -1 });
PurchaseOrderSchema.index({ companyId: 1, receivingStatus: 1, expectedDeliveryDate: 1 });
PurchaseOrderSchema.index({ companyId: 1, financialYear: 1 });
PurchaseOrderSchema.index({ expectedDeliveryDate: 1, status: 1 });
PurchaseOrderSchema.index({
    poNumber: 'text',
    'supplier.supplierName': 'text',
    'supplier.supplierCode': 'text'
});
PurchaseOrderSchema.pre('save', function (next) {
    if (!this.financialYear) {
        const poYear = this.poDate.getFullYear();
        const poMonth = this.poDate.getMonth() + 1;
        if (poMonth >= 4) {
            this.financialYear = `${poYear}-${poYear + 1}`;
        }
        else {
            this.financialYear = `${poYear - 1}-${poYear}`;
        }
    }
    this.items.forEach(item => {
        item.pendingQuantity = item.quantity - item.receivedQuantity - item.rejectedQuantity;
    });
    this.totalPending = this.items.reduce((sum, item) => sum + item.pendingQuantity, 0);
    this.totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    if (this.totalReceived === 0) {
        this.receivingStatus = 'pending';
    }
    else if (this.totalPending > 0) {
        this.receivingStatus = 'partial';
    }
    else {
        this.receivingStatus = 'completed';
    }
    next();
});
PurchaseOrderSchema.methods.isOverdue = function () {
    return this.status !== 'completed' &&
        this.status !== 'cancelled' &&
        this.expectedDeliveryDate < new Date();
};
PurchaseOrderSchema.methods.getDaysOverdue = function () {
    if (!this.isOverdue())
        return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.expectedDeliveryDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
PurchaseOrderSchema.methods.calculateTotals = function () {
    this.amounts.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    this.amounts.totalDiscount = this.items.reduce((sum, item) => sum + item.discountAmount, 0);
    this.amounts.taxableAmount = this.amounts.subtotal - this.amounts.totalDiscount;
    this.amounts.totalTaxAmount = this.items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    this.amounts.grandTotal = this.amounts.taxableAmount +
        this.amounts.totalTaxAmount +
        this.amounts.freightCharges +
        this.amounts.packingCharges +
        this.amounts.otherCharges +
        this.amounts.roundingAdjustment;
    return this;
};
PurchaseOrderSchema.methods.addReceiving = function (itemId, receivedQuantity, rejectedQuantity = 0) {
    const item = this.items.find(item => item.itemId.toString() === itemId);
    if (item) {
        item.receivedQuantity += receivedQuantity;
        item.rejectedQuantity += rejectedQuantity;
        this.lastReceivedDate = new Date();
    }
    return this.save();
};
PurchaseOrderSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true }).sort({ poDate: -1 });
};
PurchaseOrderSchema.statics.findOverduePOs = function (companyId) {
    return this.find({
        companyId,
        status: { $nin: ['completed', 'cancelled', 'closed'] },
        expectedDeliveryDate: { $lt: new Date() },
        isActive: true
    }).sort({ expectedDeliveryDate: 1 });
};
PurchaseOrderSchema.statics.findBySupplier = function (companyId, supplierId) {
    return this.find({
        companyId,
        'supplier.supplierId': supplierId,
        isActive: true
    }).sort({ poDate: -1 });
};
PurchaseOrderSchema.statics.getPOStats = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                poDate: { $gte: startDate, $lte: endDate },
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    status: '$status',
                    receivingStatus: '$receivingStatus'
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amounts.grandTotal' },
                avgAmount: { $avg: '$amounts.grandTotal' }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('PurchaseOrder', PurchaseOrderSchema);
//# sourceMappingURL=PurchaseOrder.js.map