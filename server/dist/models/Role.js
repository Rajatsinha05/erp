"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DynamicPermissionSchema = new mongoose_1.Schema({
    module: { type: String, required: true },
    resource: { type: String, required: true },
    actions: [{
            action: { type: String, required: true },
            allowed: { type: Boolean, default: false },
            conditions: { type: mongoose_1.Schema.Types.Mixed },
            restrictions: { type: mongoose_1.Schema.Types.Mixed }
        }],
    customPermissions: { type: mongoose_1.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const PermissionSchema = new mongoose_1.Schema({
    system: {
        userManagement: { type: Boolean, default: false },
        roleManagement: { type: Boolean, default: false },
        companySettings: { type: Boolean, default: false },
        systemSettings: { type: Boolean, default: false },
        backupRestore: { type: Boolean, default: false },
        auditLogs: { type: Boolean, default: false },
        systemReports: { type: Boolean, default: false }
    },
    users: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        activate: { type: Boolean, default: false },
        deactivate: { type: Boolean, default: false },
        resetPassword: { type: Boolean, default: false },
        impersonate: { type: Boolean, default: false },
        viewSalary: { type: Boolean, default: false },
        editSalary: { type: Boolean, default: false }
    },
    company: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        settings: { type: Boolean, default: false },
        branches: { type: Boolean, default: false },
        departments: { type: Boolean, default: false },
        hierarchy: { type: Boolean, default: false }
    },
    inventory: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        stockAdjustment: { type: Boolean, default: false },
        stockTransfer: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        exportData: { type: Boolean, default: false },
        importData: { type: Boolean, default: false },
        viewCosts: { type: Boolean, default: false },
        editCosts: { type: Boolean, default: false }
    },
    production: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        startProcess: { type: Boolean, default: false },
        stopProcess: { type: Boolean, default: false },
        qualityCheck: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        scheduleOrders: { type: Boolean, default: false },
        manageBOM: { type: Boolean, default: false },
        viewCosts: { type: Boolean, default: false }
    },
    sales: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        dispatch: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        manageCustomers: { type: Boolean, default: false },
        viewPricing: { type: Boolean, default: false },
        editPricing: { type: Boolean, default: false },
        discounts: { type: Boolean, default: false },
        creditManagement: { type: Boolean, default: false }
    },
    purchase: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        receive: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        manageSuppliers: { type: Boolean, default: false },
        negotiateRates: { type: Boolean, default: false },
        paymentApproval: { type: Boolean, default: false }
    },
    financial: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        bankTransactions: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        reconciliation: { type: Boolean, default: false },
        taxManagement: { type: Boolean, default: false },
        budgetManagement: { type: Boolean, default: false },
        expenseApproval: { type: Boolean, default: false },
        viewProfitLoss: { type: Boolean, default: false }
    },
    security: {
        gateManagement: { type: Boolean, default: false },
        visitorManagement: { type: Boolean, default: false },
        vehicleTracking: { type: Boolean, default: false },
        cctvAccess: { type: Boolean, default: false },
        emergencyResponse: { type: Boolean, default: false },
        securityReports: { type: Boolean, default: false },
        incidentManagement: { type: Boolean, default: false },
        accessControl: { type: Boolean, default: false },
        patrolManagement: { type: Boolean, default: false }
    },
    hr: {
        viewEmployees: { type: Boolean, default: false },
        manageEmployees: { type: Boolean, default: false },
        manageAttendance: { type: Boolean, default: false },
        manageSalary: { type: Boolean, default: false },
        manageLeaves: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        recruitment: { type: Boolean, default: false },
        performance: { type: Boolean, default: false },
        training: { type: Boolean, default: false },
        disciplinary: { type: Boolean, default: false }
    },
    quality: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        inspections: { type: Boolean, default: false },
        certifications: { type: Boolean, default: false },
        nonConformance: { type: Boolean, default: false },
        corrective: { type: Boolean, default: false },
        preventive: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false }
    },
    maintenance: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        schedule: { type: Boolean, default: false },
        workOrders: { type: Boolean, default: false },
        preventive: { type: Boolean, default: false },
        breakdown: { type: Boolean, default: false },
        spareparts: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false }
    },
    reports: {
        inventory: { type: Boolean, default: false },
        production: { type: Boolean, default: false },
        sales: { type: Boolean, default: false },
        purchase: { type: Boolean, default: false },
        financial: { type: Boolean, default: false },
        hr: { type: Boolean, default: false },
        quality: { type: Boolean, default: false },
        security: { type: Boolean, default: false },
        custom: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
        schedule: { type: Boolean, default: false }
    }
}, { _id: false });
const RoleSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    roleName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    roleCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        maxlength: 50
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    roleType: {
        type: String,
        enum: ['system', 'custom', 'department', 'project', 'temporary'],
        default: 'custom',
        index: true
    },
    roleLevel: {
        type: String,
        enum: ['super_admin', 'admin', 'manager', 'supervisor', 'executive', 'operator', 'helper'],
        required: true,
        index: true
    },
    department: {
        type: String,
        enum: ['Management', 'Production', 'Sales', 'Purchase', 'Accounts', 'HR', 'Quality', 'Maintenance', 'Security', 'IT'],
        index: true
    },
    permissions: PermissionSchema,
    dynamicPermissions: [DynamicPermissionSchema],
    parentRole: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' },
    childRoles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' }],
    inheritsFrom: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' }],
    canDelegate: { type: Boolean, default: false },
    delegationLevel: { type: Number, default: 0, min: 0, max: 5 },
    accessRestrictions: {
        ipWhitelist: [String],
        timeRestrictions: {
            allowedDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
            allowedHours: {
                start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
                end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
            }
        },
        locationRestrictions: [String],
        deviceRestrictions: [String]
    },
    dataAccess: {
        ownDataOnly: { type: Boolean, default: false },
        departmentDataOnly: { type: Boolean, default: false },
        branchDataOnly: { type: Boolean, default: false },
        customDataFilters: { type: mongoose_1.Schema.Types.Mixed },
        fieldLevelRestrictions: { type: mongoose_1.Schema.Types.Mixed }
    },
    isSystemRole: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    maxUsers: { type: Number, min: 0 },
    currentUsers: { type: Number, default: 0, min: 0 },
    requiresApproval: { type: Boolean, default: false },
    approvalWorkflow: [{
            level: { type: Number, required: true },
            approverRole: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' },
            isRequired: { type: Boolean, default: true }
        }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    lastUsed: { type: Date },
    usageCount: { type: Number, default: 0, min: 0 },
    notes: { type: String },
    tags: [String],
    customFields: { type: mongoose_1.Schema.Types.Mixed }
}, {
    timestamps: true,
    collection: 'roles'
});
RoleSchema.index({ companyId: 1, roleCode: 1 }, { unique: true });
RoleSchema.index({ companyId: 1, roleName: 1 });
RoleSchema.index({ companyId: 1, roleType: 1, isActive: 1 });
RoleSchema.index({ companyId: 1, department: 1, isActive: 1 });
RoleSchema.index({ companyId: 1, roleLevel: 1, isActive: 1 });
RoleSchema.index({
    roleName: 'text',
    roleCode: 'text',
    description: 'text'
});
RoleSchema.pre('save', function (next) {
    if (!this.displayName) {
        this.displayName = this.roleName;
    }
    if (this.maxUsers && this.currentUsers > this.maxUsers) {
        return next(new Error('Current users exceed maximum allowed users for this role'));
    }
    next();
});
RoleSchema.methods.hasPermission = function (module, action) {
    if (this.permissions && this.permissions[module] && this.permissions[module][action]) {
        return true;
    }
    if (this.dynamicPermissions) {
        const modulePermission = this.dynamicPermissions.find((perm) => perm.module === module && perm.isActive);
        if (modulePermission) {
            const actionPermission = modulePermission.actions.find((act) => act.action === action);
            return actionPermission ? actionPermission.allowed : false;
        }
    }
    return false;
};
RoleSchema.methods.canAssignToUser = function () {
    return this.isActive && (!this.maxUsers || this.currentUsers < this.maxUsers);
};
RoleSchema.methods.incrementUserCount = function () {
    this.currentUsers += 1;
    this.lastUsed = new Date();
    this.usageCount += 1;
    return this.save();
};
RoleSchema.methods.decrementUserCount = function () {
    this.currentUsers = Math.max(0, this.currentUsers - 1);
    return this.save();
};
RoleSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
RoleSchema.statics.findByDepartment = function (companyId, department) {
    return this.find({ companyId, department, isActive: true });
};
RoleSchema.statics.findByLevel = function (companyId, roleLevel) {
    return this.find({ companyId, roleLevel, isActive: true });
};
RoleSchema.statics.getSystemRoles = function (companyId) {
    return this.find({ companyId, isSystemRole: true, isActive: true });
};
exports.default = (0, mongoose_1.model)('Role', RoleSchema);
//# sourceMappingURL=Role.js.map