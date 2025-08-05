"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryBatch = void 0;
const mongoose_1 = require("mongoose");
const InventoryBatchSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    itemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
        index: true
    },
    batchNumber: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    lotNumber: { type: String, trim: true },
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date },
    receivedDate: { type: Date, required: true, default: Date.now },
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierBatchNumber: { type: String, trim: true },
    initialQuantity: { type: Number, required: true, min: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, required: true, trim: true },
    locations: [{
            warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
            warehouseName: { type: String, required: true },
            zone: { type: String },
            rack: { type: String },
            bin: { type: String },
            quantity: { type: Number, required: true, min: 0 },
            lastUpdated: { type: Date, default: Date.now }
        }],
    qualityGrade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C', 'Reject'],
        default: 'A',
        index: true
    },
    qualityScore: { type: Number, min: 0, max: 100, default: 100 },
    qualityNotes: { type: String },
    qualityCheckDate: { type: Date },
    qualityCheckedBy: { type: String },
    specifications: {
        gsm: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        length: { type: Number, min: 0 },
        color: { type: String, trim: true },
        colorCode: { type: String, trim: true },
        design: { type: String, trim: true },
        pattern: { type: String, trim: true },
        fabricComposition: { type: String, trim: true },
        shrinkage: { type: Number, min: 0, max: 100 },
        colorFastness: { type: Number, min: 1, max: 5 },
        tensileStrength: { type: Number, min: 0 }
    },
    processStage: {
        type: String,
        enum: ['grey', 'printed', 'washed', 'fixed', 'finished'],
        index: true
    },
    processHistory: [{
            stage: { type: String, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date },
            operator: { type: String },
            machineId: { type: String },
            notes: { type: String },
            qualityCheck: {
                grade: { type: String },
                score: { type: Number, min: 0, max: 100 },
                notes: { type: String },
                checkedBy: { type: String },
                checkDate: { type: Date }
            }
        }],
    costPerUnit: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    additionalCosts: [{
            type: { type: String, required: true },
            description: { type: String, required: true },
            amount: { type: Number, required: true, min: 0 },
            date: { type: Date, required: true, default: Date.now }
        }],
    status: {
        type: String,
        enum: ['active', 'consumed', 'expired', 'damaged', 'returned'],
        default: 'active',
        index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'inventory_batches'
});
InventoryBatchSchema.index({ companyId: 1, batchNumber: 1 }, { unique: true });
InventoryBatchSchema.index({ companyId: 1, itemId: 1 });
InventoryBatchSchema.index({ companyId: 1, processStage: 1 });
InventoryBatchSchema.index({ companyId: 1, qualityGrade: 1 });
InventoryBatchSchema.index({ companyId: 1, status: 1 });
InventoryBatchSchema.index({ companyId: 1, expiryDate: 1 });
InventoryBatchSchema.index({ companyId: 1, 'specifications.gsm': 1 });
InventoryBatchSchema.index({ companyId: 1, 'specifications.color': 1 });
exports.InventoryBatch = (0, mongoose_1.model)('InventoryBatch', InventoryBatchSchema);
//# sourceMappingURL=InventoryBatch.js.map