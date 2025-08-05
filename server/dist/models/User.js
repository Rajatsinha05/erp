"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const environment_1 = __importDefault(require("@/config/environment"));
const AddressSchema = new mongoose_1.Schema({
    street: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
}, { _id: false });
const ModulePermissionsSchema = new mongoose_1.Schema({
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false }
}, { _id: false });
const SecurityPermissionsSchema = new mongoose_1.Schema({
    gateManagement: { type: Boolean, default: false },
    visitorManagement: { type: Boolean, default: false },
    vehicleTracking: { type: Boolean, default: false },
    cctvAccess: { type: Boolean, default: false },
    emergencyResponse: { type: Boolean, default: false }
}, { _id: false });
const HRPermissionsSchema = new mongoose_1.Schema({
    viewEmployees: { type: Boolean, default: false },
    manageAttendance: { type: Boolean, default: false },
    manageSalary: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false }
}, { _id: false });
const AdminPermissionsSchema = new mongoose_1.Schema({
    userManagement: { type: Boolean, default: false },
    systemSettings: { type: Boolean, default: false },
    backupRestore: { type: Boolean, default: false },
    auditLogs: { type: Boolean, default: false }
}, { _id: false });
const CompanyAccessSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'owner', 'manager', 'accountant', 'production_manager', 'sales_executive', 'security_guard', 'operator', 'helper'],
        required: true
    },
    department: {
        type: String,
        enum: ['Management', 'Production', 'Sales', 'Accounts', 'Security', 'Quality', 'Warehouse']
    },
    designation: { type: String },
    employeeId: { type: String },
    joiningDate: { type: Date },
    permissions: {
        inventory: ModulePermissionsSchema,
        production: {
            ...ModulePermissionsSchema.obj,
            startProcess: { type: Boolean, default: false },
            qualityCheck: { type: Boolean, default: false }
        },
        orders: {
            ...ModulePermissionsSchema.obj,
            dispatch: { type: Boolean, default: false }
        },
        financial: {
            ...ModulePermissionsSchema.obj,
            bankTransactions: { type: Boolean, default: false }
        },
        security: SecurityPermissionsSchema,
        hr: HRPermissionsSchema,
        admin: AdminPermissionsSchema
    },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    remarks: { type: String }
});
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        match: /^[a-zA-Z0-9_]+$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    personalInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        middleName: {
            type: String,
            trim: true,
            maxlength: 100
        },
        displayName: {
            type: String,
            trim: true,
            maxlength: 255
        },
        phone: {
            type: String,
            required: true,
            match: /^[+]?[1-9][\d\s\-\(\)]{7,15}$/
        },
        alternatePhone: {
            type: String,
            match: /^[+]?[1-9][\d\s\-\(\)]{7,15}$/
        },
        dateOfBirth: { type: Date },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other']
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        profilePhoto: { type: String },
        signature: { type: String }
    },
    addresses: {
        current: AddressSchema,
        permanent: AddressSchema
    },
    companyAccess: [CompanyAccessSchema],
    isSuperAdmin: {
        type: Boolean,
        default: false,
        index: true
    },
    primaryCompanyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    security: {
        lastLogin: { type: Date },
        lastLoginIP: { type: String },
        failedLoginAttempts: { type: Number, default: 0 },
        accountLocked: { type: Boolean, default: false },
        lockoutTime: { type: Date },
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String },
        passwordLastChanged: { type: Date },
        mustChangePassword: { type: Boolean, default: false }
    },
    preferences: {
        language: { type: String, default: 'en' },
        theme: { type: String, default: 'light' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        },
        dashboard: {
            defaultCompany: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company' },
            widgets: [String]
        }
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'users'
});
UserSchema.index({ 'personalInfo.phone': 1 });
UserSchema.index({ 'companyAccess.companyId': 1 });
UserSchema.index({ 'companyAccess.role': 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'companyAccess.companyId': 1, 'companyAccess.isActive': 1 });
UserSchema.index({ username: 1, isActive: 1 });
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.virtual('fullName').get(function () {
    const { firstName, middleName, lastName } = this.personalInfo;
    return [firstName, middleName, lastName].filter(Boolean).join(' ');
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(environment_1.default.BCRYPT_SALT_ROUNDS);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        this.security.passwordLastChanged = new Date();
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.pre('save', function (next) {
    if (!this.personalInfo.displayName) {
        this.personalInfo.displayName = this.fullName;
    }
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
UserSchema.methods.incrementLoginAttempts = function () {
    if (this.security.lockoutTime && this.security.lockoutTime < new Date()) {
        return this.updateOne({
            $unset: { 'security.lockoutTime': 1 },
            $set: { 'security.failedLoginAttempts': 1 }
        });
    }
    const updates = { $inc: { 'security.failedLoginAttempts': 1 } };
    if (this.security.failedLoginAttempts + 1 >= environment_1.default.MAX_LOGIN_ATTEMPTS && !this.security.accountLocked) {
        updates.$set = {
            'security.accountLocked': true,
            'security.lockoutTime': new Date(Date.now() + environment_1.default.LOCKOUT_TIME)
        };
    }
    return this.updateOne(updates);
};
UserSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: {
            'security.failedLoginAttempts': 1,
            'security.lockoutTime': 1
        },
        $set: {
            'security.accountLocked': false,
            'security.lastLogin': new Date()
        }
    });
};
UserSchema.methods.getCompanyAccess = function (companyId) {
    return this.companyAccess.find((access) => access.companyId.toString() === companyId && access.isActive);
};
UserSchema.methods.hasPermission = function (companyId, module, action) {
    const access = this.getCompanyAccess(companyId);
    if (!access)
        return false;
    if (access.role === 'super_admin')
        return true;
    return access.permissions?.[module]?.[action] || false;
};
UserSchema.methods.hasRole = function (roleId, companyId) {
    return this.roles.some((role) => role.roleId.toString() === roleId &&
        role.isActive &&
        (!role.expiresAt || role.expiresAt > new Date()) &&
        (!companyId || role.companyId.toString() === companyId));
};
UserSchema.methods.getRolesForCompany = function (companyId) {
    return this.roles.filter((role) => role.companyId.toString() === companyId &&
        role.isActive &&
        (!role.expiresAt || role.expiresAt > new Date()));
};
UserSchema.methods.hasRolePermission = function (module, action, companyId) {
    if (this.isSuperAdmin)
        return true;
    if (this.customPermissions &&
        this.customPermissions[module] &&
        this.customPermissions[module][action]) {
        return true;
    }
    const relevantRoles = companyId ?
        this.getRolesForCompany(companyId) :
        this.roles.filter((role) => role.isActive);
    return false;
};
UserSchema.methods.assignRole = function (roleId, companyId, assignedBy, expiresAt) {
    this.roles = this.roles.filter((role) => !(role.roleId.toString() === roleId && role.companyId.toString() === companyId));
    this.roles.push({
        roleId,
        companyId,
        assignedBy,
        assignedAt: new Date(),
        isActive: true,
        expiresAt
    });
    return this.save();
};
UserSchema.methods.removeRole = function (roleId, companyId) {
    this.roles = this.roles.filter((role) => !(role.roleId.toString() === roleId && role.companyId.toString() === companyId));
    return this.save();
};
UserSchema.methods.canAccessCompany = function (companyId) {
    if (this.isSuperAdmin)
        return true;
    return this.roles.some((role) => role.companyId.toString() === companyId &&
        role.isActive &&
        (!role.expiresAt || role.expiresAt > new Date()));
};
UserSchema.methods.getAccessibleCompanies = function () {
    if (this.isSuperAdmin) {
        return [];
    }
    return [...new Set(this.companyAccess
            .filter((access) => access.isActive)
            .map((access) => access.companyId.toString()))];
};
UserSchema.statics.findByUsername = function (username) {
    return this.findOne({
        username: username.toLowerCase(),
        isActive: true
    });
};
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({
        email: email.toLowerCase(),
        isActive: true
    });
};
UserSchema.statics.findByCompany = function (companyId) {
    return this.find({
        'companyAccess.companyId': companyId,
        'companyAccess.isActive': true,
        isActive: true
    });
};
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=User.js.map