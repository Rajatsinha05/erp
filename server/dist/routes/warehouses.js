"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const Warehouse_1 = __importDefault(require("@/models/Warehouse"));
const InventoryItem_1 = __importDefault(require("@/models/InventoryItem"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', status = 'all', type = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const searchTerm = search;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        let query = {
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        };
        if (searchTerm) {
            query.$or = [
                { warehouseCode: { $regex: searchTerm, $options: 'i' } },
                { warehouseName: { $regex: searchTerm, $options: 'i' } },
                { 'address.city': { $regex: searchTerm, $options: 'i' } },
                { 'address.state': { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            query.status = status;
        }
        if (type !== 'all') {
            query.warehouseType = type;
        }
        const warehouses = await Warehouse_1.default.find(query)
            .populate('companyId', 'companyName companyCode')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await Warehouse_1.default.countDocuments(query);
        const warehouseIds = warehouses.map(w => w._id);
        const itemCounts = await InventoryItem_1.default.aggregate([
            {
                $match: {
                    'locations.warehouseId': { $in: warehouseIds },
                    isActive: true
                }
            },
            { $unwind: '$locations' },
            {
                $match: {
                    'locations.warehouseId': { $in: warehouseIds }
                }
            },
            {
                $group: {
                    _id: '$locations.warehouseId',
                    itemCount: { $sum: 1 }
                }
            }
        ]);
        const itemCountMap = itemCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.itemCount;
            return acc;
        }, {});
        const transformedWarehouses = warehouses.map(warehouse => ({
            _id: warehouse._id,
            warehouseCode: warehouse.warehouseCode,
            warehouseName: warehouse.warehouseName,
            warehouseType: warehouse.warehouseType,
            status: warehouse.isActive ? 'active' : 'inactive',
            address: warehouse.address,
            capacity: warehouse.capacity || {
                totalCapacity: 0,
                availableCapacity: 0,
                utilizationPercentage: 0,
                unit: 'sqft'
            },
            manager: warehouse.manager,
            operatingHours: warehouse.operatingHours,
            facilities: warehouse.facilities || [],
            itemCount: itemCountMap[warehouse._id.toString()] || 0,
            companyId: warehouse.companyId,
            createdAt: warehouse.createdAt,
            updatedAt: warehouse.updatedAt
        }));
        res.json({
            success: true,
            data: transformedWarehouses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get warehouses error:', error);
        res.status(500).json({
            error: 'Failed to fetch warehouses',
            message: 'An error occurred while fetching warehouses'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        const stats = await Warehouse_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalWarehouses: { $sum: 1 },
                    activeWarehouses: { $sum: { $cond: ['$isActive', 1, 0] } },
                    totalCapacity: { $sum: '$capacity.totalCapacity' },
                    totalUtilizedCapacity: { $sum: '$capacity.utilizedCapacity' }
                }
            }
        ]);
        const typeStats = await Warehouse_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: '$warehouseType',
                    count: { $sum: 1 }
                }
            }
        ]);
        const topWarehouses = await Warehouse_1.default.find({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        })
            .select('warehouseName capacity')
            .sort({ 'capacity.utilizationPercentage': -1 })
            .limit(5)
            .lean();
        const result = stats[0] || {
            totalWarehouses: 0,
            activeWarehouses: 0,
            totalCapacity: 0,
            totalUtilizedCapacity: 0
        };
        const averageUtilization = result.totalCapacity > 0
            ? Math.round((result.totalUtilizedCapacity / result.totalCapacity) * 100)
            : 0;
        res.json({
            success: true,
            data: {
                ...result,
                inactiveWarehouses: result.totalWarehouses - result.activeWarehouses,
                maintenanceWarehouses: 0,
                averageUtilization,
                warehousesByType: typeStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                warehousesByStatus: {
                    active: result.activeWarehouses,
                    inactive: result.totalWarehouses - result.activeWarehouses
                },
                topWarehouses: topWarehouses.map(w => ({
                    _id: w._id,
                    warehouseName: w.warehouseName,
                    utilizationPercentage: w.capacity?.utilizationPercentage || 0,
                    itemCount: 0
                }))
            }
        });
    }
    catch (error) {
        console.error('Get warehouse stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch warehouse statistics',
            message: 'An error occurred while fetching warehouse statistics'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const warehouseData = req.body;
        const newWarehouse = new Warehouse_1.default({
            ...warehouseData,
            companyId: user.companyId,
            createdBy: user.userId,
            isActive: true
        });
        await newWarehouse.save();
        res.status(201).json({
            success: true,
            data: newWarehouse,
            message: 'Warehouse created successfully'
        });
    }
    catch (error) {
        console.error('Create warehouse error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Duplicate warehouse',
                message: 'A warehouse with this code already exists'
            });
        }
        res.status(500).json({
            error: 'Failed to create warehouse',
            message: 'An error occurred while creating the warehouse'
        });
    }
});
router.put('/:warehouseId', async (req, res) => {
    try {
        const user = req.user;
        const { warehouseId } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(warehouseId)) {
            return res.status(400).json({
                error: 'Invalid warehouse ID',
                message: 'The provided warehouse ID is not valid'
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(warehouseId),
            isActive: true
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const updatedWarehouse = await Warehouse_1.default.findOneAndUpdate(query, {
            ...updateData,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true, runValidators: true });
        if (!updatedWarehouse) {
            return res.status(404).json({
                error: 'Warehouse not found',
                message: 'The requested warehouse was not found or you do not have access to it'
            });
        }
        res.json({
            success: true,
            data: updatedWarehouse,
            message: 'Warehouse updated successfully'
        });
    }
    catch (error) {
        console.error('Update warehouse error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Failed to update warehouse',
            message: 'An error occurred while updating the warehouse'
        });
    }
});
router.delete('/:warehouseId', async (req, res) => {
    try {
        const user = req.user;
        const { warehouseId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(warehouseId)) {
            return res.status(400).json({
                error: 'Invalid warehouse ID',
                message: 'The provided warehouse ID is not valid'
            });
        }
        const hasInventory = await InventoryItem_1.default.countDocuments({
            'locations.warehouseId': new mongoose_1.default.Types.ObjectId(warehouseId),
            isActive: true
        });
        if (hasInventory > 0) {
            return res.status(400).json({
                error: 'Warehouse has inventory',
                message: `Cannot delete warehouse as it contains ${hasInventory} inventory items`
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(warehouseId),
            isActive: true
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const deletedWarehouse = await Warehouse_1.default.findOneAndUpdate(query, {
            isActive: false,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true });
        if (!deletedWarehouse) {
            return res.status(404).json({
                error: 'Warehouse not found',
                message: 'The requested warehouse was not found or you do not have access to it'
            });
        }
        res.json({
            success: true,
            message: 'Warehouse deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete warehouse error:', error);
        res.status(500).json({
            error: 'Failed to delete warehouse',
            message: 'An error occurred while deleting the warehouse'
        });
    }
});
exports.default = router;
//# sourceMappingURL=warehouses.js.map