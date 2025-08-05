"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BatchSchema = new mongoose_1.Schema({
    batchNumber: { type: String },
    quantity: { type: Number, min: 0 },
    rate: { type: Number, min: 0 },
    consumedDate: { type: Date }
}, { _id: false });
const RawMaterialSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    itemCode: { type: String },
    itemName: { type: String },
    requiredQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String },
    allocatedQuantity: { type: Number, default: 0, min: 0 },
    consumedQuantity: { type: Number, default: 0, min: 0 },
    wasteQuantity: { type: Number, default: 0, min: 0 },
    rate: { type: Number, min: 0 },
    totalCost: { type: Number, min: 0 },
    batches: [BatchSchema]
}, { _id: false });
const WorkerAssignmentSchema = new mongoose_1.Schema({
    workerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    workerName: { type: String },
    role: { type: String },
    assignedAt: { type: Date },
    hoursWorked: { type: Number, default: 0, min: 0 },
    hourlyRate: { type: Number, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 }
}, { _id: false });
const MachineAssignmentSchema = new mongoose_1.Schema({
    machineId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Machine' },
    machineName: { type: String },
    assignedAt: { type: Date },
    hoursUsed: { type: Number, default: 0, min: 0 },
    hourlyRate: { type: Number, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 }
}, { _id: false });
const JobWorkSchema = new mongoose_1.Schema({
    isJobWork: { type: Boolean, default: false },
    jobWorkerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier' },
    jobWorkerName: { type: String },
    jobWorkerRate: { type: Number, min: 0 },
    expectedDelivery: { type: Date },
    actualDelivery: { type: Date },
    jobWorkCost: { type: Number, default: 0, min: 0 },
    qualityAgreement: { type: String }
}, { _id: false });
const MaterialConsumptionSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem' },
    itemName: { type: String },
    consumedQuantity: { type: Number, min: 0 },
    unit: { type: String },
    wasteQuantity: { type: Number, default: 0, min: 0 },
    wastePercentage: { type: Number, default: 0, min: 0, max: 100 },
    batchNumber: { type: String },
    consumedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    consumedAt: { type: Date }
}, { _id: false });
const QualityCheckpointSchema = new mongoose_1.Schema({
    checkpointName: { type: String },
    parameter: { type: String },
    expectedValue: { type: String },
    actualValue: { type: String },
    status: { type: String, enum: ['pass', 'fail', 'rework'] },
    checkedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    checkedAt: { type: Date },
    remarks: { type: String }
}, { _id: false });
const QualityControlSchema = new mongoose_1.Schema({
    isRequired: { type: Boolean, default: true },
    checkpoints: [QualityCheckpointSchema],
    finalQuality: {
        checkedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        checkedAt: { type: Date },
        qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'Reject'] },
        defects: [String],
        defectPercentage: { type: Number, min: 0, max: 100 },
        approvedQuantity: { type: Number, min: 0 },
        rejectedQuantity: { type: Number, default: 0, min: 0 },
        reworkQuantity: { type: Number, default: 0, min: 0 },
        qualityNotes: { type: String },
        qualityImages: [String]
    }
}, { _id: false });
const ProductionStageSchema = new mongoose_1.Schema({
    stageId: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
    processId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Process' },
    stageNumber: { type: Number, required: true, min: 1 },
    stageName: { type: String, required: true },
    processType: {
        type: String,
        enum: ['printing', 'washing', 'fixing', 'stitching', 'finishing', 'quality_check']
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'on_hold', 'rejected', 'rework'],
        default: 'pending'
    },
    assignment: {
        workers: [WorkerAssignmentSchema],
        machines: [MachineAssignmentSchema],
        jobWork: JobWorkSchema
    },
    timing: {
        plannedStartTime: { type: Date },
        actualStartTime: { type: Date },
        plannedEndTime: { type: Date },
        actualEndTime: { type: Date },
        plannedDuration: { type: Number, min: 0 },
        actualDuration: { type: Number, min: 0 },
        breakTime: { type: Number, default: 0, min: 0 },
        overtimeHours: { type: Number, default: 0, min: 0 }
    },
    materialConsumption: [MaterialConsumptionSchema],
    qualityControl: QualityControlSchema,
    output: {
        producedQuantity: { type: Number, min: 0 },
        unit: { type: String },
        outputLocation: {
            warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Warehouse' },
            location: { type: String }
        },
        batchNumber: { type: String },
        outputImages: [String]
    },
    costs: {
        materialCost: { type: Number, default: 0, min: 0 },
        laborCost: { type: Number, default: 0, min: 0 },
        machineCost: { type: Number, default: 0, min: 0 },
        overheadCost: { type: Number, default: 0, min: 0 },
        jobWorkCost: { type: Number, default: 0, min: 0 },
        totalStageCost: { type: Number, default: 0, min: 0 }
    },
    notes: { type: String },
    instructions: { type: String },
    images: [String],
    documents: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
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
const ProductionOrderSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    productionOrderNumber: {
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
    customerOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomerOrder' },
    customerOrderNumber: { type: String },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    product: {
        productType: {
            type: String,
            enum: ['saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom'],
            required: true
        },
        design: { type: String },
        designCode: { type: String },
        color: { type: String },
        colorCode: { type: String },
        gsm: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        length: { type: Number, min: 0 },
        pattern: { type: String },
        finish: { type: String },
        customSpecifications: { type: String }
    },
    orderQuantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    completedQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    pendingQuantity: { type: Number, default: 0, min: 0 },
    rawMaterials: [RawMaterialSchema],
    productionStages: [ProductionStageSchema],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent', 'rush'],
        default: 'medium',
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold', 'partially_completed'],
        default: 'draft',
        index: true
    },
    schedule: {
        plannedStartDate: { type: Date },
        plannedEndDate: { type: Date },
        actualStartDate: { type: Date },
        actualEndDate: { type: Date },
        estimatedDuration: { type: Number, min: 0 },
        actualDuration: { type: Number, min: 0 },
        delayReason: { type: String }
    },
    costSummary: {
        materialCost: { type: Number, default: 0, min: 0 },
        laborCost: { type: Number, default: 0, min: 0 },
        machineCost: { type: Number, default: 0, min: 0 },
        overheadCost: { type: Number, default: 0, min: 0 },
        jobWorkCost: { type: Number, default: 0, min: 0 },
        totalProductionCost: { type: Number, default: 0, min: 0 },
        costPerUnit: { type: Number, default: 0, min: 0 }
    },
    qualitySummary: {
        totalProduced: { type: Number, default: 0, min: 0 },
        totalApproved: { type: Number, default: 0, min: 0 },
        totalRejected: { type: Number, default: 0, min: 0 },
        totalRework: { type: Number, default: 0, min: 0 },
        overallQualityGrade: { type: String },
        defectRate: { type: Number, min: 0, max: 100 },
        firstPassYield: { type: Number, min: 0, max: 100 }
    },
    approvals: [ApprovalSchema],
    specialInstructions: { type: String },
    customerRequirements: { type: String },
    packingInstructions: { type: String },
    deliveryInstructions: { type: String },
    notes: { type: String },
    tags: [String],
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'production_orders'
});
ProductionOrderSchema.index({ companyId: 1, orderDate: -1 });
ProductionOrderSchema.index({ companyId: 1, status: 1, priority: 1 });
ProductionOrderSchema.index({ companyId: 1, customerOrderId: 1 });
ProductionOrderSchema.index({ companyId: 1, 'product.productType': 1 });
ProductionOrderSchema.index({ 'schedule.plannedStartDate': 1, 'schedule.plannedEndDate': 1 });
ProductionOrderSchema.index({ 'productionStages.status': 1 });
ProductionOrderSchema.index({
    productionOrderNumber: 'text',
    customerName: 'text',
    'product.design': 'text',
    'product.color': 'text'
});
ProductionOrderSchema.pre('save', function (next) {
    this.pendingQuantity = this.orderQuantity - this.completedQuantity - this.rejectedQuantity;
    if (this.completedQuantity > 0) {
        this.costSummary.costPerUnit = this.costSummary.totalProductionCost / this.completedQuantity;
    }
    this.costSummary.materialCost = this.productionStages.reduce((sum, stage) => sum + stage.costs.materialCost, 0);
    this.costSummary.laborCost = this.productionStages.reduce((sum, stage) => sum + stage.costs.laborCost, 0);
    this.costSummary.machineCost = this.productionStages.reduce((sum, stage) => sum + stage.costs.machineCost, 0);
    this.costSummary.overheadCost = this.productionStages.reduce((sum, stage) => sum + stage.costs.overheadCost, 0);
    this.costSummary.jobWorkCost = this.productionStages.reduce((sum, stage) => sum + stage.costs.jobWorkCost, 0);
    this.costSummary.totalProductionCost =
        this.costSummary.materialCost +
            this.costSummary.laborCost +
            this.costSummary.machineCost +
            this.costSummary.overheadCost +
            this.costSummary.jobWorkCost;
    next();
});
ProductionOrderSchema.methods.isCompleted = function () {
    return this.status === 'completed';
};
ProductionOrderSchema.methods.isDelayed = function () {
    if (!this.schedule.plannedEndDate)
        return false;
    return new Date() > this.schedule.plannedEndDate && this.status !== 'completed';
};
ProductionOrderSchema.methods.getCompletionPercentage = function () {
    if (this.orderQuantity === 0)
        return 0;
    return (this.completedQuantity / this.orderQuantity) * 100;
};
ProductionOrderSchema.methods.getCurrentStage = function () {
    return this.productionStages.find(stage => stage.status === 'in_progress');
};
ProductionOrderSchema.methods.getNextStage = function () {
    return this.productionStages.find(stage => stage.status === 'pending');
};
ProductionOrderSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId }).sort({ orderDate: -1 });
};
ProductionOrderSchema.statics.findByStatus = function (companyId, status) {
    return this.find({ companyId, status }).sort({ orderDate: -1 });
};
ProductionOrderSchema.statics.findDelayed = function (companyId) {
    return this.find({
        companyId,
        'schedule.plannedEndDate': { $lt: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
    });
};
exports.default = (0, mongoose_1.model)('ProductionOrder', ProductionOrderSchema);
//# sourceMappingURL=ProductionOrder.js.map