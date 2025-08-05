"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const logger_1 = __importDefault(require("@/utils/logger"));
const router = (0, express_1.Router)();
router.post('/superadmin', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Not allowed in production',
                message: 'This endpoint is only available in development mode'
            });
        }
        logger_1.default.info('Setting up super admin...');
        const existingSuperAdmin = await User_1.default.findOne({ isSuperAdmin: true });
        if (existingSuperAdmin) {
            logger_1.default.info('Super admin already exists', {
                username: existingSuperAdmin.username,
                email: existingSuperAdmin.email,
                isSuperAdmin: existingSuperAdmin.isSuperAdmin
            });
            await User_1.default.updateOne({ _id: existingSuperAdmin._id }, {
                $set: {
                    isSuperAdmin: true,
                    isActive: true
                }
            });
            return res.json({
                success: true,
                message: 'Super admin already exists and has been updated',
                data: {
                    username: existingSuperAdmin.username,
                    email: existingSuperAdmin.email,
                    isSuperAdmin: true
                }
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
        const superAdmin = new User_1.default({
            username: 'superadmin',
            email: 'admin@erpsystem.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            isSuperAdmin: true,
            isActive: true,
            companyAccess: [],
            preferences: {
                dashboard: {}
            }
        });
        await superAdmin.save();
        logger_1.default.info('Super admin created successfully', {
            username: superAdmin.username,
            email: superAdmin.email,
            isSuperAdmin: superAdmin.isSuperAdmin
        });
        res.json({
            success: true,
            message: 'Super admin created successfully',
            data: {
                username: superAdmin.username,
                email: superAdmin.email,
                isSuperAdmin: true
            },
            credentials: {
                username: 'superadmin',
                password: 'admin123',
                email: 'admin@erpsystem.com'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error setting up super admin:', error);
        res.status(500).json({
            error: 'Failed to setup super admin',
            message: error.message
        });
    }
});
router.get('/superadmin/status', async (req, res) => {
    try {
        const superAdmin = await User_1.default.findOne({ isSuperAdmin: true }).select('username email isSuperAdmin isActive');
        const allCompanies = await Company_1.default.find({ isActive: true }).select('_id companyName companyCode').lean();
        res.json({
            success: true,
            data: {
                superAdminExists: !!superAdmin,
                superAdmin: superAdmin ? {
                    username: superAdmin.username,
                    email: superAdmin.email,
                    isSuperAdmin: superAdmin.isSuperAdmin,
                    isActive: superAdmin.isActive
                } : null,
                totalCompanies: allCompanies.length,
                companies: allCompanies
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error checking super admin status:', error);
        res.status(500).json({
            error: 'Failed to check super admin status',
            message: error.message
        });
    }
});
router.post('/superadmin/fix-access', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Not allowed in production',
                message: 'This endpoint is only available in development mode'
            });
        }
        const superAdmin = await User_1.default.findOne({ isSuperAdmin: true });
        if (!superAdmin) {
            return res.status(404).json({
                error: 'Super admin not found',
                message: 'Please create super admin first'
            });
        }
        await User_1.default.updateOne({ _id: superAdmin._id }, {
            $set: {
                isSuperAdmin: true,
                isActive: true,
                companyAccess: []
            }
        });
        logger_1.default.info('Super admin access fixed', {
            userId: superAdmin._id,
            username: superAdmin.username
        });
        res.json({
            success: true,
            message: 'Super admin access has been fixed',
            data: {
                username: superAdmin.username,
                email: superAdmin.email,
                isSuperAdmin: true,
                isActive: true
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fixing super admin access:', error);
        res.status(500).json({
            error: 'Failed to fix super admin access',
            message: error.message
        });
    }
});
router.post('/superadmin/reset-password', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Not allowed in production',
                message: 'This endpoint is only available in development mode'
            });
        }
        const { password = 'admin123' } = req.body;
        const superAdmin = await User_1.default.findOne({ isSuperAdmin: true });
        if (!superAdmin) {
            return res.status(404).json({
                error: 'Super admin not found',
                message: 'Please create super admin first'
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        await User_1.default.updateOne({ _id: superAdmin._id }, {
            $set: {
                password: hashedPassword,
                isSuperAdmin: true,
                isActive: true
            }
        });
        logger_1.default.info('Super admin password reset', {
            userId: superAdmin._id,
            username: superAdmin.username
        });
        res.json({
            success: true,
            message: 'Super admin password has been reset',
            data: {
                username: superAdmin.username,
                email: superAdmin.email,
                newPassword: password
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error resetting super admin password:', error);
        res.status(500).json({
            error: 'Failed to reset super admin password',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=setup.js.map