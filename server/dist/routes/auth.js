"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const auth_1 = require("@/middleware/auth");
const security_1 = require("@/middleware/security");
const environment_1 = __importDefault(require("@/config/environment"));
const logger_1 = __importStar(require("@/utils/logger"));
const TwoFactorService_1 = __importDefault(require("@/services/TwoFactorService"));
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: environment_1.default.PASSWORD_MIN_LENGTH })
        .withMessage(`Password must be at least ${environment_1.default.PASSWORD_MIN_LENGTH} characters long`)
        .custom((value) => {
        if (environment_1.default.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(value)) {
            throw new Error('Password must contain at least one uppercase letter');
        }
        if (environment_1.default.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(value)) {
            throw new Error('Password must contain at least one lowercase letter');
        }
        if (environment_1.default.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(value)) {
            throw new Error('Password must contain at least one number');
        }
        if (environment_1.default.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            throw new Error('Password must contain at least one special character');
        }
        return true;
    }),
    (0, express_validator_1.body)('firstName')
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('First name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('lastName')
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('Last name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('phone')
        .matches(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/)
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('companyCode')
        .isLength({ min: 2, max: 20 })
        .toUpperCase()
        .withMessage('Company code is required and must be 2-20 characters')
];
const loginValidation = [
    (0, express_validator_1.body)('username')
        .notEmpty()
        .withMessage('Username, email, or phone number is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    (0, express_validator_1.body)('companyCode')
        .optional()
        .isLength({ min: 2, max: 20 })
        .toUpperCase()
        .withMessage('Company code must be 2-20 characters if provided')
];
router.post('/register', security_1.authRateLimit, registerValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Please check your input data',
                details: errors.array()
            });
        }
        const { username, email, password, firstName, lastName, middleName, phone, alternatePhone, companyCode, companyName, legalName, gstin, pan } = req.body;
        const existingUser = await User_1.default.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        });
        if (existingUser) {
            (0, logger_1.logSecurity)('Registration attempt with existing credentials', {
                username,
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this username or email already exists'
            });
        }
        let company = await Company_1.default.findOne({ companyCode: companyCode.toUpperCase() });
        if (!company) {
            company = new Company_1.default({
                companyCode: companyCode.toUpperCase(),
                companyName: companyName || `${firstName} ${lastName} Company`,
                legalName: legalName || companyName || `${firstName} ${lastName} Company`,
                registrationDetails: {
                    gstin: gstin || '',
                    pan: pan || ''
                },
                addresses: {
                    registeredOffice: {
                        country: 'India'
                    },
                    factoryAddress: {
                        country: 'India'
                    }
                },
                contactInfo: {
                    phones: [{ type: phone, label: 'Primary' }],
                    emails: [{ type: email, label: 'Primary' }]
                },
                bankAccounts: [],
                businessConfig: {
                    currency: 'INR',
                    timezone: 'Asia/Kolkata',
                    fiscalYearStart: '04-01',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    workingHours: {
                        start: '09:00',
                        end: '18:00',
                        breakStart: '13:00',
                        breakEnd: '14:00'
                    },
                    gstRates: {
                        defaultRate: 18,
                        rawMaterialRate: 5,
                        finishedGoodsRate: 18
                    }
                },
                productionCapabilities: {
                    productTypes: ['saree', 'african_cotton', 'garment_fabric'],
                    printingMethods: ['table_printing', 'machine_printing'],
                    monthlyCapacity: {},
                    qualityCertifications: []
                },
                licenses: [],
                isActive: true,
                createdBy: new User_1.default()._id
            });
        }
        const user = new User_1.default({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            personalInfo: {
                firstName,
                lastName,
                middleName,
                phone,
                alternatePhone
            },
            addresses: {
                current: { country: 'India' },
                permanent: { country: 'India' }
            },
            companyAccess: [{
                    companyId: company._id,
                    role: 'super_admin',
                    department: 'Management',
                    designation: 'Owner',
                    permissions: {
                        inventory: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true },
                        production: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, startProcess: true, qualityCheck: true },
                        orders: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, dispatch: true },
                        financial: { view: true, create: true, edit: true, delete: true, approve: true, viewReports: true, bankTransactions: true },
                        security: { gateManagement: true, visitorManagement: true, vehicleTracking: true, cctvAccess: true, emergencyResponse: true },
                        hr: { viewEmployees: true, manageAttendance: true, manageSalary: true, viewReports: true },
                        admin: { userManagement: true, systemSettings: true, backupRestore: true, auditLogs: true }
                    },
                    isActive: true,
                    joinedAt: new Date()
                }],
            security: {
                failedLoginAttempts: 0,
                accountLocked: false,
                twoFactorEnabled: false,
                mustChangePassword: false
            },
            preferences: {
                language: 'en',
                theme: 'light',
                notifications: {
                    email: true,
                    sms: true,
                    whatsapp: false,
                    push: true
                },
                dashboard: {
                    defaultCompany: company._id,
                    widgets: ['inventory-summary', 'production-status', 'recent-orders', 'financial-overview']
                }
            },
            isActive: true
        });
        await user.save();
        if (!company.createdBy) {
            company.createdBy = user._id;
            await company.save();
        }
        const accessToken = (0, auth_1.generateAccessToken)(user, company._id.toString());
        const refreshToken = (0, auth_1.generateRefreshToken)(user._id.toString());
        (0, logger_1.logAudit)('User registered', {
            userId: user._id,
            username: user.username,
            email: user.email,
            companyId: company._id,
            companyCode: company.companyCode,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: environment_1.default.COOKIE_SECURE,
            sameSite: environment_1.default.COOKIE_SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: environment_1.default.NODE_ENV === 'production' ? environment_1.default.COOKIE_DOMAIN : undefined
        });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    companyAccess: user.companyAccess.map(access => ({
                        companyId: access.companyId,
                        companyName: company.companyName,
                        companyCode: company.companyCode,
                        role: access.role,
                        department: access.department,
                        designation: access.designation
                    }))
                },
                company: {
                    id: company._id,
                    name: company.companyName,
                    code: company.companyCode
                },
                tokens: {
                    accessToken,
                    expiresIn: environment_1.default.JWT_EXPIRE
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Registration failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            username: req.body.username,
            email: req.body.email,
            ip: req.ip
        });
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration. Please try again.'
        });
    }
});
router.post('/login', security_1.authRateLimit, loginValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Please check your input data',
                details: errors.array()
            });
        }
        const { username, password, companyCode } = req.body;
        const user = await User_1.default.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() },
                { 'personalInfo.phone': username }
            ],
            isActive: true
        }).populate('companyAccess.companyId', 'companyName companyCode isActive');
        if (!user) {
            (0, logger_1.logSecurity)('Login attempt with invalid username', {
                username,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }
        if (user.security.accountLocked) {
            const lockoutTime = user.security.lockoutTime;
            if (lockoutTime && lockoutTime > new Date()) {
                (0, logger_1.logSecurity)('Login attempt on locked account', {
                    userId: user._id,
                    username: user.username,
                    ip: req.ip,
                    lockoutTime
                });
                return res.status(423).json({
                    error: 'Account locked',
                    message: 'Account is temporarily locked due to multiple failed login attempts',
                    unlockTime: lockoutTime
                });
            }
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            (0, logger_1.logSecurity)('Login attempt with invalid password', {
                userId: user._id,
                username: user.username,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                failedAttempts: user.security.failedLoginAttempts + 1
            });
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }
        await user.resetLoginAttempts();
        const isTwoFactorEnabled = await TwoFactorService_1.default.isUserTwoFactorEnabled(user._id);
        if (isTwoFactorEnabled) {
            const tempToken = jsonwebtoken_1.default.sign({
                userId: user._id,
                type: 'temp_2fa',
                timestamp: Date.now()
            }, environment_1.default.JWT_SECRET, { expiresIn: '10m' });
            (0, logger_1.logSecurity)('2FA required for login', {
                userId: user._id,
                username: user.username,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                tempToken,
                message: 'Two-factor authentication required'
            });
        }
        let selectedCompanyAccess;
        let allCompanies = [];
        if (user.isSuperAdmin) {
            allCompanies = await Company_1.default.find({ isActive: true }).select('_id companyName companyCode isActive').lean();
            if (companyCode) {
                const targetCompany = allCompanies.find(company => company.companyCode === companyCode.toUpperCase());
                if (targetCompany) {
                    selectedCompanyAccess = {
                        companyId: targetCompany,
                        role: 'super_admin',
                        permissions: ['*'],
                        isActive: true
                    };
                }
            }
            else {
                if (allCompanies.length > 0) {
                    selectedCompanyAccess = {
                        companyId: allCompanies[0],
                        role: 'super_admin',
                        permissions: ['*'],
                        isActive: true
                    };
                }
            }
        }
        else {
            if (companyCode) {
                selectedCompanyAccess = user.companyAccess.find(access => access.companyId.companyCode === companyCode.toUpperCase() &&
                    access.isActive &&
                    access.companyId.isActive);
                if (!selectedCompanyAccess) {
                    return res.status(403).json({
                        error: 'Company access denied',
                        message: 'You do not have access to this company'
                    });
                }
            }
            else {
                selectedCompanyAccess = user.companyAccess.find(access => access.companyId._id.toString() === user.preferences.dashboard.defaultCompany?.toString()) || user.companyAccess.find(access => access.isActive && access.companyId.isActive);
            }
        }
        const accessToken = (0, auth_1.generateAccessToken)(user, selectedCompanyAccess?.companyId._id.toString());
        const refreshToken = (0, auth_1.generateRefreshToken)(user._id.toString());
        (0, logger_1.logAudit)('User logged in', {
            userId: user._id,
            username: user.username,
            companyId: selectedCompanyAccess?.companyId._id,
            companyCode: selectedCompanyAccess?.companyId.companyCode,
            role: selectedCompanyAccess?.role,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: environment_1.default.COOKIE_SECURE,
            sameSite: environment_1.default.COOKIE_SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: environment_1.default.NODE_ENV === 'production' ? environment_1.default.COOKIE_DOMAIN : undefined
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    isSuperAdmin: user.isSuperAdmin,
                    companyAccess: user.isSuperAdmin
                        ? allCompanies.map(company => ({
                            companyId: company._id,
                            companyName: company.companyName,
                            companyCode: company.companyCode,
                            role: 'super_admin',
                            department: 'Administration',
                            designation: 'Super Administrator'
                        }))
                        : user.companyAccess
                            .filter(access => access.isActive && access.companyId.isActive)
                            .map(access => ({
                            companyId: access.companyId._id,
                            companyName: access.companyId.companyName,
                            companyCode: access.companyId.companyCode,
                            role: access.role,
                            department: access.department,
                            designation: access.designation
                        }))
                },
                companies: user.isSuperAdmin ? allCompanies : user.companyAccess
                    .filter(access => access.isActive && access.companyId.isActive)
                    .map(access => ({
                    _id: access.companyId._id,
                    companyName: access.companyId.companyName,
                    companyCode: access.companyId.companyCode
                })),
                currentCompany: selectedCompanyAccess ? {
                    id: selectedCompanyAccess.companyId._id,
                    name: selectedCompanyAccess.companyId.companyName,
                    code: selectedCompanyAccess.companyId.companyCode,
                    role: selectedCompanyAccess.role,
                    permissions: selectedCompanyAccess.permissions
                } : null,
                tokens: {
                    accessToken,
                    expiresIn: environment_1.default.JWT_EXPIRE
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            username: req.body.username,
            ip: req.ip
        });
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login. Please try again.'
        });
    }
});
router.post('/refresh', auth_1.refreshAccessToken);
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: environment_1.default.COOKIE_SECURE,
        sameSite: environment_1.default.COOKIE_SAME_SITE,
        domain: environment_1.default.NODE_ENV === 'production' ? environment_1.default.COOKIE_DOMAIN : undefined
    });
    (0, logger_1.logAudit)('User logged out', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.json({
        success: true,
        message: 'Logout successful'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map