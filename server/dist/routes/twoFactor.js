"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TwoFactorService_1 = __importDefault(require("@/services/TwoFactorService"));
const auth_1 = require("@/middleware/auth");
const User_1 = __importDefault(require("@/models/User"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const twoFactorRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many 2FA attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const status = await TwoFactorService_1.default.getTwoFactorStatus(userId);
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        console.error('Get 2FA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get 2FA status'
        });
    }
});
router.post('/setup', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        console.log('Setting up 2FA for user:', userId);
        const setupData = await TwoFactorService_1.default.setupTwoFactor(userId);
        res.json({
            success: true,
            data: setupData,
            message: 'Scan the QR code with your authenticator app'
        });
    }
    catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to setup 2FA'
        });
    }
});
router.post('/test', auth_1.authenticate, twoFactorRateLimit, async (req, res) => {
    try {
        const { secret, token } = req.body;
        if (!secret || !token) {
            return res.status(400).json({
                success: false,
                message: 'Secret and token are required'
            });
        }
        const result = await TwoFactorService_1.default.testToken(secret, token);
        res.json({
            success: result.verified,
            message: result.message
        });
    }
    catch (error) {
        console.error('2FA test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test token'
        });
    }
});
router.post('/enable', auth_1.authenticate, twoFactorRateLimit, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }
        const result = await TwoFactorService_1.default.enableTwoFactor(userId, token);
        res.json({
            success: true,
            data: result,
            message: 'Two-factor authentication enabled successfully'
        });
    }
    catch (error) {
        console.error('2FA enable error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to enable 2FA'
        });
    }
});
router.post('/disable', auth_1.authenticate, twoFactorRateLimit, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { password, token } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to disable 2FA'
            });
        }
        const result = await TwoFactorService_1.default.disableTwoFactor(userId, password, token);
        res.json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error('2FA disable error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to disable 2FA'
        });
    }
});
router.post('/verify', twoFactorRateLimit, async (req, res) => {
    try {
        const { token, backupCode, tempToken } = req.body;
        if (!tempToken) {
            return res.status(400).json({
                success: false,
                message: 'Temporary token required'
            });
        }
        const jwt = require('jsonwebtoken');
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired temporary token'
            });
        }
        if (decoded.type !== 'temp_2fa') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }
        const userId = decoded.userId;
        let verified = false;
        if (token) {
            verified = await TwoFactorService_1.default.verifyToken(userId, token, false);
        }
        else if (backupCode) {
            verified = await TwoFactorService_1.default.verifyToken(userId, backupCode, true);
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Token or backup code required'
            });
        }
        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }
        const User = require('@/models/User').default;
        const user = await User.findById(userId)
            .populate('companyAccess.companyId')
            .select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const { generateAccessToken } = require('@/middleware/auth');
        const accessToken = generateAccessToken(user, user.companyAccess?.[0]?.companyId?._id);
        user.lastLoginAt = new Date();
        await user.save();
        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    personalInfo: user.personalInfo,
                    isSuperAdmin: user.isSuperAdmin,
                    isActive: user.isActive,
                    companyAccess: user.companyAccess,
                    lastLoginAt: new Date()
                },
                tokens: {
                    accessToken
                },
                companies: user.companyAccess?.map((access) => access.companyId) || [],
                currentCompany: user.companyAccess?.[0]?.companyId || null,
                permissions: {}
            },
            message: 'Two-factor authentication successful'
        });
    }
    catch (error) {
        console.error('2FA verify error:', error);
        if (error.message.includes('locked')) {
            return res.status(423).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Two-factor authentication failed'
        });
    }
});
router.post('/backup-codes', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to generate backup codes'
            });
        }
        const result = await TwoFactorService_1.default.generateBackupCodes(userId, password);
        res.json({
            success: true,
            data: result,
            message: 'New backup codes generated successfully'
        });
    }
    catch (error) {
        console.error('Generate backup codes error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate backup codes'
        });
    }
});
router.post('/reset-request', twoFactorRateLimit, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Temporary token required'
            });
        }
        const tempToken = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired temporary token'
            });
        }
        if (decoded.type !== 'temp_2fa') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }
        const userId = decoded.userId;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const resetToken = jwt.sign({
            userId: user._id,
            type: '2fa_reset',
            timestamp: Date.now()
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`2FA Reset token for ${user.email}: ${resetToken}`);
        const { logSecurity } = require('@/utils/logger');
        logSecurity('2FA reset requested', {
            userId: user._id,
            username: user.username,
            email: user.email
        });
        res.json({
            success: true,
            message: 'Reset instructions have been sent to your email address. Please check your inbox.',
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    }
    catch (error) {
        console.error('2FA reset request error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process reset request'
        });
    }
});
exports.default = router;
//# sourceMappingURL=twoFactor.js.map