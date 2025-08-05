"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const auth_2 = __importDefault(require("../auth"));
const visitorsSimple_1 = __importDefault(require("./visitorsSimple"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API v2 Simple is healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0-simple'
    });
});
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            name: 'Factory ERP API - Simple Version',
            version: '2.0.0-simple',
            description: 'Simplified Factory ERP System with Core Functionality',
            features: [
                'Basic Visitor Management',
                'User Authentication',
                'Simple CRUD Operations',
                'Error Handling',
                'Logging'
            ],
            endpoints: {
                auth: '/api/v2-simple/auth',
                visitors: '/api/v2-simple/visitors-simple'
            }
        },
        timestamp: new Date().toISOString()
    });
});
router.use('/auth', auth_2.default);
router.use('/visitors-simple', visitorsSimple_1.default);
router.get('/protected', auth_1.authenticate, (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        message: 'Access granted to protected route',
        user: {
            id: user.userId || user._id,
            username: user.username,
            email: user.email,
            companyId: user.companyId,
            isSuperAdmin: user.isSuperAdmin
        },
        timestamp: new Date().toISOString()
    });
});
router.use('*', (req, res) => {
    logger_1.logger.warn('API v2 Simple route not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: {
            health: 'GET /api/v2-simple/health',
            info: 'GET /api/v2-simple/info',
            auth: {
                login: 'POST /api/v2-simple/auth/login',
                register: 'POST /api/v2-simple/auth/register',
                refresh: 'POST /api/v2-simple/auth/refresh',
                logout: 'POST /api/v2-simple/auth/logout',
                profile: 'GET /api/v2-simple/auth/profile'
            },
            visitors: {
                list: 'GET /api/v2-simple/visitors-simple',
                create: 'POST /api/v2-simple/visitors-simple',
                get: 'GET /api/v2-simple/visitors-simple/:id',
                checkin: 'POST /api/v2-simple/visitors-simple/:id/checkin',
                checkout: 'POST /api/v2-simple/visitors-simple/:id/checkout',
                dashboard: 'GET /api/v2-simple/visitors-simple/dashboard'
            }
        },
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=indexSimple.js.map