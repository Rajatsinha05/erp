"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.optionalAuth = exports.requireSuperAdmin = exports.requireAdmin = exports.requirePermission = exports.requireRole = exports.requireCompany = exports.authenticate = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const environment_1 = __importDefault(require("@/config/environment"));
const logger_1 = __importDefault(require("@/utils/logger"));
const generateAccessToken = (user, companyId) => {
    const payload = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email
    };
    if (companyId) {
        const companyAccess = user.companyAccess.find(access => access.companyId.toString() === companyId && access.isActive);
        if (companyAccess) {
            payload.companyId = companyId;
            payload.role = companyAccess.role;
        }
    }
    return jsonwebtoken_1.default.sign(payload, environment_1.default.JWT_SECRET, {
        expiresIn: environment_1.default.JWT_EXPIRE,
        issuer: environment_1.default.JWT_ISSUER,
        audience: environment_1.default.JWT_AUDIENCE
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, tokenVersion = 1) => {
    const payload = {
        userId,
        tokenVersion
    };
    return jsonwebtoken_1.default.sign(payload, environment_1.default.JWT_REFRESH_SECRET, {
        expiresIn: environment_1.default.JWT_REFRESH_EXPIRE
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, environment_1.default.JWT_SECRET, {
            issuer: environment_1.default.JWT_ISSUER,
            audience: environment_1.default.JWT_AUDIENCE
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        else {
            throw new Error('Token verification failed');
        }
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, environment_1.default.JWT_REFRESH_SECRET);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        else {
            throw new Error('Refresh token verification failed');
        }
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please provide a valid access token'
            });
        }
        const token = authHeader.substring(7);
        const decoded = (0, exports.verifyAccessToken)(token);
        const user = await User_1.default.findById(decoded.userId)
            .select('-password')
            .populate('companyAccess.companyId', 'companyName companyCode isActive');
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'User not found',
                message: 'User account not found or inactive'
            });
        }
        if (user.security.accountLocked) {
            const lockoutTime = user.security.lockoutTime;
            if (lockoutTime && lockoutTime > new Date()) {
                return res.status(423).json({
                    error: 'Account locked',
                    message: 'Account is temporarily locked due to multiple failed login attempts',
                    unlockTime: lockoutTime
                });
            }
            else {
                await user.updateOne({
                    $unset: { 'security.lockoutTime': 1 },
                    $set: {
                        'security.accountLocked': false,
                        'security.failedLoginAttempts': 0
                    }
                });
            }
        }
        const headerCompanyId = req.headers['x-company-id'];
        const targetCompanyId = headerCompanyId || decoded.companyId;
        req.user = {
            ...user.toObject(),
            userId: decoded.userId,
            companyId: targetCompanyId
        };
        const is2FARoute = req.path.includes('/2fa/');
        if (targetCompanyId && !is2FARoute) {
            logger_1.default.info('Company access validation', {
                userId: user._id,
                username: user.username,
                isSuperAdmin: user.isSuperAdmin,
                targetCompanyId,
                userCompanyAccess: user.companyAccess?.length || 0
            });
            if (user.isSuperAdmin === true) {
                const company = await Company_1.default.findById(targetCompanyId).select('companyName companyCode isActive');
                if (!company || !company.isActive) {
                    logger_1.default.warn('Company not found for super admin', {
                        userId: user._id,
                        targetCompanyId,
                        companyExists: !!company,
                        companyActive: company?.isActive
                    });
                    return res.status(404).json({
                        error: 'Company not found',
                        message: 'The specified company was not found or is inactive'
                    });
                }
                req.company = company;
                logger_1.default.info('Super admin company access granted', {
                    userId: user._id,
                    companyId: company._id,
                    companyName: company.companyName
                });
            }
            else {
                const companyAccess = user.companyAccess?.find(access => access.companyId.toString() === targetCompanyId && access.isActive);
                if (!companyAccess) {
                    logger_1.default.warn('Company access denied for regular user', {
                        userId: user._id,
                        username: user.username,
                        targetCompanyId,
                        availableCompanies: user.companyAccess?.map(a => ({
                            companyId: a.companyId.toString(),
                            isActive: a.isActive
                        })) || []
                    });
                    return res.status(403).json({
                        error: 'Company access denied',
                        message: 'You do not have access to this company'
                    });
                }
                req.companyAccess = companyAccess;
                req.company = companyAccess.companyId;
            }
        }
        else if (!user.isSuperAdmin && !is2FARoute) {
            return res.status(400).json({
                error: 'Company ID required',
                message: 'X-Company-ID header is required'
            });
        }
        else {
            logger_1.default.info('Super admin access without company context', {
                userId: user._id,
                username: user.username
            });
        }
        await user.updateOne({
            'security.lastLogin': new Date(),
            'security.lastLoginIP': req.ip
        });
        logger_1.default.info('User authenticated', {
            userId: user._id,
            username: user.username,
            companyId: decoded.companyId,
            role: decoded.role,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    }
    catch (error) {
        logger_1.default.warn('Authentication failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
        });
        if (error instanceof Error && error.message === 'Token expired') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Access token has expired. Please refresh your token.'
            });
        }
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired access token'
        });
    }
};
exports.authenticate = authenticate;
const requireCompany = async (req, res, next) => {
    try {
        const companyId = req.headers['x-company-id'];
        if (!companyId) {
            return res.status(400).json({
                error: 'Company ID required',
                message: 'X-Company-ID header is required'
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                error: 'Invalid company ID',
                message: 'Company ID must be a valid ObjectId'
            });
        }
        const user = req.user;
        let companyAccess = null;
        if (!user.isSuperAdmin) {
            companyAccess = user.companyAccess?.find(access => access.companyId.toString() === companyId && access.isActive);
            if (!companyAccess) {
                return res.status(403).json({
                    error: 'Company access denied',
                    message: 'You do not have access to this company'
                });
            }
        }
        const company = await Company_1.default.findById(companyId);
        if (!company || !company.isActive) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'Company not found or inactive'
            });
        }
        req.company = company;
        if (companyAccess) {
            req.companyAccess = companyAccess;
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Company context validation failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: req.user?._id,
            companyId: req.headers['x-company-id']
        });
        return res.status(500).json({
            error: 'Company validation failed',
            message: 'Failed to validate company context'
        });
    }
};
exports.requireCompany = requireCompany;
const requireRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.companyAccess?.role;
        if (!userRole) {
            return res.status(403).json({
                error: 'Role required',
                message: 'User role not found in company context'
            });
        }
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (userRole === 'super_admin') {
            return next();
        }
        if (!allowedRoles.includes(userRole)) {
            logger_1.default.warn('Role authorization failed', {
                userId: req.user?._id,
                userRole,
                requiredRoles: allowedRoles,
                path: req.path,
                method: req.method
            });
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (module, action, options = {}) => {
    return (req, res, next) => {
        const user = req.user;
        const companyAccess = req.companyAccess;
        if (companyAccess.role === 'super_admin') {
            return next();
        }
        if (options.adminOnly) {
            const adminRoles = ['owner', 'manager'];
            const isAdmin = adminRoles.includes(companyAccess.role);
            if (!isAdmin) {
                logger_1.default.warn('Admin access denied', {
                    userId: user._id,
                    username: user.username,
                    companyId: req.company?._id,
                    role: companyAccess.role,
                    module,
                    action
                });
                return res.status(403).json({
                    error: 'Admin access required',
                    message: 'This action requires admin privileges'
                });
            }
        }
        if (options.allowSelf && req.params.id === user._id.toString()) {
            return next();
        }
        const hasPermission = companyAccess.permissions?.[module]?.[action];
        if (!hasPermission) {
            const rolePermissions = getRolePermissions(companyAccess.role);
            const hasRolePermission = rolePermissions?.[module]?.[action] === true;
            if (!hasRolePermission) {
                logger_1.default.warn('Permission authorization failed', {
                    userId: user._id,
                    username: user.username,
                    companyId: req.company?._id,
                    role: companyAccess.role,
                    module,
                    action,
                    path: req.path,
                    method: req.method
                });
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `You do not have permission to ${action} ${module}`
                });
            }
        }
        next();
    };
};
exports.requirePermission = requirePermission;
function getRolePermissions(role) {
    const rolePermissions = {
        admin: {
            users: { view: true, create: true, update: true, delete: true },
            visitors: { view: true, create: true, update: true, delete: true },
            companies: { view: true, update: true },
            reports: { view: true, create: true },
            settings: { view: true, update: true },
            audit: { view: true }
        },
        manager: {
            users: { view: true, create: true, update: true },
            visitors: { view: true, create: true, update: true, delete: true },
            reports: { view: true, create: true },
            settings: { view: true }
        },
        employee: {
            visitors: { view: true, create: true, update: true },
            reports: { view: true }
        },
        security: {
            visitors: { view: true, create: true, update: true },
            reports: { view: true }
        }
    };
    return rolePermissions[role] || {};
}
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    const isAdmin = user.isSuperAdmin ||
        user.companyAccess?.some(access => ['admin', 'owner', 'manager'].includes(access.role));
    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin privileges required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (!user.isSuperAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Super admin privileges required'
        });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = (0, exports.verifyAccessToken)(token);
        const user = await User_1.default.findById(decoded.userId)
            .select('-password')
            .populate('companyAccess.companyId', 'companyName companyCode isActive');
        if (user && user.isActive && !user.security.accountLocked) {
            req.user = {
                ...user.toObject(),
                userId: decoded.userId,
                companyId: decoded.companyId
            };
            if (decoded.companyId) {
                const companyAccess = user.companyAccess.find(access => access.companyId.toString() === decoded.companyId && access.isActive);
                if (companyAccess) {
                    req.companyAccess = companyAccess;
                    req.company = companyAccess.companyId;
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token required',
                message: 'Refresh token is required'
            });
        }
        const decoded = (0, exports.verifyRefreshToken)(refreshToken);
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Invalid refresh token',
                message: 'User not found or inactive'
            });
        }
        const accessToken = (0, exports.generateAccessToken)(user);
        res.json({
            success: true,
            accessToken,
            expiresIn: environment_1.default.JWT_EXPIRE
        });
    }
    catch (error) {
        logger_1.default.warn('Refresh token failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip
        });
        return res.status(401).json({
            error: 'Invalid refresh token',
            message: 'Refresh token is invalid or expired'
        });
    }
};
exports.refreshAccessToken = refreshAccessToken;
//# sourceMappingURL=auth.js.map