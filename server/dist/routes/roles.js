"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const Role_1 = __importDefault(require("@/models/Role"));
const User_1 = __importDefault(require("@/models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', status = 'all', roleType = 'all', level = 'all', department = 'all' } = req.query;
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
                { roleCode: { $regex: searchTerm, $options: 'i' } },
                { roleName: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            query.status = status;
        }
        if (roleType !== 'all') {
            query.roleType = roleType;
        }
        if (level !== 'all') {
            query.level = level;
        }
        if (department !== 'all') {
            query.department = department;
        }
        const roles = await Role_1.default.find(query)
            .populate('companyId', 'companyName companyCode')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await Role_1.default.countDocuments(query);
        const roleIds = roles.map(role => role._id);
        const userCounts = await User_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true,
                    'roleAccess.roleId': { $in: roleIds }
                }
            },
            { $unwind: '$roleAccess' },
            {
                $match: {
                    'roleAccess.roleId': { $in: roleIds },
                    'roleAccess.isActive': true
                }
            },
            {
                $group: {
                    _id: '$roleAccess.roleId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const userCountMap = userCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});
        const transformedRoles = roles.map(role => ({
            _id: role._id,
            roleCode: role.roleCode,
            roleName: role.roleName,
            description: role.description,
            roleType: role.roleType || 'custom',
            level: role.roleLevel,
            department: role.department,
            status: role.isActive ? 'active' : 'inactive',
            permissions: role.permissions || {},
            userCount: userCountMap[role._id.toString()] || 0,
            isSystemRole: role.isSystemRole || false,
            companyId: role.companyId,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt
        }));
        res.json({
            success: true,
            data: transformedRoles,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            error: 'Failed to fetch roles',
            message: 'An error occurred while fetching roles'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        const stats = await Role_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalRoles: { $sum: 1 },
                    activeRoles: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    inactiveRoles: {
                        $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
                    },
                    systemRoles: {
                        $sum: { $cond: [{ $eq: ['$roleType', 'system'] }, 1, 0] }
                    },
                    customRoles: {
                        $sum: { $cond: [{ $eq: ['$roleType', 'custom'] }, 1, 0] }
                    }
                }
            }
        ]);
        const totalUsersAssigned = await User_1.default.countDocuments({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true,
            'roleAccess.isActive': true
        });
        const rolesByDepartment = await Role_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true,
                    department: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);
        const rolesByLevel = await Role_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true,
                    level: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 }
                }
            }
        ]);
        const result = stats[0] || {
            totalRoles: 0,
            activeRoles: 0,
            inactiveRoles: 0,
            systemRoles: 0,
            customRoles: 0
        };
        res.json({
            success: true,
            data: {
                ...result,
                totalUsersAssigned,
                rolesByDepartment: rolesByDepartment.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                rolesByLevel: rolesByLevel.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    }
    catch (error) {
        console.error('Get role stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch role statistics',
            message: 'An error occurred while fetching role statistics'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const roleData = req.body;
        const newRole = new Role_1.default({
            ...roleData,
            companyId: user.companyId,
            createdBy: user.userId,
            isActive: true,
            isSystemRole: false,
            roleType: roleData.roleType || 'custom'
        });
        await newRole.save();
        res.status(201).json({
            success: true,
            data: newRole,
            message: 'Role created successfully'
        });
    }
    catch (error) {
        console.error('Create role error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Duplicate role',
                message: 'A role with this code already exists'
            });
        }
        res.status(500).json({
            error: 'Failed to create role',
            message: 'An error occurred while creating the role'
        });
    }
});
router.put('/:roleId', async (req, res) => {
    try {
        const user = req.user;
        const { roleId } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                error: 'Invalid role ID',
                message: 'The provided role ID is not valid'
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(roleId),
            isActive: true
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const updatedRole = await Role_1.default.findOneAndUpdate(query, {
            ...updateData,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true, runValidators: true });
        if (!updatedRole) {
            return res.status(404).json({
                error: 'Role not found',
                message: 'The requested role was not found or you do not have access to it'
            });
        }
        res.json({
            success: true,
            data: updatedRole,
            message: 'Role updated successfully'
        });
    }
    catch (error) {
        console.error('Update role error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Failed to update role',
            message: 'An error occurred while updating the role'
        });
    }
});
router.delete('/:roleId', async (req, res) => {
    try {
        const user = req.user;
        const { roleId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                error: 'Invalid role ID',
                message: 'The provided role ID is not valid'
            });
        }
        const usersWithRole = await User_1.default.countDocuments({
            'roleAccess.roleId': new mongoose_1.default.Types.ObjectId(roleId),
            'roleAccess.isActive': true,
            isActive: true
        });
        if (usersWithRole > 0) {
            return res.status(400).json({
                error: 'Role in use',
                message: `Cannot delete role as it is assigned to ${usersWithRole} user(s)`
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(roleId),
            isActive: true,
            isSystemRole: { $ne: true }
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const deletedRole = await Role_1.default.findOneAndUpdate(query, {
            isActive: false,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true });
        if (!deletedRole) {
            return res.status(404).json({
                error: 'Role not found',
                message: 'The requested role was not found, is a system role, or you do not have access to it'
            });
        }
        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            error: 'Failed to delete role',
            message: 'An error occurred while deleting the role'
        });
    }
});
exports.default = router;
//# sourceMappingURL=roles.js.map