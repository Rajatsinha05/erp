"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const TwoFactor_1 = __importDefault(require("@/models/TwoFactor"));
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
router.get('/users', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        let query = {};
        if (!currentUser?.isSuperAdmin) {
            query = { 'companyAccess.companyId': currentUser?.companyId };
        }
        const users = await User_1.default.find(query, {
            password: 0,
            refreshTokens: 0
        }).populate('companyAccess.companyId', 'companyName companyCode').lean();
        const usersWith2FA = await Promise.all(users.map(async (user) => {
            const twoFactor = await TwoFactor_1.default.findOne({ userId: user._id });
            return {
                ...user,
                twoFactorEnabled: twoFactor ? twoFactor.isEnabled : false,
                twoFactorSetupAt: twoFactor?.setupAt,
                twoFactorLastUsed: twoFactor?.lastUsed,
                backupCodesCount: twoFactor ? twoFactor.getUnusedBackupCodesCount() : 0
            };
        }));
        res.json({
            success: true,
            data: usersWith2FA
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
});
router.post('/users', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { username, email, firstName, lastName, phone, password, companyId, role, department, designation, isActive } = req.body;
        if (!username || !email || !firstName || !lastName || !password || !companyId || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const existingUser = await User_1.default.findOne({
            $or: [{ username }, { email }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this username or email already exists'
            });
        }
        if (!currentUser?.isSuperAdmin && companyId !== currentUser?.companyId) {
            return res.status(403).json({
                success: false,
                message: 'You can only create users for your own company'
            });
        }
        const company = await Company_1.default.findById(companyId);
        if (!company) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company selected'
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const newUser = new User_1.default({
            username,
            email,
            personalInfo: {
                firstName,
                lastName,
                phone: phone || ''
            },
            password: hashedPassword,
            companyAccess: [{
                    companyId,
                    role,
                    department: department || 'Management',
                    designation: designation || '',
                    permissions: {
                        inventory: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        production: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        orders: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        financial: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        security: { gateManagement: false, visitorManagement: false, vehicleTracking: false, cctvAccess: false, emergencyResponse: false, securityReports: false, incidentManagement: false, accessControl: false, patrolManagement: false },
                        hr: { viewEmployees: false, manageEmployees: false, manageAttendance: false, manageSalary: false, manageLeaves: false, viewReports: false, recruitment: false, performance: false, training: false, disciplinary: false },
                        admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
                    },
                    isActive: true,
                    joinedAt: new Date()
                }],
            isActive: isActive !== undefined ? isActive : true,
            isSuperAdmin: role === 'super_admin' && currentUser?.isSuperAdmin
        });
        await newUser.save();
        (0, logger_1.logAudit)('Admin created user', {
            adminId: currentUser?._id,
            targetUserId: newUser._id,
            targetUsername: username,
            companyId,
            action: 'ADMIN_CREATE_USER'
        });
        res.status(201).json({
            success: true,
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                personalInfo: newUser.personalInfo,
                companyAccess: newUser.companyAccess,
                isActive: newUser.isActive
            },
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});
router.put('/users/:userId', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const { username, email, firstName, lastName, phone, password, companyId, role, department, designation, isActive } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (!currentUser?.isSuperAdmin) {
            const userCompanyId = user.companyAccess?.[0]?.companyId?.toString();
            if (userCompanyId !== currentUser?.companyId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only edit users from your own company'
                });
            }
        }
        if (username)
            user.username = username;
        if (email)
            user.email = email;
        if (firstName)
            user.personalInfo.firstName = firstName;
        if (lastName)
            user.personalInfo.lastName = lastName;
        if (phone !== undefined)
            user.personalInfo.phone = phone;
        if (isActive !== undefined)
            user.isActive = isActive;
        if (password && password.length >= 8) {
            user.password = await bcryptjs_1.default.hash(password, 12);
            user.security.passwordLastChanged = new Date();
        }
        if (companyId && role) {
            const company = await Company_1.default.findById(companyId);
            if (!company) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid company selected'
                });
            }
            user.companyAccess = [{
                    companyId,
                    role,
                    department: department || 'Management',
                    designation: designation || '',
                    permissions: user.companyAccess?.[0]?.permissions || {
                        inventory: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        production: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        orders: { view: true, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        financial: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                        security: { gateManagement: false, visitorManagement: false, vehicleTracking: false, cctvAccess: false, emergencyResponse: false, securityReports: false, incidentManagement: false, accessControl: false, patrolManagement: false },
                        hr: { viewEmployees: false, manageEmployees: false, manageAttendance: false, manageSalary: false, manageLeaves: false, viewReports: false, recruitment: false, performance: false, training: false, disciplinary: false },
                        admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
                    },
                    isActive: true,
                    joinedAt: user.companyAccess?.[0]?.joinedAt || new Date()
                }];
            if (currentUser?.isSuperAdmin) {
                user.isSuperAdmin = role === 'super_admin';
            }
        }
        await user.save();
        (0, logger_1.logAudit)('Admin updated user', {
            adminId: currentUser?._id,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_UPDATE_USER'
        });
        res.json({
            success: true,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});
router.delete('/users/:userId', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.isSuperAdmin && !currentUser?.isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete super admin user'
            });
        }
        await TwoFactor_1.default.findOneAndDelete({ userId });
        await User_1.default.findByIdAndDelete(userId);
        (0, logger_1.logAudit)('Admin deleted user', {
            adminId: currentUser?._id,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_DELETE_USER'
        });
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});
router.post('/users/:userId/toggle-status', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (!currentUser?.isSuperAdmin) {
            const userCompanyId = user.companyAccess?.[0]?.companyId?.toString();
            if (userCompanyId !== currentUser?.companyId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only manage users from your own company'
                });
            }
        }
        user.isActive = !user.isActive;
        await user.save();
        (0, logger_1.logAudit)('Admin toggled user status', {
            adminId: currentUser?._id,
            targetUserId: userId,
            targetUsername: user.username,
            newStatus: user.isActive,
            action: 'ADMIN_TOGGLE_USER_STATUS'
        });
        res.json({
            success: true,
            data: {
                isActive: user.isActive
            },
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
        });
    }
    catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminUsers.js.map