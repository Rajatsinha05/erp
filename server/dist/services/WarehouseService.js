"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class WarehouseService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Warehouse);
    }
    async createWarehouse(warehouseData, createdBy) {
        try {
            this.validateWarehouseData(warehouseData);
            if (warehouseData.warehouseCode) {
                const existingWarehouse = await this.findOne({
                    warehouseCode: warehouseData.warehouseCode.toUpperCase(),
                    companyId: warehouseData.companyId
                });
                if (existingWarehouse) {
                    throw new errors_1.AppError('Warehouse code already exists', 400);
                }
            }
            if (!warehouseData.warehouseCode) {
                warehouseData.warehouseCode = await this.generateWarehouseCode(warehouseData.companyId.toString());
            }
            const warehouse = await this.create({
                ...warehouseData,
                warehouseCode: warehouseData.warehouseCode.toUpperCase(),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Warehouse created successfully', {
                warehouseId: warehouse._id,
                warehouseCode: warehouse.warehouseCode,
                warehouseName: warehouse.warehouseName,
                companyId: warehouseData.companyId,
                createdBy
            });
            return warehouse;
        }
        catch (error) {
            logger_1.logger.error('Error creating warehouse', { error, warehouseData, createdBy });
            throw error;
        }
    }
    async getWarehouseByCode(warehouseCode, companyId) {
        try {
            return await this.findOne({
                warehouseCode: warehouseCode.toUpperCase(),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting warehouse by code', { error, warehouseCode, companyId });
            throw error;
        }
    }
    async getWarehousesByCompany(companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true
            };
            return await this.findMany(query, options);
        }
        catch (error) {
            logger_1.logger.error('Error getting warehouses by company', { error, companyId });
            throw error;
        }
    }
    async getWarehousesByType(companyId, warehouseType) {
        try {
            return await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                warehouseType,
                isActive: true
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting warehouses by type', { error, companyId, warehouseType });
            throw error;
        }
    }
    async updateWarehouseCapacity(warehouseId, capacity, updatedBy) {
        try {
            const warehouse = await this.findById(warehouseId);
            if (!warehouse) {
                throw new errors_1.AppError('Warehouse not found', 404);
            }
            const updateData = {};
            if (capacity.totalArea !== undefined) {
                updateData['capacity.totalArea'] = capacity.totalArea;
            }
            if (capacity.storageCapacity !== undefined) {
                updateData['capacity.storageCapacity'] = capacity.storageCapacity;
            }
            if (capacity.maxWeight !== undefined) {
                updateData['capacity.maxWeight'] = capacity.maxWeight;
            }
            const updatedWarehouse = await this.update(warehouseId, updateData, updatedBy);
            logger_1.logger.info('Warehouse capacity updated', {
                warehouseId,
                capacity,
                updatedBy
            });
            return updatedWarehouse;
        }
        catch (error) {
            logger_1.logger.error('Error updating warehouse capacity', { error, warehouseId, capacity, updatedBy });
            throw error;
        }
    }
    async addStorageZone(warehouseId, zoneData, addedBy) {
        try {
            const warehouse = await this.findById(warehouseId);
            if (!warehouse) {
                throw new errors_1.AppError('Warehouse not found', 404);
            }
            const existingZone = warehouse.zones?.find(zone => zone.zoneCode === zoneData.zoneCode);
            if (existingZone) {
                throw new errors_1.AppError('Zone code already exists in this warehouse', 400);
            }
            const newZone = {
                ...zoneData,
                zoneId: new mongoose_1.Types.ObjectId(),
                isActive: true,
                createdAt: new Date()
            };
            const updatedWarehouse = await this.update(warehouseId, {
                $push: { zones: newZone }
            }, addedBy);
            logger_1.logger.info('Storage zone added to warehouse', {
                warehouseId,
                zoneCode: zoneData.zoneCode,
                addedBy
            });
            return updatedWarehouse;
        }
        catch (error) {
            logger_1.logger.error('Error adding storage zone', { error, warehouseId, zoneData, addedBy });
            throw error;
        }
    }
    async getWarehouseUtilization(warehouseId) {
        try {
            const warehouse = await this.findById(warehouseId);
            if (!warehouse) {
                throw new errors_1.AppError('Warehouse not found', 404);
            }
            const totalCapacity = warehouse.capacity?.maxVolume || 0;
            const usedCapacity = warehouse.currentUtilization?.currentVolume || 0;
            const utilizationPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
            return {
                warehouseId,
                warehouseName: warehouse.warehouseName,
                totalCapacity,
                usedCapacity,
                availableCapacity: totalCapacity - usedCapacity,
                utilizationPercentage: parseFloat(utilizationPercentage.toFixed(2)),
                storageZones: warehouse.zones?.length || 0,
                activeZones: warehouse.zones?.filter(zone => zone.isActive).length || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting warehouse utilization', { error, warehouseId });
            throw error;
        }
    }
    async getWarehouseStats(companyId) {
        try {
            const [totalWarehouses, activeWarehouses, warehousesByType, totalCapacity, totalUtilization] = await Promise.all([
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) }),
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true }),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: '$warehouseType', count: { $sum: 1 } } }
                ]),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: null, totalCapacity: { $sum: '$capacity.storageCapacity' } } }
                ]),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: null, totalUtilization: { $sum: '$currentUtilization.usedCapacity' } } }
                ])
            ]);
            const capacity = totalCapacity[0]?.totalCapacity || 0;
            const utilization = totalUtilization[0]?.totalUtilization || 0;
            const utilizationPercentage = capacity > 0 ? (utilization / capacity) * 100 : 0;
            return {
                totalWarehouses,
                activeWarehouses,
                warehousesByType,
                totalCapacity: capacity,
                totalUtilization: utilization,
                availableCapacity: capacity - utilization,
                overallUtilizationPercentage: parseFloat(utilizationPercentage.toFixed(2))
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting warehouse statistics', { error, companyId });
            throw error;
        }
    }
    async generateWarehouseCode(companyId) {
        const count = await this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) });
        return `WH${(count + 1).toString().padStart(4, '0')}`;
    }
    validateWarehouseData(warehouseData) {
        if (!warehouseData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!warehouseData.warehouseName) {
            throw new errors_1.AppError('Warehouse name is required', 400);
        }
        if (!warehouseData.warehouseType) {
            throw new errors_1.AppError('Warehouse type is required', 400);
        }
        if (!warehouseData.address) {
            throw new errors_1.AppError('Warehouse address is required', 400);
        }
        if (warehouseData.specifications?.totalArea && warehouseData.specifications.totalArea <= 0) {
            throw new errors_1.AppError('Total area must be greater than 0', 400);
        }
        if (warehouseData.capacity?.maxVolume && warehouseData.capacity.maxVolume <= 0) {
            throw new errors_1.AppError('Storage capacity must be greater than 0', 400);
        }
    }
}
exports.WarehouseService = WarehouseService;
//# sourceMappingURL=WarehouseService.js.map