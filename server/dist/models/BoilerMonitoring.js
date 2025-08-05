"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BoilerReadingSchema = new mongoose_1.Schema({
    readingTime: { type: Date, required: true, default: Date.now },
    temperature: { type: Number, required: true, min: 0, max: 1000 },
    pressure: { type: Number, required: true, min: 0, max: 50 },
    waterLevel: { type: Number, required: true, min: 0, max: 100 },
    fuelConsumption: { type: Number, required: true, min: 0 },
    steamProduction: { type: Number, required: true, min: 0 },
    efficiency: { type: Number, required: true, min: 0, max: 100 },
    oxygenLevel: { type: Number, min: 0, max: 25 },
    co2Level: { type: Number, min: 0, max: 20 },
    coLevel: { type: Number, min: 0, max: 1000 },
    flueGasTemperature: { type: Number, min: 0, max: 800 },
    feedWaterTemperature: { type: Number, min: 0, max: 200 },
    blowdownRate: { type: Number, min: 0, max: 100 },
    tds: { type: Number, min: 0, max: 5000 },
    ph: { type: Number, min: 0, max: 14 },
    conductivity: { type: Number, min: 0, max: 10000 },
    operatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    operatorName: { type: String },
    shift: { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
    notes: { type: String },
    isAutomatic: { type: Boolean, default: false },
    sensorId: { type: String },
    status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' }
}, { _id: false });
const BoilerAlertSchema = new mongoose_1.Schema({
    alertTime: { type: Date, required: true, default: Date.now },
    alertType: {
        type: String,
        enum: ['temperature_high', 'temperature_low', 'pressure_high', 'pressure_low', 'water_level_low', 'water_level_high', 'efficiency_low', 'fuel_consumption_high', 'emission_high', 'maintenance_due', 'safety_violation', 'equipment_failure'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical', 'emergency'],
        required: true
    },
    parameter: { type: String, required: true },
    currentValue: { type: Number, required: true },
    thresholdValue: { type: Number, required: true },
    unit: { type: String, required: true },
    description: { type: String, required: true },
    recommendedAction: { type: String },
    acknowledgedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
    status: { type: String, enum: ['active', 'acknowledged', 'resolved', 'false_alarm'], default: 'active' },
    escalationLevel: { type: Number, default: 0, min: 0, max: 3 },
    notificationsSent: { type: Number, default: 0 }
}, { _id: false });
const MaintenanceRecordSchema = new mongoose_1.Schema({
    maintenanceDate: { type: Date, required: true },
    maintenanceType: {
        type: String,
        enum: ['preventive', 'corrective', 'emergency', 'overhaul', 'inspection', 'cleaning', 'calibration'],
        required: true
    },
    component: { type: String, required: true },
    description: { type: String, required: true },
    technician: { type: String, required: true },
    technicianId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    duration: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    partsReplaced: [String],
    workPerformed: { type: String },
    nextMaintenanceDate: { type: Date },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'completed' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    downtime: { type: Number, default: 0, min: 0 },
    efficiency_before: { type: Number, min: 0, max: 100 },
    efficiency_after: { type: Number, min: 0, max: 100 },
    attachments: [String],
    notes: { type: String }
}, { _id: false });
const BoilerMonitoringSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    boilerId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    boilerName: {
        type: String,
        required: true,
        trim: true
    },
    boilerNumber: { type: String, required: true },
    location: { type: String, required: true },
    specifications: {
        capacity: { type: Number, required: true, min: 0 },
        workingPressure: { type: Number, required: true, min: 0 },
        maxTemperature: { type: Number, required: true, min: 0 },
        fuelType: { type: String, enum: ['coal', 'oil', 'gas', 'biomass', 'electric'], required: true },
        manufacturer: { type: String, required: true },
        model: { type: String, required: true },
        yearOfManufacture: { type: Number, required: true },
        serialNumber: { type: String, required: true },
        boilerType: { type: String, enum: ['fire_tube', 'water_tube', 'electric', 'waste_heat'], required: true },
        heating_surface: { type: Number, min: 0 },
        grate_area: { type: Number, min: 0 },
        furnace_volume: { type: Number, min: 0 }
    },
    operatingParameters: {
        normalTemperature: { min: Number, max: Number },
        normalPressure: { min: Number, max: Number },
        normalWaterLevel: { min: Number, max: Number },
        maxFuelConsumption: { type: Number, min: 0 },
        minEfficiency: { type: Number, min: 0, max: 100 },
        maxEmission: {
            co2: { type: Number, min: 0 },
            co: { type: Number, min: 0 },
            nox: { type: Number, min: 0 },
            so2: { type: Number, min: 0 }
        }
    },
    currentStatus: {
        isOperational: { type: Boolean, default: true },
        operatingMode: { type: String, enum: ['automatic', 'manual', 'maintenance', 'shutdown'], default: 'automatic' },
        currentLoad: { type: Number, min: 0, max: 100 },
        lastReading: BoilerReadingSchema,
        uptime: { type: Number, default: 0 },
        totalOperatingHours: { type: Number, default: 0 },
        lastStartTime: { type: Date },
        lastShutdownTime: { type: Date },
        shutdownReason: { type: String }
    },
    readings: [BoilerReadingSchema],
    alerts: [BoilerAlertSchema],
    maintenanceRecords: [MaintenanceRecordSchema],
    performance: {
        avgEfficiency: { type: Number, default: 0, min: 0, max: 100 },
        avgFuelConsumption: { type: Number, default: 0, min: 0 },
        avgSteamProduction: { type: Number, default: 0, min: 0 },
        totalFuelConsumed: { type: Number, default: 0, min: 0 },
        totalSteamProduced: { type: Number, default: 0, min: 0 },
        availabilityPercentage: { type: Number, default: 0, min: 0, max: 100 },
        mtbf: { type: Number, default: 0 },
        mttr: { type: Number, default: 0 },
        lastCalculated: { type: Date, default: Date.now }
    },
    safety: {
        lastSafetyInspection: { type: Date },
        nextSafetyInspection: { type: Date },
        safetyOfficer: { type: String },
        safetyRating: { type: String, enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'critical'] },
        safetyIncidents: { type: Number, default: 0 },
        complianceStatus: { type: String, enum: ['compliant', 'non_compliant', 'pending'], default: 'compliant' },
        certificates: [String],
        permits: [String]
    },
    environmental: {
        emissionLimits: {
            co2: { type: Number, min: 0 },
            co: { type: Number, min: 0 },
            nox: { type: Number, min: 0 },
            so2: { type: Number, min: 0 },
            particulates: { type: Number, min: 0 }
        },
        currentEmissions: {
            co2: { type: Number, default: 0 },
            co: { type: Number, default: 0 },
            nox: { type: Number, default: 0 },
            so2: { type: Number, default: 0 },
            particulates: { type: Number, default: 0 }
        },
        waterTreatment: {
            chemicalUsage: { type: Number, default: 0 },
            wasteWaterGenerated: { type: Number, default: 0 },
            treatmentEfficiency: { type: Number, default: 0, min: 0, max: 100 }
        },
        noiseLevel: { type: Number, default: 0 },
        lastEnvironmentalAudit: { type: Date },
        nextEnvironmentalAudit: { type: Date }
    },
    automation: {
        isAutomated: { type: Boolean, default: false },
        controlSystem: { type: String },
        sensors: [{
                sensorId: { type: String, required: true },
                sensorType: { type: String, required: true },
                location: { type: String, required: true },
                calibrationDate: { type: Date },
                nextCalibration: { type: Date },
                status: { type: String, enum: ['active', 'inactive', 'faulty'], default: 'active' }
            }],
        alarmSystem: {
            isActive: { type: Boolean, default: true },
            audioAlarm: { type: Boolean, default: true },
            visualAlarm: { type: Boolean, default: true },
            smsAlert: { type: Boolean, default: false },
            emailAlert: { type: Boolean, default: true }
        }
    },
    schedule: {
        operatingHours: {
            monday: { start: String, end: String, isOperating: { type: Boolean, default: true } },
            tuesday: { start: String, end: String, isOperating: { type: Boolean, default: true } },
            wednesday: { start: String, end: String, isOperating: { type: Boolean, default: true } },
            thursday: { start: String, end: String, isOperating: { type: Boolean, default: true } },
            friday: { start: String, end: String, isOperating: { type: Boolean, default: true } },
            saturday: { start: String, end: String, isOperating: { type: Boolean, default: false } },
            sunday: { start: String, end: String, isOperating: { type: Boolean, default: false } }
        },
        maintenanceSchedule: [{
                maintenanceType: { type: String, required: true },
                frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true },
                lastPerformed: { type: Date },
                nextDue: { type: Date, required: true },
                assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                estimatedDuration: { type: Number, min: 0 }
            }]
    },
    notes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    operatorInCharge: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    supervisorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'boiler_monitoring'
});
BoilerMonitoringSchema.index({ companyId: 1, boilerId: 1 }, { unique: true });
BoilerMonitoringSchema.index({ companyId: 1, location: 1 });
BoilerMonitoringSchema.index({ companyId: 1, 'currentStatus.isOperational': 1 });
BoilerMonitoringSchema.index({ companyId: 1, 'readings.readingTime': -1 });
BoilerMonitoringSchema.index({
    boilerName: 'text',
    boilerId: 'text',
    location: 'text'
});
BoilerMonitoringSchema.pre('save', function (next) {
    if (this.isModified('readings') && this.readings.length > 0) {
        const recentReadings = this.readings.slice(-100);
        this.performance.avgEfficiency = recentReadings.reduce((sum, reading) => sum + reading.efficiency, 0) / recentReadings.length;
        this.performance.avgFuelConsumption = recentReadings.reduce((sum, reading) => sum + reading.fuelConsumption, 0) / recentReadings.length;
        this.performance.avgSteamProduction = recentReadings.reduce((sum, reading) => sum + reading.steamProduction, 0) / recentReadings.length;
        this.performance.lastCalculated = new Date();
    }
    if (this.readings.length > 0) {
        this.currentStatus.lastReading = this.readings[this.readings.length - 1];
    }
    next();
});
BoilerMonitoringSchema.methods.addReading = function (readingData) {
    this.readings.push(readingData);
    if (this.readings.length > 1000) {
        this.readings = this.readings.slice(-1000);
    }
    return this.save();
};
BoilerMonitoringSchema.methods.getCurrentEfficiency = function () {
    if (this.readings.length === 0)
        return 0;
    return this.readings[this.readings.length - 1].efficiency;
};
BoilerMonitoringSchema.methods.getActiveAlerts = function () {
    return this.alerts.filter(alert => alert.status === 'active');
};
BoilerMonitoringSchema.methods.isOperatingNormally = function () {
    const lastReading = this.currentStatus.lastReading;
    if (!lastReading)
        return false;
    const params = this.operatingParameters;
    return (lastReading.temperature >= params.normalTemperature.min &&
        lastReading.temperature <= params.normalTemperature.max &&
        lastReading.pressure >= params.normalPressure.min &&
        lastReading.pressure <= params.normalPressure.max &&
        lastReading.waterLevel >= params.normalWaterLevel.min &&
        lastReading.waterLevel <= params.normalWaterLevel.max);
};
BoilerMonitoringSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
BoilerMonitoringSchema.statics.findOperationalBoilers = function (companyId) {
    return this.find({
        companyId,
        'currentStatus.isOperational': true,
        isActive: true
    });
};
BoilerMonitoringSchema.statics.getBoilerStats = function (companyId) {
    return this.aggregate([
        { $match: { companyId: new mongoose_1.Schema.Types.ObjectId(companyId), isActive: true } },
        {
            $group: {
                _id: '$specifications.fuelType',
                count: { $sum: 1 },
                totalCapacity: { $sum: '$specifications.capacity' },
                avgEfficiency: { $avg: '$performance.avgEfficiency' },
                operationalCount: {
                    $sum: { $cond: ['$currentStatus.isOperational', 1, 0] }
                }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('BoilerMonitoring', BoilerMonitoringSchema);
//# sourceMappingURL=BoilerMonitoring.js.map