"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ElectricityReadingSchema = new mongoose_1.Schema({
    readingTime: { type: Date, required: true, default: Date.now },
    voltage: {
        r: { type: Number, required: true, min: 0, max: 500 },
        y: { type: Number, required: true, min: 0, max: 500 },
        b: { type: Number, required: true, min: 0, max: 500 },
        avg: { type: Number, required: true, min: 0, max: 500 }
    },
    current: {
        r: { type: Number, required: true, min: 0, max: 10000 },
        y: { type: Number, required: true, min: 0, max: 10000 },
        b: { type: Number, required: true, min: 0, max: 10000 },
        neutral: { type: Number, default: 0, min: 0, max: 1000 }
    },
    power: {
        activePower: { type: Number, required: true, min: 0 },
        reactivePower: { type: Number, default: 0 },
        apparentPower: { type: Number, required: true, min: 0 },
        powerFactor: { type: Number, required: true, min: 0, max: 1 }
    },
    energy: {
        activeEnergy: { type: Number, required: true, min: 0 },
        reactiveEnergy: { type: Number, default: 0, min: 0 },
        apparentEnergy: { type: Number, default: 0, min: 0 }
    },
    frequency: { type: Number, required: true, min: 45, max: 65 },
    temperature: { type: Number, min: -50, max: 150 },
    humidity: { type: Number, min: 0, max: 100 },
    meterReading: { type: Number, min: 0 },
    operatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    operatorName: { type: String },
    shift: { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
    notes: { type: String },
    isAutomatic: { type: Boolean, default: false },
    meterId: { type: String },
    status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' }
}, { _id: false });
const PowerQualitySchema = new mongoose_1.Schema({
    measurementTime: { type: Date, required: true, default: Date.now },
    voltageUnbalance: { type: Number, min: 0, max: 100 },
    currentUnbalance: { type: Number, min: 0, max: 100 },
    totalHarmonicDistortion: {
        voltage: { type: Number, min: 0, max: 100 },
        current: { type: Number, min: 0, max: 100 }
    },
    flickerSeverity: {
        shortTerm: { type: Number, min: 0, max: 10 },
        longTerm: { type: Number, min: 0, max: 10 }
    },
    voltageVariation: {
        sag: { type: Number, default: 0 },
        swell: { type: Number, default: 0 },
        interruption: { type: Number, default: 0 }
    },
    powerQualityIndex: { type: Number, min: 0, max: 100 },
    complianceStatus: { type: String, enum: ['compliant', 'non_compliant', 'marginal'], default: 'compliant' }
}, { _id: false });
const EnergyConsumptionSchema = new mongoose_1.Schema({
    period: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    consumption: {
        activeEnergy: { type: Number, required: true, min: 0 },
        reactiveEnergy: { type: Number, default: 0, min: 0 },
        maxDemand: { type: Number, required: true, min: 0 },
        avgDemand: { type: Number, required: true, min: 0 },
        loadFactor: { type: Number, min: 0, max: 1 }
    },
    cost: {
        energyCharges: { type: Number, default: 0, min: 0 },
        demandCharges: { type: Number, default: 0, min: 0 },
        powerFactorPenalty: { type: Number, default: 0 },
        totalCost: { type: Number, required: true, min: 0 }
    },
    tariffRate: { type: Number, min: 0 },
    peakHours: { type: Number, default: 0, min: 0 },
    offPeakHours: { type: Number, default: 0, min: 0 }
}, { _id: false });
const ElectricityMonitoringSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    monitoringId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    monitoringName: {
        type: String,
        required: true,
        trim: true
    },
    location: { type: String, required: true },
    description: { type: String },
    systemDetails: {
        connectionType: { type: String, enum: ['3_phase_4_wire', '3_phase_3_wire', '1_phase_2_wire'], required: true },
        ratedVoltage: { type: Number, required: true, min: 0 },
        ratedCurrent: { type: Number, required: true, min: 0 },
        ratedPower: { type: Number, required: true, min: 0 },
        frequency: { type: Number, default: 50, min: 45, max: 65 },
        transformerRating: { type: Number, min: 0 },
        panelType: { type: String, enum: ['main', 'sub', 'distribution', 'control'], required: true },
        feedFrom: { type: String },
        suppliesTo: [String]
    },
    meteringEquipment: {
        meterType: { type: String, enum: ['analog', 'digital', 'smart', 'ct_pt'], required: true },
        meterMake: { type: String, required: true },
        meterModel: { type: String, required: true },
        meterSerialNumber: { type: String, required: true },
        installationDate: { type: Date, required: true },
        lastCalibration: { type: Date },
        nextCalibration: { type: Date },
        ctRatio: { type: String },
        ptRatio: { type: String },
        accuracy: { type: Number, min: 0, max: 5 },
        communicationProtocol: { type: String, enum: ['modbus', 'profibus', 'ethernet', 'rs485', 'wireless'] }
    },
    operatingLimits: {
        voltage: { min: Number, max: Number },
        current: { min: Number, max: Number },
        power: { min: Number, max: Number },
        powerFactor: { min: Number, max: Number },
        frequency: { min: Number, max: Number },
        temperature: { min: Number, max: Number }
    },
    currentStatus: {
        isOnline: { type: Boolean, default: true },
        operatingMode: { type: String, enum: ['normal', 'maintenance', 'fault', 'offline'], default: 'normal' },
        lastReading: ElectricityReadingSchema,
        currentLoad: { type: Number, min: 0, max: 100 },
        powerStatus: { type: String, enum: ['on', 'off', 'tripped', 'fault'], default: 'on' },
        alarmStatus: { type: String, enum: ['normal', 'warning', 'alarm', 'critical'], default: 'normal' },
        lastCommunication: { type: Date, default: Date.now }
    },
    readings: [ElectricityReadingSchema],
    powerQuality: [PowerQualitySchema],
    energyConsumption: [EnergyConsumptionSchema],
    performance: {
        avgPowerFactor: { type: Number, default: 0, min: 0, max: 1 },
        avgLoad: { type: Number, default: 0, min: 0, max: 100 },
        peakDemand: { type: Number, default: 0, min: 0 },
        energyEfficiency: { type: Number, default: 0, min: 0, max: 100 },
        uptime: { type: Number, default: 0, min: 0, max: 100 },
        totalEnergyConsumed: { type: Number, default: 0, min: 0 },
        totalEnergyCost: { type: Number, default: 0, min: 0 },
        co2Emissions: { type: Number, default: 0, min: 0 },
        lastCalculated: { type: Date, default: Date.now }
    },
    tariffStructure: {
        tariffType: { type: String, enum: ['flat', 'tod', 'seasonal', 'demand'], required: true },
        energyRate: { type: Number, required: true, min: 0 },
        demandRate: { type: Number, default: 0, min: 0 },
        fixedCharges: { type: Number, default: 0, min: 0 },
        powerFactorIncentive: { type: Number, default: 0 },
        powerFactorPenalty: { type: Number, default: 0 },
        peakHours: [{ start: String, end: String }],
        offPeakHours: [{ start: String, end: String }],
        seasonalRates: [{
                season: { type: String, enum: ['summer', 'winter', 'monsoon'] },
                startMonth: { type: Number, min: 1, max: 12 },
                endMonth: { type: Number, min: 1, max: 12 },
                rate: { type: Number, min: 0 }
            }]
    },
    alerts: [{
            alertTime: { type: Date, required: true, default: Date.now },
            alertType: {
                type: String,
                enum: ['voltage_high', 'voltage_low', 'current_high', 'overload', 'power_factor_low', 'frequency_deviation', 'phase_failure', 'earth_fault', 'communication_loss', 'meter_error'],
                required: true
            },
            severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
            parameter: { type: String, required: true },
            currentValue: { type: Number, required: true },
            thresholdValue: { type: Number, required: true },
            unit: { type: String, required: true },
            description: { type: String, required: true },
            acknowledgedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            acknowledgedAt: { type: Date },
            resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            resolvedAt: { type: Date },
            status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' }
        }],
    maintenance: {
        lastMaintenance: { type: Date },
        nextMaintenance: { type: Date },
        maintenanceInterval: { type: Number, default: 90 },
        maintenanceRecords: [{
                date: { type: Date, required: true },
                type: { type: String, enum: ['preventive', 'corrective', 'calibration'], required: true },
                description: { type: String, required: true },
                technician: { type: String, required: true },
                cost: { type: Number, min: 0 },
                downtime: { type: Number, min: 0 },
                notes: { type: String }
            }]
    },
    loadManagement: {
        loadShedding: {
            isEnabled: { type: Boolean, default: false },
            priority: { type: Number, min: 1, max: 10 },
            sheddingThreshold: { type: Number, min: 0 },
            restoreThreshold: { type: Number, min: 0 },
            sheddingDelay: { type: Number, default: 0 },
            restoreDelay: { type: Number, default: 0 }
        },
        demandControl: {
            isEnabled: { type: Boolean, default: false },
            targetDemand: { type: Number, min: 0 },
            controlMethod: { type: String, enum: ['load_shedding', 'generator_start', 'capacitor_switching'] }
        }
    },
    environmental: {
        carbonFootprint: { type: Number, default: 0, min: 0 },
        renewableEnergyPercentage: { type: Number, default: 0, min: 0, max: 100 },
        energyIntensity: { type: Number, default: 0, min: 0 },
        greenCertificates: { type: Number, default: 0, min: 0 }
    },
    notes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    attachments: [String],
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    electricianInCharge: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    supervisorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'electricity_monitoring'
});
ElectricityMonitoringSchema.index({ companyId: 1, monitoringId: 1 }, { unique: true });
ElectricityMonitoringSchema.index({ companyId: 1, location: 1 });
ElectricityMonitoringSchema.index({ companyId: 1, 'currentStatus.isOnline': 1 });
ElectricityMonitoringSchema.index({ companyId: 1, 'readings.readingTime': -1 });
ElectricityMonitoringSchema.index({
    monitoringName: 'text',
    monitoringId: 'text',
    location: 'text'
});
ElectricityMonitoringSchema.pre('save', function (next) {
    if (this.isModified('readings') && this.readings.length > 0) {
        const recentReadings = this.readings.slice(-100);
        this.performance.avgPowerFactor = recentReadings.reduce((sum, reading) => sum + reading.power.powerFactor, 0) / recentReadings.length;
        this.performance.avgLoad = recentReadings.reduce((sum, reading) => sum + ((reading.power.activePower / this.systemDetails.ratedPower) * 100), 0) / recentReadings.length;
        this.performance.lastCalculated = new Date();
    }
    if (this.readings.length > 0) {
        this.currentStatus.lastReading = this.readings[this.readings.length - 1];
        this.currentStatus.lastCommunication = new Date();
    }
    next();
});
ElectricityMonitoringSchema.methods.addReading = function (readingData) {
    this.readings.push(readingData);
    if (this.readings.length > 1000) {
        this.readings = this.readings.slice(-1000);
    }
    return this.save();
};
ElectricityMonitoringSchema.methods.getCurrentLoad = function () {
    if (this.readings.length === 0)
        return 0;
    const lastReading = this.readings[this.readings.length - 1];
    return (lastReading.power.activePower / this.systemDetails.ratedPower) * 100;
};
ElectricityMonitoringSchema.methods.getActiveAlerts = function () {
    return this.alerts.filter(alert => alert.status === 'active');
};
ElectricityMonitoringSchema.methods.calculateEnergyCost = function (energyConsumed) {
    const tariff = this.tariffStructure;
    let cost = energyConsumed * tariff.energyRate;
    if (tariff.demandRate > 0 && this.performance.peakDemand > 0) {
        cost += this.performance.peakDemand * tariff.demandRate;
    }
    cost += tariff.fixedCharges;
    return cost;
};
ElectricityMonitoringSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
ElectricityMonitoringSchema.statics.findOnlineMonitors = function (companyId) {
    return this.find({
        companyId,
        'currentStatus.isOnline': true,
        isActive: true
    });
};
ElectricityMonitoringSchema.statics.getEnergyStats = function (companyId) {
    return this.aggregate([
        { $match: { companyId: new mongoose_1.Schema.Types.ObjectId(companyId), isActive: true } },
        {
            $group: {
                _id: '$systemDetails.panelType',
                count: { $sum: 1 },
                totalRatedPower: { $sum: '$systemDetails.ratedPower' },
                totalEnergyConsumed: { $sum: '$performance.totalEnergyConsumed' },
                avgPowerFactor: { $avg: '$performance.avgPowerFactor' },
                onlineCount: {
                    $sum: { $cond: ['$currentStatus.isOnline', 1, 0] }
                }
            }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('ElectricityMonitoring', ElectricityMonitoringSchema);
//# sourceMappingURL=ElectricityMonitoring.js.map