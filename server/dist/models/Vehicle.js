"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VehicleSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    driverName: {
        type: String,
        required: true,
        trim: true
    },
    driverPhone: {
        type: String,
        required: true,
        trim: true
    },
    purpose: {
        type: String,
        enum: ['delivery', 'pickup', 'maintenance', 'other'],
        required: true,
        index: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    timeIn: {
        type: Date,
        default: Date.now,
        required: true
    },
    timeOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in', 'out', 'pending'],
        default: 'in',
        index: true
    },
    currentStatus: {
        type: String,
        enum: ['in', 'out', 'pending'],
        default: 'in',
        index: true
    },
    gatePassNumber: {
        type: String,
        trim: true,
        sparse: true
    },
    images: [String],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'vehicles'
});
VehicleSchema.index({ companyId: 1, vehicleNumber: 1 }, { unique: true });
VehicleSchema.index({ companyId: 1, status: 1 });
VehicleSchema.index({ companyId: 1, purpose: 1 });
VehicleSchema.index({ driverPhone: 1 });
VehicleSchema.index({ timeIn: -1 });
VehicleSchema.index({ timeOut: -1 });
VehicleSchema.index({
    vehicleNumber: 'text',
    driverName: 'text',
    reason: 'text'
});
VehicleSchema.pre('save', function (next) {
    if (!this.gatePassNumber && this.isNew) {
        const timestamp = Date.now().toString().slice(-6);
        this.gatePassNumber = `GP${timestamp}`;
    }
    next();
});
VehicleSchema.methods.isCurrentlyInside = function () {
    return this.status === 'in';
};
VehicleSchema.methods.checkout = function () {
    this.status = 'out';
    this.timeOut = new Date();
};
VehicleSchema.methods.getDuration = function () {
    if (!this.timeOut)
        return 0;
    return Math.floor((this.timeOut.getTime() - this.timeIn.getTime()) / (1000 * 60));
};
VehicleSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId });
};
VehicleSchema.statics.findCurrentlyInside = function (companyId) {
    return this.find({
        companyId,
        status: 'in'
    });
};
VehicleSchema.statics.findByPurpose = function (companyId, purpose) {
    return this.find({
        companyId,
        purpose
    });
};
VehicleSchema.statics.getVehicleStats = function (companyId) {
    return this.aggregate([
        { $match: { companyId: new mongoose_1.Schema.Types.ObjectId(companyId) } },
        {
            $group: {
                _id: '$purpose',
                count: { $sum: 1 },
                inside: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'in'] }, 1, 0]
                    }
                },
                outside: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'out'] }, 1, 0]
                    }
                }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('Vehicle', VehicleSchema);
//# sourceMappingURL=Vehicle.js.map