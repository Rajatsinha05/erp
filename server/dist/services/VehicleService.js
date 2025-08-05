"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class VehicleService {
    constructor() {
    }
    async findById(id) {
        try {
            return await models_1.Vehicle.findById(id)
                .populate('createdBy', 'username email')
                .populate('companyId', 'name')
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error finding vehicle by ID', { error, id });
            throw error;
        }
    }
    async create(data) {
        try {
            const vehicle = new models_1.Vehicle(data);
            return await vehicle.save();
        }
        catch (error) {
            logger_1.logger.error('Error creating vehicle', { error, data });
            throw error;
        }
    }
    async update(id, data, updatedBy) {
        try {
            return await models_1.Vehicle.findByIdAndUpdate(id, { ...data, lastModifiedBy: updatedBy }, { new: true, runValidators: true }).lean();
        }
        catch (error) {
            logger_1.logger.error('Error updating vehicle', { error, id, data });
            throw error;
        }
    }
    async delete(id) {
        try {
            const result = await models_1.Vehicle.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            logger_1.logger.error('Error deleting vehicle', { error, id });
            throw error;
        }
    }
    async findMany(query, options) {
        try {
            return await models_1.Vehicle.find(query)
                .populate('createdBy', 'username email')
                .populate('companyId', 'name')
                .sort(options?.sort || { createdAt: -1 })
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error finding vehicles', { error, query });
            throw error;
        }
    }
    async findOne(query) {
        try {
            return await models_1.Vehicle.findOne(query)
                .populate('createdBy', 'username email')
                .populate('companyId', 'name')
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error finding vehicle', { error, query });
            throw error;
        }
    }
    async count(query) {
        try {
            return await models_1.Vehicle.countDocuments(query);
        }
        catch (error) {
            logger_1.logger.error('Error counting vehicles', { error, query });
            throw error;
        }
    }
    async createVehicle(vehicleData, createdBy) {
        try {
            if (!vehicleData.vehicleNumber) {
                throw new errors_1.AppError('Vehicle number is required', 400);
            }
            if (!vehicleData.driverName) {
                throw new errors_1.AppError('Driver name is required', 400);
            }
            if (!vehicleData.driverPhone) {
                throw new errors_1.AppError('Driver phone is required', 400);
            }
            if (!vehicleData.purpose) {
                throw new errors_1.AppError('Purpose is required', 400);
            }
            if (!vehicleData.reason) {
                throw new errors_1.AppError('Reason is required', 400);
            }
            if (!vehicleData.companyId) {
                throw new errors_1.AppError('Company ID is required', 400);
            }
            const existingVehicle = await this.findOne({
                vehicleNumber: vehicleData.vehicleNumber?.toUpperCase(),
                companyId: vehicleData.companyId
            });
            if (existingVehicle) {
                throw new errors_1.AppError('Vehicle number already exists', 400);
            }
            const vehicle = await this.create({
                ...vehicleData,
                vehicleNumber: vehicleData.vehicleNumber?.toUpperCase(),
                status: 'in',
                timeIn: new Date()
            });
            logger_1.logger.info('Vehicle created successfully', {
                vehicleId: vehicle._id,
                vehicleNumber: vehicle.vehicleNumber,
                purpose: vehicle.purpose,
                companyId: vehicleData.companyId,
                createdBy
            });
            return vehicle;
        }
        catch (error) {
            logger_1.logger.error('Error creating vehicle', { error, vehicleData, createdBy });
            throw error;
        }
    }
    async getVehicleByNumber(vehicleNumber, companyId) {
        try {
            return await this.findOne({
                vehicleNumber: vehicleNumber.toUpperCase(),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicle by number', { error, vehicleNumber, companyId });
            throw error;
        }
    }
    async getVehiclesByCompany(companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            return await this.findMany(query, options);
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicles by company', { error, companyId });
            throw error;
        }
    }
    async getVehiclesByPurpose(companyId, purpose) {
        try {
            return await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                purpose
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicles by purpose', { error, companyId, purpose });
            throw error;
        }
    }
    async checkoutVehicle(vehicleId, updatedBy) {
        try {
            const vehicle = await this.findById(vehicleId);
            if (!vehicle) {
                throw new errors_1.AppError('Vehicle not found', 404);
            }
            if (vehicle.status === 'out') {
                throw new errors_1.AppError('Vehicle is already checked out', 400);
            }
            const updatedVehicle = await this.update(vehicleId, {
                status: 'out',
                timeOut: new Date()
            }, updatedBy);
            logger_1.logger.info('Vehicle checked out', {
                vehicleId,
                vehicleNumber: vehicle.vehicleNumber,
                updatedBy
            });
            return updatedVehicle;
        }
        catch (error) {
            logger_1.logger.error('Error checking out vehicle', { error, vehicleId, updatedBy });
            throw error;
        }
    }
    async updateVehicleStatus(vehicleId, status, updatedBy) {
        try {
            const vehicle = await this.findById(vehicleId);
            if (!vehicle) {
                throw new errors_1.AppError('Vehicle not found', 404);
            }
            const validStatuses = ['active', 'maintenance', 'out_of_service', 'deleted'];
            if (!validStatuses.includes(status)) {
                throw new errors_1.AppError('Invalid vehicle status', 400);
            }
            const updatedVehicle = await this.update(vehicleId, {
                status,
                lastStatusUpdate: new Date()
            }, updatedBy);
            logger_1.logger.info('Vehicle status updated', {
                vehicleId,
                oldStatus: vehicle.currentStatus,
                newStatus: status,
                updatedBy
            });
            return updatedVehicle;
        }
        catch (error) {
            logger_1.logger.error('Error updating vehicle status', { error, vehicleId, status, updatedBy });
            throw error;
        }
    }
    async addMaintenanceRecord(vehicleId, maintenanceData, addedBy) {
        try {
            const vehicle = await this.findById(vehicleId);
            if (!vehicle) {
                throw new errors_1.AppError('Vehicle not found', 404);
            }
            const maintenanceRecord = {
                ...maintenanceData,
                maintenanceId: new mongoose_1.Types.ObjectId(),
                recordedAt: new Date(),
                recordedBy: addedBy ? new mongoose_1.Types.ObjectId(addedBy) : undefined
            };
            const updatedVehicle = await this.update(vehicleId, {
                $push: { maintenanceHistory: maintenanceRecord },
                lastMaintenanceDate: maintenanceData.maintenanceDate || new Date()
            }, addedBy);
            logger_1.logger.info('Maintenance record added to vehicle', {
                vehicleId,
                maintenanceType: maintenanceData.maintenanceType,
                addedBy
            });
            return updatedVehicle;
        }
        catch (error) {
            logger_1.logger.error('Error adding maintenance record', { error, vehicleId, maintenanceData, addedBy });
            throw error;
        }
    }
    async getVehiclesDueForMaintenance(companyId) {
        try {
            const today = new Date();
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                status: 'active',
                $or: [
                    { nextMaintenanceDate: { $lte: today } },
                    { 'insurance.expiryDate': { $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) } },
                    { 'registration.expiryDate': { $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) } }
                ]
            };
            return await this.findMany(query, { sort: { nextMaintenanceDate: 1 } });
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicles due for maintenance', { error, companyId });
            throw error;
        }
    }
    async getVehicleStats(companyId) {
        try {
            const [totalVehicles, vehiclesByStatus, vehiclesByType, maintenanceDue, insuranceExpiring, registrationExpiring] = await Promise.all([
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), status: { $ne: 'deleted' } }),
                models_1.Vehicle.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), status: { $ne: 'deleted' } } },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                models_1.Vehicle.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), status: 'active' } },
                    { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
                ]),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    status: 'active',
                    nextMaintenanceDate: { $lte: new Date() }
                }),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    status: 'active',
                    'insurance.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
                }),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    status: 'active',
                    'registration.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
                })
            ]);
            return {
                totalVehicles,
                vehiclesByStatus,
                vehiclesByType,
                maintenanceDue,
                insuranceExpiring,
                registrationExpiring
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicle statistics', { error, companyId });
            throw error;
        }
    }
    async getMaintenanceHistory(vehicleId) {
        try {
            const vehicle = await this.findById(vehicleId);
            if (!vehicle) {
                throw new errors_1.AppError('Vehicle not found', 404);
            }
            return [];
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicle maintenance history', { error, vehicleId });
            throw error;
        }
    }
    validateVehicleData(vehicleData) {
        if (!vehicleData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!vehicleData.vehicleNumber) {
            throw new errors_1.AppError('Vehicle number is required', 400);
        }
        if (!vehicleData.driverName) {
            throw new errors_1.AppError('Driver name is required', 400);
        }
        if (!vehicleData.driverPhone) {
            throw new errors_1.AppError('Driver phone is required', 400);
        }
        const validPurposes = ['delivery', 'pickup', 'maintenance', 'other'];
        if (vehicleData.purpose && !validPurposes.includes(vehicleData.purpose)) {
            throw new errors_1.AppError('Invalid vehicle purpose', 400);
        }
    }
    async getVehiclesByType(companyId, vehicleType) {
        try {
            return await models_1.Vehicle.find({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                purpose: vehicleType
            })
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .lean();
        }
        catch (error) {
            logger_1.logger.error('Error getting vehicles by type', { error, companyId, vehicleType });
            throw error;
        }
    }
}
exports.VehicleService = VehicleService;
//# sourceMappingURL=VehicleService.js.map