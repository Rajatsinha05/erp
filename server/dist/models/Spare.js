"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SpareCompatibilitySchema = new mongoose_1.Schema({
    equipmentType: { type: String, required: true, trim: true },
    equipmentModel: { type: String, required: true, trim: true },
    equipmentBrand: { type: String, required: true, trim: true },
    equipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' },
    isUniversal: { type: Boolean, default: false }
}, { _id: false });
const SpareSupplierSchema = new mongoose_1.Schema({
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true, trim: true },
    supplierCode: { type: String, required: true, trim: true },
    partNumber: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
    leadTime: { type: Number, required: true, min: 0 },
    minOrderQuantity: { type: Number, required: true, min: 0 },
    lastSupplyDate: { type: Date },
    lastSupplyRate: { type: Number, min: 0 },
    qualityRating: { type: Number, required: true, min: 1, max: 5 },
    warrantyPeriod: { type: Number, min: 0 }
}, { _id: false });
const SpareLocationSchema = new mongoose_1.Schema({
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
    warehouseName: { type: String, trim: true },
    zone: { type: String, trim: true },
    rack: { type: String, trim: true },
    bin: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const MaintenanceScheduleSchema = new mongoose_1.Schema({
    scheduleType: {
        type: String,
        required: true,
        enum: ['preventive', 'predictive', 'corrective']
    },
    frequency: { type: Number, required: true, min: 1 },
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    maintenanceNotes: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const SpareUsageHistorySchema = new mongoose_1.Schema({
    usedDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    equipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' },
    equipmentName: { type: String, trim: true },
    workOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'WorkOrder' },
    workOrderNumber: { type: String, trim: true },
    usedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    usedByName: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true }
}, { _id: false });
const SpareSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    spareCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        maxlength: 100
    },
    spareName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    spareDescription: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: ['mechanical', 'electrical', 'electronic', 'hydraulic', 'pneumatic', 'consumable', 'tool', 'safety', 'other']
    },
    subCategory: {
        type: String,
        trim: true,
        maxlength: 100
    },
    partNumber: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    manufacturerPartNumber: {
        type: String,
        trim: true,
        maxlength: 100
    },
    alternatePartNumbers: [{
            type: String,
            trim: true,
            maxlength: 100
        }],
    manufacturer: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    brand: {
        type: String,
        trim: true,
        maxlength: 100
    },
    spareModel: {
        type: String,
        trim: true,
        maxlength: 100
    },
    specifications: {
        dimensions: {
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            height: { type: Number, min: 0 },
            diameter: { type: Number, min: 0 },
            unit: { type: String, default: 'mm', trim: true }
        },
        weight: {
            value: { type: Number, min: 0 },
            unit: { type: String, default: 'kg', trim: true }
        },
        material: { type: String, trim: true },
        color: { type: String, trim: true },
        finish: { type: String, trim: true }
    },
    compatibility: [SpareCompatibilitySchema],
    stock: {
        currentStock: { type: Number, required: true, min: 0, default: 0 },
        reservedStock: { type: Number, required: true, min: 0, default: 0 },
        availableStock: { type: Number, required: true, min: 0, default: 0 },
        inTransitStock: { type: Number, required: true, min: 0, default: 0 },
        damagedStock: { type: Number, required: true, min: 0, default: 0 },
        unit: { type: String, required: true, trim: true },
        alternateUnit: { type: String, trim: true },
        conversionFactor: { type: Number, min: 0 },
        reorderLevel: { type: Number, required: true, min: 0 },
        minStockLevel: { type: Number, required: true, min: 0 },
        maxStockLevel: { type: Number, required: true, min: 0 },
        economicOrderQuantity: { type: Number, min: 0 },
        averageCost: { type: Number, required: true, min: 0, default: 0 },
        totalValue: { type: Number, required: true, min: 0, default: 0 }
    },
    locations: [SpareLocationSchema],
    pricing: {
        costPrice: { type: Number, min: 0 },
        standardCost: { type: Number, min: 0 },
        lastPurchasePrice: { type: Number, min: 0 },
        averagePurchasePrice: { type: Number, min: 0 },
        currency: { type: String, required: true, default: 'INR', trim: true }
    },
    suppliers: [SpareSupplierSchema],
    maintenance: {
        isConsumable: { type: Boolean, required: true, default: false },
        expectedLifespan: { type: Number, min: 0 },
        maintenanceSchedule: MaintenanceScheduleSchema,
        criticality: {
            type: String,
            required: true,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        failureRate: { type: Number, min: 0, max: 100 },
        mtbf: { type: Number, min: 0 }
    },
    usage: {
        totalUsed: { type: Number, required: true, min: 0, default: 0 },
        averageMonthlyUsage: { type: Number, required: true, min: 0, default: 0 },
        lastUsedDate: { type: Date },
        usageHistory: [SpareUsageHistorySchema]
    },
    quality: {
        qualityGrade: {
            type: String,
            required: true,
            enum: ['A+', 'A', 'B+', 'B', 'C'],
            default: 'A'
        },
        qualityCheckRequired: { type: Boolean, required: true, default: false },
        qualityParameters: [{ type: String, trim: true }],
        lastQualityCheck: { type: Date },
        qualityNotes: { type: String, trim: true },
        certifications: [{ type: String, trim: true }],
        complianceStandards: [{ type: String, trim: true }]
    },
    storage: {
        storageConditions: { type: String, trim: true },
        temperatureRange: {
            min: { type: Number },
            max: { type: Number },
            unit: { type: String, default: 'C', trim: true }
        },
        humidityRange: {
            min: { type: Number, min: 0, max: 100 },
            max: { type: Number, min: 0, max: 100 }
        },
        specialHandling: { type: String, trim: true },
        shelfLife: { type: Number, min: 0 },
        expiryDate: { type: Date }
    },
    documentation: {
        images: [{ type: String, trim: true }],
        manuals: [{ type: String, trim: true }],
        drawings: [{ type: String, trim: true }],
        certificates: [{ type: String, trim: true }],
        notes: { type: String, trim: true }
    },
    status: {
        isActive: { type: Boolean, required: true, default: true },
        isDiscontinued: { type: Boolean, required: true, default: false },
        isCritical: { type: Boolean, required: true, default: false },
        isObsolete: { type: Boolean, required: true, default: false },
        requiresApproval: { type: Boolean, required: true, default: false },
        isHazardous: { type: Boolean, required: true, default: false }
    },
    tracking: {
        lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        lastStockUpdate: { type: Date },
        lastMovementDate: { type: Date },
        totalInward: { type: Number, required: true, min: 0, default: 0 },
        totalOutward: { type: Number, required: true, min: 0, default: 0 },
        totalAdjustments: { type: Number, required: true, default: 0 }
    }
}, {
    timestamps: true,
    collection: 'spares'
});
SpareSchema.index({ companyId: 1, spareCode: 1 }, { unique: true });
SpareSchema.index({ companyId: 1, spareName: 1 });
SpareSchema.index({ companyId: 1, partNumber: 1 });
SpareSchema.index({ companyId: 1, category: 1 });
SpareSchema.index({ companyId: 1, manufacturer: 1 });
SpareSchema.index({ companyId: 1, 'status.isActive': 1 });
SpareSchema.index({ companyId: 1, 'maintenance.criticality': 1 });
SpareSchema.index({ companyId: 1, 'stock.currentStock': 1 });
SpareSchema.pre('save', function (next) {
    if (this.isModified('stock')) {
        this.stock.availableStock = this.stock.currentStock - this.stock.reservedStock;
        this.stock.totalValue = this.stock.currentStock * this.stock.averageCost;
    }
    next();
});
SpareSchema.virtual('isLowStock').get(function () {
    return this.stock.currentStock <= this.stock.reorderLevel;
});
SpareSchema.virtual('isOutOfStock').get(function () {
    return this.stock.currentStock === 0;
});
SpareSchema.virtual('isCriticalLowStock').get(function () {
    return this.stock.currentStock <= this.stock.minStockLevel;
});
SpareSchema.set('toJSON', { virtuals: true });
SpareSchema.set('toObject', { virtuals: true });
const Spare = (0, mongoose_1.model)('Spare', SpareSchema);
exports.default = Spare;
//# sourceMappingURL=Spare.js.map