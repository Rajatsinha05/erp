"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    street: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
}, { _id: false });
const WarehouseAddressSchema = new mongoose_1.Schema({
    warehouseName: { type: String },
    street: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
}, { _id: false });
const ContactPhoneSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    label: { type: String }
}, { _id: false });
const ContactEmailSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    label: { type: String }
}, { _id: false });
const BankAccountSchema = new mongoose_1.Schema({
    bankName: { type: String, required: true },
    branchName: { type: String },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountType: {
        type: String,
        enum: ['Current', 'Savings', 'CC', 'OD'],
        required: true
    },
    accountHolderName: { type: String, required: true },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false }
}, { _id: false });
const LicenseSchema = new mongoose_1.Schema({
    licenseType: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    renewalRequired: { type: Boolean, default: false },
    documentUrl: { type: String }
}, { _id: false });
const CompanySchema = new mongoose_1.Schema({
    companyCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 20
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    legalName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    registrationDetails: {
        gstin: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
        },
        pan: {
            type: String,
            required: true,
            uppercase: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
        },
        cin: {
            type: String,
            uppercase: true,
            match: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/
        },
        udyogAadhar: { type: String },
        iecCode: {
            type: String,
            uppercase: true,
            match: /^[0-9]{10}$/
        },
        registrationDate: { type: Date }
    },
    addresses: {
        registeredOffice: {
            type: AddressSchema,
            required: true
        },
        factoryAddress: {
            type: AddressSchema,
            required: true
        },
        warehouseAddresses: [WarehouseAddressSchema]
    },
    contactInfo: {
        phones: [ContactPhoneSchema],
        emails: [ContactEmailSchema],
        website: {
            type: String,
            match: /^https?:\/\/.+/
        },
        socialMedia: {
            facebook: { type: String },
            instagram: { type: String },
            linkedin: { type: String }
        }
    },
    bankAccounts: [BankAccountSchema],
    businessConfig: {
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        fiscalYearStart: { type: String, default: '04-01' },
        workingDays: [{
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }],
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '18:00' },
            breakStart: { type: String, default: '13:00' },
            breakEnd: { type: String, default: '14:00' }
        },
        gstRates: {
            defaultRate: { type: Number, default: 18 },
            rawMaterialRate: { type: Number, default: 5 },
            finishedGoodsRate: { type: Number, default: 18 }
        }
    },
    productionCapabilities: {
        productTypes: [{
                type: String,
                enum: ['saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom']
            }],
        printingMethods: [{
                type: String,
                enum: ['table_printing', 'machine_printing', 'digital_printing']
            }],
        monthlyCapacity: {
            sarees: { type: Number },
            fabricMeters: { type: Number },
            customOrders: { type: Number }
        },
        qualityCertifications: [String]
    },
    licenses: [LicenseSchema],
    isActive: { type: Boolean, default: true },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'companies'
});
CompanySchema.index({ 'registrationDetails.pan': 1 });
CompanySchema.index({ isActive: 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.virtual('displayName').get(function () {
    return this.companyName || this.legalName;
});
CompanySchema.pre('save', function (next) {
    if (this.bankAccounts && this.bankAccounts.length > 0) {
        const primaryAccounts = this.bankAccounts.filter(account => account.isPrimary);
        if (primaryAccounts.length === 0) {
            this.bankAccounts[0].isPrimary = true;
        }
        else if (primaryAccounts.length > 1) {
            this.bankAccounts.forEach((account, index) => {
                account.isPrimary = index === 0;
            });
        }
    }
    next();
});
CompanySchema.methods.getPrimaryBankAccount = function () {
    return this.bankAccounts?.find(account => account.isPrimary && account.isActive);
};
CompanySchema.methods.getActiveLicenses = function () {
    const now = new Date();
    return this.licenses?.filter(license => license.expiryDate > now && !license.renewalRequired);
};
CompanySchema.methods.getExpiringLicenses = function (daysAhead = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    return this.licenses?.filter(license => license.expiryDate > now &&
        license.expiryDate <= futureDate);
};
CompanySchema.statics.findByCode = function (companyCode) {
    return this.findOne({
        companyCode: companyCode.toUpperCase(),
        isActive: true
    });
};
CompanySchema.statics.findByGSTIN = function (gstin) {
    return this.findOne({
        'registrationDetails.gstin': gstin.toUpperCase(),
        isActive: true
    });
};
exports.default = (0, mongoose_1.model)('Company', CompanySchema);
//# sourceMappingURL=Company.js.map