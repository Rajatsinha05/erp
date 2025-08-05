"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ItemLocationSchema = new mongoose_1.Schema({
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
    warehouseName: { type: String },
    zone: { type: String },
    rack: { type: String },
    bin: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const ItemSupplierSchema = new mongoose_1.Schema({
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    supplierCode: { type: String },
    isPrimary: { type: Boolean, default: false },
    leadTime: { type: Number, min: 0 },
    minOrderQuantity: { type: Number, min: 0 },
    lastSupplyDate: { type: Date },
    lastSupplyRate: { type: Number, min: 0 },
    qualityRating: { type: Number, min: 0, max: 5 }
}, { _id: false });
const InventoryItemSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    itemCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        maxlength: 100
    },
    itemName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    itemDescription: {
        type: String,
        maxlength: 1000
    },
    barcode: {
        type: String,
        maxlength: 50
    },
    qrCode: {
        type: String,
        maxlength: 100
    },
    companyItemCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    internalSKU: {
        type: String,
        uppercase: true,
        trim: true
    },
    category: {
        primary: {
            type: String,
            enum: ['raw_material', 'semi_finished', 'finished_goods', 'consumables', 'spare_parts'],
            required: true,
            index: true
        },
        secondary: { type: String },
        tertiary: { type: String }
    },
    productType: {
        type: String,
        enum: ['saree', 'african', 'garment', 'digital_print', 'custom', 'chemical', 'dye', 'machinery', 'yarn', 'thread'],
        index: true
    },
    designInfo: {
        designNumber: { type: String, trim: true, index: true },
        designName: { type: String, trim: true },
        designCategory: { type: String, trim: true },
        season: { type: String, enum: ['spring', 'summer', 'monsoon', 'winter', 'all_season'] },
        collection: { type: String, trim: true },
        artworkFile: { type: String },
        colorVariants: [{ type: String }],
        sizeVariants: [{ type: String }],
    },
    specifications: {
        gsm: { type: Number, min: 0, index: true },
        width: { type: Number, min: 0 },
        length: { type: Number, min: 0 },
        weight: { type: Number, min: 0 },
        color: { type: String, trim: true, index: true },
        colorCode: { type: String, trim: true },
        design: { type: String, trim: true },
        pattern: { type: String, trim: true },
        fabricComposition: { type: String, trim: true },
        threadCount: { type: Number, min: 0 },
        weaveType: { type: String, enum: ['plain', 'twill', 'satin', 'jacquard', 'dobby', 'other'] },
        finish: { type: String, trim: true },
        tensileStrength: { type: Number, min: 0 },
        shrinkage: { type: Number, min: 0, max: 100 },
        colorFastness: { type: Number, min: 1, max: 5 },
        pilling: { type: Number, min: 1, max: 5 },
        concentration: { type: Number, min: 0, max: 100 },
        purity: { type: Number, min: 0, max: 100 },
        phLevel: { type: Number, min: 0, max: 14 },
        batchNumber: { type: String, trim: true, index: true },
        lotNumber: { type: String, trim: true },
        manufacturingDate: { type: Date },
        expiryDate: { type: Date },
        customAttributes: { type: mongoose_1.Schema.Types.Mixed }
    },
    stock: {
        currentStock: { type: Number, default: 0, min: 0, index: true },
        reservedStock: { type: Number, default: 0, min: 0 },
        availableStock: { type: Number, default: 0, min: 0 },
        inTransitStock: { type: Number, default: 0, min: 0 },
        damagedStock: { type: Number, default: 0, min: 0 },
        unit: { type: String, required: true, trim: true },
        alternateUnit: { type: String, trim: true },
        conversionFactor: { type: Number, default: 1, min: 0 },
        reorderLevel: { type: Number, default: 0, min: 0 },
        minStockLevel: { type: Number, default: 0, min: 0 },
        maxStockLevel: { type: Number, default: 0, min: 0 },
        economicOrderQuantity: { type: Number, min: 0 },
        valuationMethod: {
            type: String,
            enum: ['FIFO', 'LIFO', 'Weighted Average'],
            default: 'FIFO'
        },
        averageCost: { type: Number, default: 0, min: 0 },
        totalValue: { type: Number, default: 0, min: 0 }
    },
    locations: [ItemLocationSchema],
    pricing: {
        costPrice: { type: Number, min: 0 },
        standardCost: { type: Number, min: 0 },
        lastPurchasePrice: { type: Number, min: 0 },
        averagePurchasePrice: { type: Number, min: 0 },
        sellingPrice: { type: Number, min: 0 },
        mrp: { type: Number, min: 0 },
        marginPercentage: { type: Number, min: 0, max: 100 },
        currency: { type: String, default: 'INR' }
    },
    suppliers: [ItemSupplierSchema],
    quality: {
        qualityGrade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C'],
            default: 'A'
        },
        defectPercentage: { type: Number, default: 0, min: 0, max: 100 },
        qualityCheckRequired: { type: Boolean, default: true },
        qualityParameters: [String],
        lastQualityCheck: { type: Date },
        qualityNotes: { type: String },
        certifications: [String]
    },
    manufacturing: {
        bomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BillOfMaterial' },
        manufacturingCost: { type: Number, min: 0 },
        laborCost: { type: Number, min: 0 },
        overheadCost: { type: Number, min: 0 },
        manufacturingTime: { type: Number, min: 0 },
        shelfLife: { type: Number, min: 0 },
        batchSize: { type: Number, min: 0 }
    },
    ageing: {
        ageInDays: { type: Number, default: 0, min: 0, index: true },
        ageCategory: {
            type: String,
            enum: ['fresh', 'good', 'aging', 'old', 'obsolete'],
            default: 'fresh',
            index: true
        },
        lastMovementDate: { type: Date, default: Date.now },
        turnoverRate: { type: Number, default: 0, min: 0 },
        daysInStock: { type: Number, default: 0, min: 0 },
        slowMovingThreshold: { type: Number, default: 90 },
        obsoleteThreshold: { type: Number, default: 365 },
    },
    qualityControl: {
        qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'Reject'], default: 'A' },
        qualityScore: { type: Number, min: 0, max: 100, default: 100 },
        defectRate: { type: Number, min: 0, max: 100, default: 0 },
        lastQualityCheck: { type: Date },
        qualityCheckDue: { type: Date },
        qualityNotes: [{
                date: { type: Date, default: Date.now },
                inspector: { type: String },
                grade: { type: String },
                notes: { type: String },
                images: [String]
            }],
        requiresInspection: { type: Boolean, default: false }
    },
    tracking: {
        createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
        lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        lastStockUpdate: { type: Date },
        lastMovementDate: { type: Date },
        totalInward: { type: Number, default: 0, min: 0 },
        totalOutward: { type: Number, default: 0, min: 0 },
        totalAdjustments: { type: Number, default: 0 }
    },
    status: {
        isActive: { type: Boolean, default: true, index: true },
        isDiscontinued: { type: Boolean, default: false },
        isFastMoving: { type: Boolean, default: false },
        isSlowMoving: { type: Boolean, default: false },
        isObsolete: { type: Boolean, default: false },
        requiresApproval: { type: Boolean, default: false }
    },
    notes: { type: String },
    tags: [String],
    images: [String],
    documents: [String]
}, {
    timestamps: true,
    collection: 'inventory_items'
});
InventoryItemSchema.index({ companyId: 1, itemCode: 1 }, { unique: true });
InventoryItemSchema.index({ companyId: 1, 'category.primary': 1 });
InventoryItemSchema.index({ companyId: 1, productType: 1 });
InventoryItemSchema.index({ companyId: 1, 'stock.currentStock': 1 });
InventoryItemSchema.index({ companyId: 1, 'designInfo.designNumber': 1 });
InventoryItemSchema.index({ companyId: 1, 'specifications.gsm': 1 });
InventoryItemSchema.index({ companyId: 1, 'specifications.color': 1 });
InventoryItemSchema.index({ companyId: 1, 'specifications.batchNumber': 1 });
InventoryItemSchema.index({ companyId: 1, 'ageing.ageCategory': 1 });
InventoryItemSchema.index({ companyId: 1, 'ageing.ageInDays': 1 });
InventoryItemSchema.index({ companyId: 1, 'qualityControl.qualityGrade': 1 });
InventoryItemSchema.index({
    itemName: 'text',
    itemDescription: 'text',
    'designInfo.designNumber': 'text',
    'designInfo.designName': 'text',
    'specifications.color': 'text'
});
InventoryItemSchema.index({ companyId: 1, 'status.isActive': 1 });
InventoryItemSchema.index({ companyId: 1, 'stock.currentStock': 1, 'stock.reorderLevel': 1 });
InventoryItemSchema.index({
    itemName: 'text',
    itemCode: 'text',
    itemDescription: 'text',
    'specifications.design': 'text',
    'specifications.color': 'text'
});
InventoryItemSchema.index({ barcode: 1 }, { sparse: true, unique: true });
InventoryItemSchema.index({ qrCode: 1 }, { sparse: true, unique: true });
InventoryItemSchema.pre('save', function (next) {
    this.stock.availableStock = Math.max(0, this.stock.currentStock - this.stock.reservedStock);
    this.stock.totalValue = this.stock.currentStock * this.stock.averageCost;
    if (this.isModified('stock.currentStock')) {
        this.tracking.lastStockUpdate = new Date();
    }
    next();
});
InventoryItemSchema.methods.checkLowStock = function () {
    return this.stock.currentStock <= this.stock.reorderLevel;
};
InventoryItemSchema.methods.isOutOfStock = function () {
    return this.stock.currentStock <= 0;
};
InventoryItemSchema.methods.getPrimarySupplier = function () {
    return this.suppliers.find(supplier => supplier.isPrimary);
};
InventoryItemSchema.methods.getLocationStock = function (warehouseId) {
    return this.locations.find(location => location.warehouseId?.toString() === warehouseId && location.isActive);
};
InventoryItemSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, 'status.isActive': true });
};
InventoryItemSchema.statics.findLowStockItems = function (companyId) {
    return this.find({
        companyId,
        'status.isActive': true,
        $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] }
    });
};
InventoryItemSchema.statics.findByCategory = function (companyId, category) {
    return this.find({
        companyId,
        'category.primary': category,
        'status.isActive': true
    });
};
InventoryItemSchema.index({ companyId: 1, 'stock.reorderLevel': 1, 'stock.currentStock': 1 });
InventoryItemSchema.index({ companyId: 1, unitPrice: -1 });
InventoryItemSchema.index({ itemName: 'text', description: 'text' }, { name: 'item_text_search' });
InventoryItemSchema.virtual('totalValue').get(function () {
    return (this.stock?.currentStock || 0) * (this.pricing?.costPrice || 0);
});
InventoryItemSchema.virtual('isLowStock').get(function () {
    return (this.stock?.currentStock || 0) <= (this.stock?.reorderLevel || 0);
});
InventoryItemSchema.virtual('stockStatus').get(function () {
    const currentStock = this.stock?.currentStock || 0;
    const reorderLevel = this.stock?.reorderLevel || 0;
    if (currentStock === 0)
        return 'out_of_stock';
    if (currentStock <= reorderLevel)
        return 'low_stock';
    if (currentStock <= reorderLevel * 2)
        return 'medium_stock';
    return 'high_stock';
});
InventoryItemSchema.query.byCompany = function (companyId) {
    return this.where({ companyId });
};
InventoryItemSchema.query.active = function () {
    return this.where({ 'status.isActive': true });
};
InventoryItemSchema.query.lowStock = function () {
    return this.where({ $expr: { $lte: ['$stock.currentStock', '$stock.reorderLevel'] } });
};
InventoryItemSchema.query.byCategory = function (category) {
    return this.where({ 'category.primary': category });
};
InventoryItemSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    if (!this.itemCode && this.itemName) {
        this.itemCode = this.itemName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 10) + '-' + Date.now().toString().slice(-4);
    }
    next();
});
InventoryItemSchema.post('save', function () {
});
exports.default = (0, mongoose_1.model)('InventoryItem', InventoryItemSchema);
//# sourceMappingURL=InventoryItem.js.map