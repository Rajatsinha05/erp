"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TwoFactor_1 = __importDefault(require("@/models/TwoFactor"));
const User_1 = __importDefault(require("@/models/User"));
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.get('/users/2fa-status', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const users = await User_1.default.find({}, {
            password: 0,
            refreshTokens: 0
        }).lean();
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
        const stats = {
            totalUsers: users.length,
            twoFactorEnabled: usersWith2FA.filter(u => u.twoFactorEnabled).length,
            twoFactorDisabled: usersWith2FA.filter(u => !u.twoFactorEnabled).length,
            adoptionRate: users.length > 0 ? Math.round((usersWith2FA.filter(u => u.twoFactorEnabled).length / users.length) * 100) : 0
        };
        res.json({
            success: true,
            data: {
                users: usersWith2FA,
                stats
            }
        });
    }
    catch (error) {
        console.error('Get users 2FA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users 2FA status'
        });
    }
});
router.post('/users/:userId/enable-2fa', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id || req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const existingTwoFactor = await TwoFactor_1.default.findOne({ userId });
        if (existingTwoFactor && existingTwoFactor.isEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled for this user'
            });
        }
        let twoFactor = existingTwoFactor;
        if (!twoFactor) {
            const speakeasy = require('speakeasy');
            const secret = speakeasy.generateSecret({
                name: `ERP (${user.email})`,
                issuer: 'ERP System',
                length: 20
            });
            twoFactor = new TwoFactor_1.default({
                userId,
                secret: secret.base32,
                isEnabled: false
            });
        }
        const backupCodes = await twoFactor.generateBackupCodes();
        await twoFactor.enable();
        (0, logger_1.logAudit)('Admin enabled 2FA for user', {
            adminId,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_ENABLE_2FA'
        });
        res.json({
            success: true,
            data: {
                backupCodes,
                message: `2FA enabled for user ${user.username}. Backup codes generated.`
            },
            message: '2FA enabled successfully'
        });
    }
    catch (error) {
        console.error('Admin enable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enable 2FA'
        });
    }
});
router.post('/users/:userId/disable-2fa', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id || req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const twoFactor = await TwoFactor_1.default.findOne({ userId });
        if (!twoFactor || !twoFactor.isEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled for this user'
            });
        }
        await twoFactor.disable();
        (0, logger_1.logAudit)('Admin disabled 2FA for user', {
            adminId,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_DISABLE_2FA'
        });
        res.json({
            success: true,
            message: `2FA disabled for user ${user.username}`
        });
    }
    catch (error) {
        console.error('Admin disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable 2FA'
        });
    }
});
router.post('/users/:userId/force-disable-2fa', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id || req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const result = await TwoFactor_1.default.findOneAndDelete({ userId });
        if (!result) {
            return res.status(400).json({
                success: false,
                message: '2FA is not set up for this user'
            });
        }
        (0, logger_1.logAudit)('Admin force disabled 2FA for user', {
            adminId,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_FORCE_DISABLE_2FA'
        });
        res.json({
            success: true,
            message: `2FA force disabled for user ${user.username}. All 2FA settings and backup codes removed.`
        });
    }
    catch (error) {
        console.error('Admin force disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to force disable 2FA'
        });
    }
});
router.post('/users/:userId/reset-2fa', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id || req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const twoFactor = await TwoFactor_1.default.findOne({ userId });
        if (!twoFactor) {
            return res.status(400).json({
                success: false,
                message: '2FA is not set up for this user'
            });
        }
        const speakeasy = require('speakeasy');
        const secret = speakeasy.generateSecret({
            name: `ERP System (${user.email})`,
            issuer: 'ERP Management System',
            length: 32
        });
        twoFactor.secret = secret.base32;
        twoFactor.isEnabled = false;
        twoFactor.setupAt = new Date();
        const backupCodes = await twoFactor.generateBackupCodes();
        await twoFactor.save();
        (0, logger_1.logAudit)('Admin reset 2FA for user', {
            adminId,
            targetUserId: userId,
            targetUsername: user.username,
            action: 'ADMIN_RESET_2FA'
        });
        res.json({
            success: true,
            data: {
                backupCodes,
                message: `2FA reset for user ${user.username}. New secret generated and user must re-enable 2FA.`
            },
            message: '2FA reset successfully'
        });
    }
    catch (error) {
        console.error('Admin reset 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset 2FA'
        });
    }
});
router.get('/2fa-audit-log', auth_1.authenticate, auth_1.requireSuperAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        res.json({
            success: true,
            data: {
                logs: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    pages: 0
                }
            }
        });
    }
    catch (error) {
        console.error('Get 2FA audit log error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get audit log'
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminTwoFactor.js.map