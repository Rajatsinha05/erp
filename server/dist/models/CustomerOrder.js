"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PaymentHistorySchema = new mongoose_1.Schema({
    paymentDate: { type: Date },
    amount: { type: Number, min: 0 },
    paymentMethod: { type: String },
    referenceNumber: { type: String },
    remarks: { type: String }
}, { _id: false });
const DeliveryAddressSchema = new mongoose_1.Schema({
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' },
    landmark: { type: String }
}, { _id: false });
const CommunicationSchema = new mongoose_1.Schema({
    communicationType: {
        type: String,
        enum: ['email', 'phone', 'whatsapp', 'meeting', 'visit']
    },
    communicationDate: { type: Date },
    communicatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String },
    message: { type: String },
    attachments: [String],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
}, { _id: false });
const OrderItemSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem' },
    productType: {
        type: String,
        enum: ['saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom'],
        required: true
    },
    specifications: {
        design: { type: String },
        designCode: { type: String },
        color: { type: String },
        colorCode: { type: String },
        gsm: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        length: { type: Number, min: 0 },
        pattern: { type: String },
        finish: { type: String },
        customRequirements: { type: String },
        sampleApproved: { type: Boolean, default: false },
        sampleImages: [String]
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    rate: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, min: 0 },
    productionOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ProductionOrder' },
    productionStatus: {
        type: String,
        enum: ['pending', 'in_production', 'completed', 'quality_check', 'ready', 'dispatched'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_production', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    deliveryPriority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    qualityRequirements: {
        qualityGrade: { type: String },
        specialTests: [String],
        packingRequirements: { type: String },
        labelingRequirements: { type: String }
    },
    notes: { type: String }
});
const ApprovalSchema = new mongoose_1.Schema({
    level: { type: Number, default: 1 },
    approverRole: { type: String },
    approverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approverName: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedAt: { type: Date },
    remarks: { type: String }
}, { _id: false });
const CustomerOrderSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    customerName: { type: String },
    customerCode: { type: String },
    orderType: {
        type: String,
        enum: ['local', 'export', 'custom', 'sample', 'bulk', 'repeat'],
        required: true,
        index: true
    },
    orderSource: {
        type: String,
        enum: ['direct', 'meesho', 'indiamart', 'website', 'phone', 'email', 'whatsapp', 'exhibition'],
        required: true,
        index: true
    },
    orderItems: [OrderItemSchema],
    orderSummary: {
        subtotal: { type: Number, min: 0 },
        totalDiscount: { type: Number, default: 0, min: 0 },
        totalTax: { type: Number, min: 0 },
        shippingCharges: { type: Number, default: 0, min: 0 },
        packingCharges: { type: Number, default: 0, min: 0 },
        otherCharges: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, min: 0 },
        roundOffAmount: { type: Number, default: 0 },
        finalAmount: { type: Number, min: 0 }
    },
    payment: {
        paymentTerms: { type: String },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'credit'],
            default: 'bank_transfer'
        },
        creditDays: { type: Number, default: 0, min: 0 },
        advancePercentage: { type: Number, default: 0, min: 0, max: 100 },
        advanceAmount: { type: Number, default: 0, min: 0 },
        advanceReceived: { type: Number, default: 0, min: 0 },
        balanceAmount: { type: Number, min: 0 },
        paymentStatus: {
            type: String,
            enum: ['pending', 'advance_received', 'partial', 'paid', 'overdue'],
            default: 'pending',
            index: true
        },
        dueDate: { type: Date },
        paymentHistory: [PaymentHistorySchema]
    },
    delivery: {
        deliveryType: { type: String, enum: ['pickup', 'delivery', 'courier'], default: 'delivery' },
        deliveryAddress: DeliveryAddressSchema,
        expectedDeliveryDate: { type: Date },
        actualDeliveryDate: { type: Date },
        deliveryInstructions: { type: String },
        courierPreference: { type: String },
        shippingDetails: {
            courierCompany: { type: String },
            awbNumber: { type: String },
            trackingUrl: { type: String },
            shippingCost: { type: Number, min: 0 },
            estimatedDelivery: { type: Date }
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent', 'rush'],
        default: 'medium',
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'confirmed', 'in_production', 'ready_to_dispatch', 'dispatched', 'delivered', 'completed', 'cancelled', 'returned'],
        default: 'draft',
        index: true
    },
    approvals: [ApprovalSchema],
    communications: [CommunicationSchema],
    specialInstructions: { type: String },
    packingInstructions: { type: String },
    qualityInstructions: { type: String },
    deliveryInstructions: { type: String },
    salesPerson: {
        salesPersonId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        salesPersonName: { type: String },
        commission: { type: Number, min: 0 },
        commissionPercentage: { type: Number, min: 0, max: 100 }
    },
    referenceOrders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomerOrder' }],
    seasonality: { type: String },
    marketSegment: { type: String },
    notes: { type: String },
    tags: [String],
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'customer_orders'
});
CustomerOrderSchema.index({ companyId: 1, orderDate: -1 });
CustomerOrderSchema.index({ companyId: 1, customerId: 1, orderDate: -1 });
CustomerOrderSchema.index({ companyId: 1, status: 1, priority: 1 });
CustomerOrderSchema.index({ companyId: 1, orderType: 1, orderSource: 1 });
CustomerOrderSchema.index({ companyId: 1, 'payment.paymentStatus': 1 });
CustomerOrderSchema.index({ 'payment.dueDate': 1, 'payment.paymentStatus': 1 });
CustomerOrderSchema.index({ 'delivery.expectedDeliveryDate': 1, status: 1 });
CustomerOrderSchema.index({
    orderNumber: 'text',
    customerName: 'text',
    'orderItems.specifications.design': 'text',
    'orderItems.specifications.color': 'text'
});
CustomerOrderSchema.pre('save', function (next) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    this.orderItems.forEach(item => {
        const itemTotal = item.quantity * item.rate;
        const discountAmount = (itemTotal * item.discount) / 100;
        const taxableAmount = itemTotal - discountAmount;
        const taxAmount = (taxableAmount * item.taxRate) / 100;
        item.discountAmount = discountAmount;
        item.taxAmount = taxAmount;
        item.totalAmount = taxableAmount + taxAmount;
        subtotal += itemTotal;
        totalDiscount += discountAmount;
        totalTax += taxAmount;
    });
    this.orderSummary.subtotal = subtotal;
    this.orderSummary.totalDiscount = totalDiscount;
    this.orderSummary.totalTax = totalTax;
    this.orderSummary.totalAmount =
        subtotal -
            totalDiscount +
            totalTax +
            this.orderSummary.shippingCharges +
            this.orderSummary.packingCharges +
            this.orderSummary.otherCharges;
    this.orderSummary.finalAmount = this.orderSummary.totalAmount + this.orderSummary.roundOffAmount;
    this.payment.balanceAmount = this.orderSummary.finalAmount - this.payment.advanceReceived;
    if (this.payment.creditDays > 0 && !this.payment.dueDate) {
        this.payment.dueDate = new Date(this.orderDate.getTime() + (this.payment.creditDays * 24 * 60 * 60 * 1000));
    }
    next();
});
CustomerOrderSchema.methods.isOverdue = function () {
    if (!this.payment.dueDate)
        return false;
    return new Date() > this.payment.dueDate && this.payment.paymentStatus !== 'paid';
};
CustomerOrderSchema.methods.getCompletionPercentage = function () {
    const totalItems = this.orderItems.length;
    if (totalItems === 0)
        return 0;
    const completedItems = this.orderItems.filter(item => ['ready', 'dispatched', 'delivered'].includes(item.status)).length;
    return (completedItems / totalItems) * 100;
};
CustomerOrderSchema.methods.getTotalQuantity = function () {
    return this.orderItems.reduce((total, item) => total + item.quantity, 0);
};
CustomerOrderSchema.methods.addPayment = function (amount, method, reference) {
    this.payment.paymentHistory.push({
        paymentDate: new Date(),
        amount,
        paymentMethod: method,
        referenceNumber: reference,
        remarks: `Payment of ${amount} received via ${method}`
    });
    this.payment.advanceReceived += amount;
    this.payment.balanceAmount = Math.max(0, this.payment.balanceAmount - amount);
    if (this.payment.balanceAmount === 0) {
        this.payment.paymentStatus = 'paid';
    }
    else if (this.payment.advanceReceived > 0) {
        this.payment.paymentStatus = 'partial';
    }
};
CustomerOrderSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId }).sort({ orderDate: -1 });
};
CustomerOrderSchema.statics.findByCustomer = function (companyId, customerId) {
    return this.find({ companyId, customerId }).sort({ orderDate: -1 });
};
CustomerOrderSchema.statics.findOverdue = function (companyId) {
    return this.find({
        companyId,
        'payment.dueDate': { $lt: new Date() },
        'payment.paymentStatus': { $nin: ['paid'] }
    }).sort({ 'payment.dueDate': 1 });
};
CustomerOrderSchema.statics.findByStatus = function (companyId, status) {
    return this.find({ companyId, status }).sort({ orderDate: -1 });
};
CustomerOrderSchema.statics.getOrderStats = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                orderDate: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$orderSummary.finalAmount' },
                avgValue: { $avg: '$orderSummary.finalAmount' }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('CustomerOrder', CustomerOrderSchema);
//# sourceMappingURL=CustomerOrder.js.map