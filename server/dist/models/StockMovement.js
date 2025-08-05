"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MovementLocationSchema = new mongoose_1.Schema({
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
    warehouseName: { type: String },
    zone: { type: String },
    rack: { type: String },
    bin: { type: String },
    isExternal: { type: Boolean, default: false },
    externalLocation: { type: String }
}, { _id: false });
const StockMovementSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    movementNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    movementDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    itemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
        index: true
    },
    itemCode: { type: String },
    itemName: { type: String },
    movementType: {
        type: String,
        enum: ['inward', 'outward', 'transfer', 'adjustment', 'production_consume', 'production_output', 'return', 'damage', 'theft'],
        required: true,
        index: true
    },
    referenceDocument: {
        documentType: {
            type: String,
            enum: ['purchase_order', 'sales_order', 'production_order', 'transfer_note', 'adjustment_note', 'return_note']
        },
        documentId: { type: mongoose_1.Schema.Types.ObjectId },
        documentNumber: { type: String }
    },
    quantity: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v !== 0;
            },
            message: 'Quantity cannot be zero'
        }
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    rate: {
        type: Number,
        min: 0
    },
    totalValue: {
        type: Number,
        min: 0
    },
    fromLocation: MovementLocationSchema,
    toLocation: MovementLocationSchema,
    batchDetails: {
        batchNumber: { type: String },
        lotNumber: { type: String },
        serialNumbers: [String],
        manufacturingDate: { type: Date },
        expiryDate: { type: Date },
        supplierBatch: { type: String }
    },
    qualityCheck: {
        isRequired: { type: Boolean, default: false },
        isCompleted: { type: Boolean, default: false },
        checkedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        checkedAt: { type: Date },
        qualityGrade: { type: String },
        defects: [String],
        rejectedQuantity: { type: Number, default: 0, min: 0 },
        acceptedQuantity: { type: Number, min: 0 },
        qualityNotes: { type: String },
        qualityImages: [String]
    },
    gatePass: {
        gatePassNumber: { type: String },
        vehicleNumber: { type: String },
        driverName: { type: String },
        driverPhone: { type: String },
        driverLicense: { type: String },
        transporterName: { type: String },
        securityApproval: {
            approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            approvedAt: { type: Date },
            remarks: { type: String },
            documentsVerified: [String]
        }
    },
    stockImpact: {
        stockBefore: { type: Number, min: 0 },
        stockAfter: { type: Number, min: 0 },
        reservedBefore: { type: Number, min: 0 },
        reservedAfter: { type: Number, min: 0 },
        availableBefore: { type: Number, min: 0 },
        availableAfter: { type: Number, min: 0 }
    },
    costImpact: {
        costBefore: { type: Number, min: 0 },
        costAfter: { type: Number, min: 0 },
        totalValueBefore: { type: Number, min: 0 },
        totalValueAfter: { type: Number, min: 0 },
        costMethod: { type: String }
    },
    approval: {
        isRequired: { type: Boolean, default: false },
        requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date },
        approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date },
        approvalLevel: { type: Number, default: 1 },
        approvalNotes: { type: String },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved'
        }
    },
    reason: { type: String },
    notes: { type: String },
    attachments: [String],
    tags: [String],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'stock_movements'
});
StockMovementSchema.index({ companyId: 1, movementDate: -1 });
StockMovementSchema.index({ companyId: 1, itemId: 1, movementDate: -1 });
StockMovementSchema.index({ companyId: 1, movementType: 1, movementDate: -1 });
StockMovementSchema.index({ 'referenceDocument.documentType': 1, 'referenceDocument.documentNumber': 1 });
StockMovementSchema.index({ 'batchDetails.batchNumber': 1, movementDate: -1 });
StockMovementSchema.index({ companyId: 1, 'approval.status': 1, 'approval.isRequired': 1 });
StockMovementSchema.index({ movementNumber: 1 }, { unique: true });
StockMovementSchema.pre('save', function (next) {
    if (this.rate && !this.totalValue) {
        this.totalValue = Math.abs(this.quantity) * this.rate;
    }
    if (this.qualityCheck?.isCompleted && !this.qualityCheck.acceptedQuantity) {
        this.qualityCheck.acceptedQuantity = Math.abs(this.quantity) - (this.qualityCheck.rejectedQuantity || 0);
    }
    next();
});
StockMovementSchema.methods.isInward = function () {
    return ['inward', 'production_output', 'return'].includes(this.movementType);
};
StockMovementSchema.methods.isOutward = function () {
    return ['outward', 'production_consume', 'damage', 'theft'].includes(this.movementType);
};
StockMovementSchema.methods.requiresApproval = function () {
    return this.approval?.isRequired || false;
};
StockMovementSchema.methods.isPending = function () {
    return this.approval?.status === 'pending';
};
StockMovementSchema.methods.isApproved = function () {
    return this.approval?.status === 'approved';
};
StockMovementSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId }).sort({ movementDate: -1 });
};
StockMovementSchema.statics.findByItem = function (companyId, itemId) {
    return this.find({ companyId, itemId }).sort({ movementDate: -1 });
};
StockMovementSchema.statics.findByDateRange = function (companyId, startDate, endDate) {
    return this.find({
        companyId,
        movementDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ movementDate: -1 });
};
StockMovementSchema.statics.findPendingApprovals = function (companyId) {
    return this.find({
        companyId,
        'approval.isRequired': true,
        'approval.status': 'pending'
    }).sort({ createdAt: 1 });
};
StockMovementSchema.statics.findByBatch = function (batchNumber) {
    return this.find({
        'batchDetails.batchNumber': batchNumber
    }).sort({ movementDate: -1 });
};
StockMovementSchema.statics.getMovementSummary = function (companyId, itemId) {
    return this.aggregate([
        {
            $match: { companyId: new mongoose_1.Schema.Types.ObjectId(companyId), itemId: new mongoose_1.Schema.Types.ObjectId(itemId) }
        },
        {
            $group: {
                _id: '$movementType',
                totalQuantity: { $sum: '$quantity' },
                totalValue: { $sum: '$totalValue' },
                count: { $sum: 1 }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('StockMovement', StockMovementSchema);
//# sourceMappingURL=StockMovement.js.map