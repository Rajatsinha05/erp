"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InvoiceItemSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    description: { type: String },
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
            taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'CESS', 'TDS', 'TCS'], required: true },
            rate: { type: Number, required: true, min: 0, max: 100 },
            amount: { type: Number, required: true, min: 0 }
        }],
    totalTaxAmount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    notes: { type: String }
}, { _id: false });
const PaymentTermSchema = new mongoose_1.Schema({
    termType: { type: String, enum: ['immediate', 'net', 'eom', 'custom'], required: true },
    days: { type: Number, default: 0, min: 0 },
    description: { type: String },
    dueDate: { type: Date },
    earlyPaymentDiscount: {
        percentage: { type: Number, default: 0, min: 0, max: 100 },
        days: { type: Number, default: 0, min: 0 }
    }
}, { _id: false });
const InvoiceSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    invoiceDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    dueDate: { type: Date, required: true },
    financialYear: {
        type: String,
        required: true,
        index: true
    },
    invoiceType: {
        type: String,
        enum: ['sales', 'service', 'proforma', 'credit_note', 'debit_note', 'advance', 'final'],
        required: true,
        index: true
    },
    invoiceCategory: {
        type: String,
        enum: ['b2b', 'b2c', 'export', 'import', 'sez', 'deemed_export'],
        required: true
    },
    isReverseCharge: { type: Boolean, default: false },
    placeOfSupply: { type: String, required: true },
    customer: {
        customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
        customerCode: { type: String, required: true },
        customerName: { type: String, required: true },
        gstin: { type: String },
        pan: { type: String },
        billingAddress: {
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' }
        },
        shippingAddress: {
            addressLine1: { type: String },
            addressLine2: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            country: { type: String, default: 'India' }
        },
        contactPerson: { type: String },
        phone: { type: String },
        email: { type: String }
    },
    references: {
        salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomerOrder' },
        salesOrderNumber: { type: String },
        quotationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quotation' },
        quotationNumber: { type: String },
        deliveryNoteNumber: { type: String },
        purchaseOrderNumber: { type: String },
        purchaseOrderDate: { type: Date },
        dispatchDocumentNumber: { type: String },
        dispatchedThrough: { type: String },
        destination: { type: String },
        vehicleNumber: { type: String },
        lrNumber: { type: String },
        lrDate: { type: Date }
    },
    items: [InvoiceItemSchema],
    amounts: {
        subtotal: { type: Number, required: true, min: 0 },
        totalDiscount: { type: Number, default: 0, min: 0 },
        taxableAmount: { type: Number, required: true, min: 0 },
        totalTaxAmount: { type: Number, default: 0, min: 0 },
        roundingAdjustment: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true, min: 0 },
        advanceReceived: { type: Number, default: 0, min: 0 },
        balanceAmount: { type: Number, required: true, min: 0 }
    },
    taxDetails: {
        taxBreakup: [{
                taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'CESS', 'TDS', 'TCS'], required: true },
                rate: { type: Number, required: true, min: 0, max: 100 },
                taxableAmount: { type: Number, required: true, min: 0 },
                taxAmount: { type: Number, required: true, min: 0 }
            }],
        totalTaxAmount: { type: Number, default: 0, min: 0 },
        tdsAmount: { type: Number, default: 0, min: 0 },
        tcsAmount: { type: Number, default: 0, min: 0 }
    },
    paymentTerms: PaymentTermSchema,
    paymentMethod: {
        type: String,
        enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'card', 'credit', 'mixed'],
        default: 'credit'
    },
    bankDetails: {
        bankName: { type: String },
        branchName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        accountHolderName: { type: String }
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded'],
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
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partially_paid', 'paid', 'overdue', 'refunded'],
        default: 'unpaid',
        index: true
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    outstandingAmount: { type: Number, default: 0, min: 0 },
    lastPaymentDate: { type: Date },
    paymentHistory: [{
            paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FinancialTransaction' },
            paymentDate: { type: Date, required: true },
            amount: { type: Number, required: true, min: 0 },
            paymentMethod: { type: String, required: true },
            reference: { type: String },
            notes: { type: String }
        }],
    eInvoice: {
        isEInvoiceApplicable: { type: Boolean, default: false },
        irn: { type: String },
        ackNumber: { type: String },
        ackDate: { type: Date },
        qrCode: { type: String },
        signedInvoice: { type: String },
        signedQrCode: { type: String },
        status: { type: String, enum: ['pending', 'generated', 'cancelled'], default: 'pending' },
        errorMessage: { type: String }
    },
    eWayBill: {
        isEWayBillRequired: { type: Boolean, default: false },
        eWayBillNumber: { type: String },
        generatedDate: { type: Date },
        validUntil: { type: Date },
        vehicleNumber: { type: String },
        transporterId: { type: String },
        transporterName: { type: String },
        distance: { type: Number, min: 0 },
        status: { type: String, enum: ['pending', 'generated', 'cancelled'], default: 'pending' }
    },
    terms: { type: String },
    notes: { type: String },
    internalNotes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    salesPersonId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    salesPersonName: { type: String },
    isActive: { type: Boolean, default: true, index: true }
}, {
    timestamps: true,
    collection: 'invoices'
});
InvoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ companyId: 1, invoiceDate: -1 });
InvoiceSchema.index({ companyId: 1, 'customer.customerId': 1, invoiceDate: -1 });
InvoiceSchema.index({ companyId: 1, status: 1, invoiceDate: -1 });
InvoiceSchema.index({ companyId: 1, paymentStatus: 1, dueDate: 1 });
InvoiceSchema.index({ companyId: 1, financialYear: 1 });
InvoiceSchema.index({ dueDate: 1, paymentStatus: 1 });
InvoiceSchema.index({
    invoiceNumber: 'text',
    'customer.customerName': 'text',
    'customer.customerCode': 'text'
});
InvoiceSchema.pre('save', function (next) {
    if (!this.financialYear) {
        const invoiceYear = this.invoiceDate.getFullYear();
        const invoiceMonth = this.invoiceDate.getMonth() + 1;
        if (invoiceMonth >= 4) {
            this.financialYear = `${invoiceYear}-${invoiceYear + 1}`;
        }
        else {
            this.financialYear = `${invoiceYear - 1}-${invoiceYear}`;
        }
    }
    this.outstandingAmount = this.amounts.grandTotal - this.paidAmount;
    if (this.paidAmount === 0) {
        this.paymentStatus = 'unpaid';
    }
    else if (this.paidAmount >= this.amounts.grandTotal) {
        this.paymentStatus = 'paid';
    }
    else {
        this.paymentStatus = 'partially_paid';
    }
    if (this.paymentStatus !== 'paid' && this.dueDate < new Date()) {
        this.paymentStatus = 'overdue';
    }
    if (!this.customer.shippingAddress.addressLine1) {
        this.customer.shippingAddress = this.customer.billingAddress;
    }
    next();
});
InvoiceSchema.methods.isOverdue = function () {
    return this.paymentStatus === 'overdue' ||
        (this.paymentStatus !== 'paid' && this.dueDate < new Date());
};
InvoiceSchema.methods.getDaysOverdue = function () {
    if (!this.isOverdue())
        return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
InvoiceSchema.methods.addPayment = function (paymentData) {
    this.paymentHistory.push({
        paymentDate: paymentData.paymentDate || new Date(),
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        notes: paymentData.notes
    });
    this.paidAmount += paymentData.amount;
    this.lastPaymentDate = paymentData.paymentDate || new Date();
    return this.save();
};
InvoiceSchema.methods.calculateTotals = function () {
    this.amounts.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    this.amounts.totalDiscount = this.items.reduce((sum, item) => sum + item.discountAmount, 0);
    this.amounts.taxableAmount = this.amounts.subtotal - this.amounts.totalDiscount;
    this.amounts.totalTaxAmount = this.items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    this.amounts.grandTotal = this.amounts.taxableAmount + this.amounts.totalTaxAmount + this.amounts.roundingAdjustment;
    this.amounts.balanceAmount = this.amounts.grandTotal - this.amounts.advanceReceived;
    return this;
};
InvoiceSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true }).sort({ invoiceDate: -1 });
};
InvoiceSchema.statics.findOverdueInvoices = function (companyId) {
    return this.find({
        companyId,
        paymentStatus: { $in: ['unpaid', 'partially_paid'] },
        dueDate: { $lt: new Date() },
        isActive: true
    }).sort({ dueDate: 1 });
};
InvoiceSchema.statics.findByCustomer = function (companyId, customerId) {
    return this.find({
        companyId,
        'customer.customerId': customerId,
        isActive: true
    }).sort({ invoiceDate: -1 });
};
InvoiceSchema.statics.getInvoiceStats = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                invoiceDate: { $gte: startDate, $lte: endDate },
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    status: '$status',
                    paymentStatus: '$paymentStatus'
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amounts.grandTotal' },
                paidAmount: { $sum: '$paidAmount' },
                outstandingAmount: { $sum: '$outstandingAmount' }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('Invoice', InvoiceSchema);
//# sourceMappingURL=Invoice.js.map