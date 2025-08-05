#!/usr/bin/env ts-node
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
const mongoose_1 = __importDefault(require("mongoose"));
const faker_1 = require("@faker-js/faker");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const models_1 = require("../models");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factory_erp_dev';
console.log('🔗 Attempting to connect to:', MONGODB_URI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
const SEED_CONFIG = {
    companies: 3,
    usersPerCompany: 20,
    rolesPerCompany: 8,
    customersPerCompany: 20,
    suppliersPerCompany: 18,
    inventoryItemsPerCompany: 20,
    warehousesPerCompany: 5,
    productionOrdersPerCompany: 18,
    customerOrdersPerCompany: 20,
    purchaseOrdersPerCompany: 18,
    invoicesPerCompany: 20,
    quotationsPerCompany: 18,
    financialTransactionsPerCompany: 25,
    visitorsPerCompany: 20,
    vehiclesPerCompany: 18,
    securityLogsPerCompany: 20,
    auditLogsPerCompany: 25,
    businessAnalyticsPerCompany: 18,
    boilerMonitoringPerCompany: 20,
    electricityMonitoringPerCompany: 20,
    hospitalityPerCompany: 18,
    dispatchesPerCompany: 20,
    reportsPerCompany: 18
};
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const INDIAN_LOCATIONS = [
    { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { city: 'Delhi', state: 'Delhi', pincode: '110001' },
    { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
    { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
    { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
];
const INDUSTRIES = ['Manufacturing', 'Textiles', 'Pharmaceuticals', 'Automotive', 'Electronics', 'Food Processing'];
const COMPANY_TYPES = ['Private Limited', 'Public Limited', 'Partnership'];
const USER_ROLES = ['super_admin', 'admin', 'manager', 'supervisor', 'operator', 'accountant'];
const PRODUCT_CATEGORIES = ['Raw Materials', 'Finished Goods', 'Work in Progress', 'Spare Parts', 'Consumables'];
class SimpleSeed {
    companies = [];
    users = [];
    roles = [];
    customers = [];
    suppliers = [];
    warehouses = [];
    inventoryItems = [];
    productionOrders = [];
    customerOrders = [];
    purchaseOrders = [];
    invoices = [];
    quotations = [];
    financialTransactions = [];
    visitors = [];
    vehicles = [];
    securityLogs = [];
    auditLogs = [];
    businessAnalytics = [];
    hospitality = [];
    dispatches = [];
    reports = [];
    async connect() {
        try {
            await mongoose_1.default.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            console.log('🔗 Connected to MongoDB successfully');
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            console.log('💡 Trying local MongoDB as fallback...');
            try {
                await mongoose_1.default.connect('mongodb://localhost:27017/factory_erp_dev');
                console.log('🔗 Connected to local MongoDB');
            }
            catch (localError) {
                console.error('❌ Local MongoDB connection also failed:', localError);
                console.log('💡 Please ensure MongoDB is running locally or check Atlas connection');
                process.exit(1);
            }
        }
    }
    async clearDatabase() {
        console.log('🧹 Clearing existing data...');
        try {
            try {
                await models_1.Company.collection.dropIndex('email_1');
                console.log('✅ Dropped old company email index');
            }
            catch (e) {
            }
            try {
                await models_1.User.collection.dropIndex('employeeId_1_companyId_1');
                console.log('✅ Dropped old user employeeId index');
            }
            catch (e) {
            }
            try {
                await models_1.PurchaseOrder.collection.dropIndex('companyId_1_purchaseOrderNumber_1');
                console.log('✅ Dropped old purchase order index');
            }
            catch (e) {
            }
            await models_1.Company.deleteMany({});
            await models_1.User.deleteMany({});
            await models_1.Role.deleteMany({});
            await models_1.Customer.deleteMany({});
            await models_1.Supplier.deleteMany({});
            await models_1.InventoryItem.deleteMany({});
            await models_1.Warehouse.deleteMany({});
            await models_1.ProductionOrder.deleteMany({});
            await models_1.CustomerOrder.deleteMany({});
            await models_1.PurchaseOrder.deleteMany({});
            await models_1.Invoice.deleteMany({});
            await models_1.Quotation.deleteMany({});
            await models_1.FinancialTransaction.deleteMany({});
            await models_1.Visitor.deleteMany({});
            await models_1.Vehicle.deleteMany({});
            await models_1.SecurityLog.deleteMany({});
            await models_1.AuditLog.deleteMany({});
            await models_1.BusinessAnalytics.deleteMany({});
            await models_1.BoilerMonitoring.deleteMany({});
            await models_1.ElectricityMonitoring.deleteMany({});
            await models_1.Hospitality.deleteMany({});
            await models_1.Dispatch.deleteMany({});
            await models_1.Report.deleteMany({});
            console.log('✅ Database cleared');
        }
        catch (error) {
            console.error('❌ Error clearing database:', error);
            throw error;
        }
    }
    async seedCompanies() {
        console.log('🏢 Seeding companies...');
        const dummyUserId = new mongoose_1.default.Types.ObjectId();
        for (let i = 0; i < SEED_CONFIG.companies; i++) {
            const location = getRandomElement(INDIAN_LOCATIONS);
            const companyName = faker_1.faker.company.name() + ' Industries';
            const stateCode = '27';
            const panLike = faker_1.faker.string.alpha({ length: 5, casing: 'upper' }) + faker_1.faker.string.numeric(4) + faker_1.faker.string.alpha({ length: 1, casing: 'upper' });
            const gstNumber = stateCode + panLike + '1Z' + faker_1.faker.string.alphanumeric({ length: 1, casing: 'upper' });
            const panNumber = faker_1.faker.string.alpha({ length: 5, casing: 'upper' }) + faker_1.faker.string.numeric(4) + faker_1.faker.string.alpha({ length: 1, casing: 'upper' });
            const company = await models_1.Company.create({
                companyCode: `COMP${faker_1.faker.string.numeric(3)}`,
                companyName: companyName,
                legalName: companyName + ' Private Limited',
                registrationDetails: {
                    gstin: gstNumber,
                    pan: panNumber,
                    cin: 'L' + faker_1.faker.string.numeric(5) + 'MH' + faker_1.faker.string.numeric(4) + 'PTC' + faker_1.faker.string.numeric(6),
                    registrationDate: faker_1.faker.date.past({ years: 5 })
                },
                addresses: {
                    registeredOffice: {
                        street: faker_1.faker.location.streetAddress(),
                        area: faker_1.faker.location.secondaryAddress(),
                        city: location.city,
                        state: location.state,
                        pincode: location.pincode,
                        country: 'India'
                    },
                    factoryAddress: {
                        street: faker_1.faker.location.streetAddress(),
                        area: faker_1.faker.location.secondaryAddress(),
                        city: location.city,
                        state: location.state,
                        pincode: location.pincode,
                        country: 'India'
                    },
                    warehouseAddresses: [{
                            warehouseName: 'Main Warehouse',
                            street: faker_1.faker.location.streetAddress(),
                            area: faker_1.faker.location.secondaryAddress(),
                            city: location.city,
                            state: location.state,
                            pincode: location.pincode
                        }]
                },
                contactInfo: {
                    phones: [
                        { type: `+91${faker_1.faker.string.numeric(10)}`, label: 'Primary' },
                        { type: `+91${faker_1.faker.string.numeric(10)}`, label: 'Secondary' }
                    ],
                    emails: [
                        { type: faker_1.faker.internet.email(), label: 'Primary' },
                        { type: faker_1.faker.internet.email(), label: 'Secondary' }
                    ],
                    website: faker_1.faker.internet.url(),
                    socialMedia: {
                        linkedin: faker_1.faker.internet.url(),
                        twitter: faker_1.faker.internet.url()
                    }
                },
                businessInfo: {
                    industry: getRandomElement(INDUSTRIES),
                    companyType: getRandomElement(COMPANY_TYPES),
                    incorporationDate: faker_1.faker.date.past({ years: 10 }),
                    employeeCount: faker_1.faker.number.int({ min: 50, max: 1000 }),
                    annualTurnover: faker_1.faker.number.int({ min: 10000000, max: 1000000000 })
                },
                bankAccounts: [{
                        bankName: getRandomElement(['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'PNB']),
                        branchName: faker_1.faker.location.city(),
                        accountNumber: faker_1.faker.finance.accountNumber(),
                        ifscCode: faker_1.faker.finance.routingNumber(),
                        accountType: getRandomElement(['Current', 'Savings']),
                        accountHolderName: companyName,
                        currentBalance: faker_1.faker.number.int({ min: 100000, max: 10000000 }),
                        isActive: true,
                        isPrimary: true
                    }],
                settings: {
                    timezone: 'Asia/Kolkata',
                    currency: 'INR',
                    dateFormat: 'DD/MM/YYYY',
                    fiscalYearStart: new Date('2024-04-01'),
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    workingHours: { start: '09:00', end: '18:00' }
                },
                status: getRandomElement(['active', 'inactive']),
                subscriptionPlan: getRandomElement(['basic', 'premium', 'enterprise']),
                subscriptionExpiry: faker_1.faker.date.future(),
                createdBy: dummyUserId,
                isActive: true
            });
            this.companies.push(company);
        }
        console.log(`✅ Created ${this.companies.length} companies`);
    }
    async seedUsers() {
        console.log('👤 Seeding users...');
        for (const company of this.companies) {
            for (let i = 0; i < SEED_CONFIG.usersPerCompany; i++) {
                const firstName = faker_1.faker.person.firstName();
                const lastName = faker_1.faker.person.lastName();
                const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-zA-Z0-9_]/g, '');
                const email = faker_1.faker.internet.email({ firstName, lastName });
                const user = await models_1.User.create({
                    username: username,
                    email: email,
                    password: 'password123',
                    personalInfo: {
                        firstName: firstName,
                        lastName: lastName,
                        phone: `+91${faker_1.faker.string.numeric(10)}`,
                        dateOfBirth: faker_1.faker.date.birthdate({ min: 22, max: 60, mode: 'age' }),
                        gender: getRandomElement(['Male', 'Female'])
                    },
                    addresses: {
                        current: {
                            street: faker_1.faker.location.streetAddress(),
                            city: faker_1.faker.location.city(),
                            state: faker_1.faker.location.state(),
                            pincode: faker_1.faker.location.zipCode(),
                            country: 'India'
                        },
                        permanent: {
                            street: faker_1.faker.location.streetAddress(),
                            city: faker_1.faker.location.city(),
                            state: faker_1.faker.location.state(),
                            pincode: faker_1.faker.location.zipCode(),
                            country: 'India'
                        }
                    },
                    companyAccess: [{
                            companyId: company._id,
                            role: i === 0 ? 'super_admin' : getRandomElement(['manager', 'accountant', 'production_manager', 'sales_executive', 'operator']),
                            department: getRandomElement(['Management', 'Production', 'Sales', 'Accounts', 'Quality']),
                            designation: faker_1.faker.person.jobTitle(),
                            employeeId: `EMP${faker_1.faker.number.int({ min: 1000, max: 9999 })}`,
                            joiningDate: faker_1.faker.date.past({ years: 2 }),
                            permissions: {
                                inventory: { view: true, create: i === 0, edit: i === 0 },
                                production: { view: true, create: i === 0, edit: i === 0 },
                                orders: { view: true, create: true, edit: i === 0 },
                                financial: { view: i === 0, create: i === 0, edit: i === 0 },
                                security: { gateManagement: false, visitorManagement: false },
                                hr: { viewEmployees: i === 0, manageAttendance: false },
                                admin: { userManagement: i === 0, systemSettings: i === 0 }
                            },
                            isActive: true,
                            joinedAt: faker_1.faker.date.past({ years: 2 })
                        }],
                    employmentInfo: {
                        employeeId: `EMP${faker_1.faker.number.int({ min: 1000, max: 9999 })}`,
                        joiningDate: faker_1.faker.date.past({ years: 3 }),
                        department: getRandomElement(['Management', 'Production', 'Sales', 'Accounts']),
                        designation: faker_1.faker.person.jobTitle(),
                        reportingManager: null,
                        workLocation: 'Head Office',
                        employmentType: 'Full-time',
                        probationPeriod: 6,
                        confirmationDate: faker_1.faker.date.past({ years: 2 }),
                        salary: {
                            basic: faker_1.faker.number.int({ min: 25000, max: 80000 }),
                            hra: faker_1.faker.number.int({ min: 5000, max: 15000 }),
                            allowances: faker_1.faker.number.int({ min: 2000, max: 8000 }),
                            deductions: faker_1.faker.number.int({ min: 1000, max: 5000 })
                        },
                        bankDetails: {
                            bankName: getRandomElement(['SBI', 'HDFC', 'ICICI']),
                            accountNumber: faker_1.faker.finance.accountNumber(),
                            ifscCode: faker_1.faker.finance.routingNumber()
                        }
                    },
                    security: {
                        lastLogin: faker_1.faker.date.recent(),
                        loginAttempts: 0,
                        isLocked: false,
                        lockUntil: null,
                        passwordChangedAt: faker_1.faker.date.past({ years: 1 }),
                        mustChangePassword: false,
                        twoFactorEnabled: false
                    },
                    preferences: {
                        language: 'en',
                        timezone: 'Asia/Kolkata',
                        theme: getRandomElement(['light', 'dark']),
                        notifications: {
                            email: true,
                            sms: faker_1.faker.datatype.boolean(),
                            push: faker_1.faker.datatype.boolean()
                        }
                    },
                    isActive: true
                });
                this.users.push(user);
            }
        }
        console.log(`✅ Created ${this.users.length} users`);
    }
    async seedRoles() {
        console.log('👥 Seeding roles...');
        for (const company of this.companies) {
            const roleData = [
                { name: 'Super Admin', code: 'SUPER_ADMIN', level: 'super_admin', dept: 'Management' },
                { name: 'Admin', code: 'ADMIN', level: 'admin', dept: 'Management' },
                { name: 'Manager', code: 'MANAGER', level: 'manager', dept: 'Management' },
                { name: 'Supervisor', code: 'SUPERVISOR', level: 'supervisor', dept: 'Production' },
                { name: 'Operator', code: 'OPERATOR', level: 'operator', dept: 'Production' },
                { name: 'Accountant', code: 'ACCOUNTANT', level: 'executive', dept: 'Accounts' }
            ];
            for (const roleInfo of roleData) {
                const role = await models_1.Role.create({
                    companyId: company._id,
                    roleName: roleInfo.name,
                    roleCode: roleInfo.code,
                    roleLevel: roleInfo.level,
                    roleType: 'custom',
                    department: roleInfo.dept,
                    description: `${roleInfo.name} role for ${company.companyName}`,
                    permissions: {
                        system: {
                            userManagement: roleInfo.level === 'super_admin' || roleInfo.level === 'admin',
                            roleManagement: roleInfo.level === 'super_admin',
                            companySettings: roleInfo.level === 'super_admin' || roleInfo.level === 'admin',
                            systemSettings: roleInfo.level === 'super_admin'
                        },
                        users: {
                            view: true,
                            create: roleInfo.level === 'super_admin' || roleInfo.level === 'admin',
                            edit: roleInfo.level === 'super_admin' || roleInfo.level === 'admin',
                            delete: roleInfo.level === 'super_admin'
                        },
                        inventory: {
                            view: true,
                            create: roleInfo.level !== 'operator',
                            edit: roleInfo.level !== 'operator',
                            delete: roleInfo.level === 'super_admin' || roleInfo.level === 'admin'
                        },
                        production: {
                            view: true,
                            create: roleInfo.dept === 'Production' || roleInfo.level === 'manager',
                            edit: roleInfo.dept === 'Production' || roleInfo.level === 'manager',
                            delete: roleInfo.level === 'super_admin' || roleInfo.level === 'admin'
                        },
                        financial: {
                            view: roleInfo.dept === 'Accounts' || roleInfo.level === 'super_admin' || roleInfo.level === 'admin',
                            create: roleInfo.dept === 'Accounts',
                            edit: roleInfo.dept === 'Accounts',
                            delete: roleInfo.level === 'super_admin'
                        }
                    },
                    isActive: true,
                    isSystemRole: roleInfo.level === 'super_admin',
                    maxUsers: roleInfo.level === 'super_admin' ? 2 : (roleInfo.level === 'admin' ? 5 : 50),
                    currentUsers: 0,
                    createdBy: this.users.length > 0 ? this.users[0]._id : new mongoose_1.default.Types.ObjectId()
                });
                this.roles.push(role);
            }
        }
        console.log(`✅ Created ${this.roles.length} roles`);
    }
    async seedCustomers() {
        console.log('🤝 Seeding customers...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.customersPerCompany; i++) {
                const location = getRandomElement(INDIAN_LOCATIONS);
                const createdBy = getRandomElement(companyUsers);
                const customer = await models_1.Customer.create({
                    companyId: company._id,
                    customerCode: `CUST${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    customerName: faker_1.faker.company.name(),
                    contactPerson: faker_1.faker.person.fullName(),
                    contactInfo: {
                        primaryPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        primaryEmail: faker_1.faker.internet.email(),
                        alternatePhone: `+91${faker_1.faker.string.numeric(10)}`,
                        alternateEmail: faker_1.faker.internet.email()
                    },
                    address: {
                        street: faker_1.faker.location.streetAddress(),
                        area: faker_1.faker.location.secondaryAddress(),
                        city: location.city,
                        state: location.state,
                        pincode: location.pincode,
                        country: 'India'
                    },
                    businessInfo: {
                        gstNumber: Math.random() > 0.3 ? `27${faker_1.faker.string.alpha({ length: 5, casing: 'upper' })}${faker_1.faker.string.numeric(4)}${faker_1.faker.string.alpha({ length: 1, casing: 'upper' })}1Z${faker_1.faker.string.alphanumeric({ length: 1, casing: 'upper' })}` : undefined,
                        panNumber: faker_1.faker.string.alpha({ length: 5, casing: 'upper' }) + faker_1.faker.string.numeric(4) + faker_1.faker.string.alpha({ length: 1, casing: 'upper' }),
                        businessType: getRandomElement(['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited']),
                        industry: getRandomElement(INDUSTRIES)
                    },
                    creditInfo: {
                        creditLimit: faker_1.faker.number.int({ min: 50000, max: 500000 }),
                        creditPeriod: getRandomElement([15, 30, 45, 60]),
                        outstandingAmount: faker_1.faker.number.int({ min: 0, max: 100000 })
                    },
                    isActive: true,
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.customers.push(customer);
            }
        }
        console.log(`✅ Created ${this.customers.length} customers`);
    }
    async seedSuppliers() {
        console.log('🏭 Seeding suppliers...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.suppliersPerCompany; i++) {
                const location = getRandomElement(INDIAN_LOCATIONS);
                const createdBy = getRandomElement(companyUsers);
                const supplier = await models_1.Supplier.create({
                    companyId: company._id,
                    supplierCode: `SUPP${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    supplierName: faker_1.faker.company.name() + ' Suppliers',
                    businessInfo: {
                        businessType: getRandomElement(['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited']),
                        industry: getRandomElement(INDUSTRIES)
                    },
                    contactInfo: {
                        primaryPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        primaryEmail: faker_1.faker.internet.email(),
                        alternatePhone: `+91${faker_1.faker.string.numeric(10)}`,
                        alternateEmail: faker_1.faker.internet.email()
                    },
                    addresses: [{
                            type: 'office',
                            addressLine1: faker_1.faker.location.streetAddress(),
                            addressLine2: faker_1.faker.location.secondaryAddress(),
                            city: location.city,
                            state: location.state,
                            pincode: location.pincode,
                            country: 'India',
                            isPrimary: true
                        }],
                    registrationDetails: {
                        gstin: Math.random() > 0.2 ? `27${faker_1.faker.string.alpha({ length: 5, casing: 'upper' })}${faker_1.faker.string.numeric(4)}${faker_1.faker.string.alpha({ length: 1, casing: 'upper' })}1Z${faker_1.faker.string.alphanumeric({ length: 1, casing: 'upper' })}` : undefined,
                        pan: faker_1.faker.string.alpha({ length: 5, casing: 'upper' }) + faker_1.faker.string.numeric(4) + faker_1.faker.string.alpha({ length: 1, casing: 'upper' })
                    },
                    financialInfo: {
                        paymentTerms: getRandomElement(['Advance', 'COD', '15 Days', '30 Days', '45 Days']),
                        creditLimit: faker_1.faker.number.int({ min: 100000, max: 2000000 }),
                        bankDetails: [{
                                bankName: getRandomElement(['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'PNB']),
                                accountNumber: faker_1.faker.finance.accountNumber(),
                                ifscCode: faker_1.faker.finance.routingNumber(),
                                accountHolderName: faker_1.faker.company.name(),
                                isPrimary: true
                            }]
                    },
                    performance: {
                        overallRating: faker_1.faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
                        qualityRating: faker_1.faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
                        deliveryRating: faker_1.faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
                        serviceRating: faker_1.faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })
                    },
                    relationship: {
                        supplierType: getRandomElement(['manufacturer', 'trader', 'distributor', 'agent', 'service_provider']),
                        supplierCategory: getRandomElement(['strategic', 'preferred', 'approved', 'conditional']),
                        supplierSince: faker_1.faker.date.past({ years: 3 }),
                        priority: getRandomElement(['low', 'medium', 'high'])
                    },
                    isActive: true,
                    createdBy: createdBy._id
                });
                this.suppliers.push(supplier);
            }
        }
        console.log(`✅ Created ${this.suppliers.length} suppliers`);
    }
    async seedWarehouses() {
        console.log('🏪 Seeding warehouses...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.warehousesPerCompany; i++) {
                const location = getRandomElement(INDIAN_LOCATIONS);
                const createdBy = getRandomElement(companyUsers);
                const warehouse = await models_1.Warehouse.create({
                    companyId: company._id,
                    warehouseCode: `WH${company._id.toString().slice(-4)}${i.toString().padStart(2, '0')}`,
                    warehouseName: `${getRandomElement(['Main', 'Secondary', 'Raw Material', 'Finished Goods'])} Warehouse ${i + 1}`,
                    description: faker_1.faker.lorem.sentence(),
                    address: {
                        addressLine1: faker_1.faker.location.streetAddress(),
                        addressLine2: faker_1.faker.location.secondaryAddress(),
                        city: location.city,
                        state: location.state,
                        pincode: location.pincode,
                        country: 'India'
                    },
                    contactInfo: {
                        primaryPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        alternatePhone: `+91${faker_1.faker.string.numeric(10)}`,
                        email: faker_1.faker.internet.email()
                    },
                    warehouseType: getRandomElement(['distribution', 'manufacturing', 'retail', 'cold_storage']),
                    ownershipType: getRandomElement(['owned', 'leased', 'rented']),
                    operationType: getRandomElement(['automated', 'semi_automated', 'manual']),
                    specifications: {
                        totalArea: faker_1.faker.number.int({ min: 1000, max: 10000 }),
                        storageArea: faker_1.faker.number.int({ min: 800, max: 8000 }),
                        officeArea: faker_1.faker.number.int({ min: 100, max: 500 }),
                        height: faker_1.faker.number.int({ min: 8, max: 15 }),
                        dockDoors: faker_1.faker.number.int({ min: 2, max: 10 }),
                        floors: faker_1.faker.number.int({ min: 1, max: 3 })
                    },
                    capacity: {
                        maxWeight: faker_1.faker.number.int({ min: 100000, max: 1000000 }),
                        maxVolume: faker_1.faker.number.int({ min: 5000, max: 50000 }),
                        maxPallets: faker_1.faker.number.int({ min: 500, max: 5000 }),
                        maxSKUs: faker_1.faker.number.int({ min: 1000, max: 10000 })
                    },
                    currentUtilization: {
                        currentWeight: faker_1.faker.number.int({ min: 10000, max: 500000 }),
                        currentVolume: faker_1.faker.number.int({ min: 1000, max: 25000 }),
                        currentPallets: faker_1.faker.number.int({ min: 100, max: 2500 }),
                        currentSKUs: faker_1.faker.number.int({ min: 200, max: 5000 }),
                        utilizationPercentage: faker_1.faker.number.float({ min: 20, max: 85, fractionDigits: 1 })
                    },
                    zones: Array.from({ length: faker_1.faker.number.int({ min: 3, max: 6 }) }, (_, zoneIndex) => ({
                        zoneCode: `Z${String.fromCharCode(65 + zoneIndex)}`,
                        zoneName: `Zone ${String.fromCharCode(65 + zoneIndex)}`,
                        zoneType: getRandomElement(['receiving', 'storage', 'picking', 'packing', 'shipping', 'staging']),
                        area: faker_1.faker.number.int({ min: 100, max: 1000 }),
                        totalLocations: faker_1.faker.number.int({ min: 10, max: 50 }),
                        occupiedLocations: faker_1.faker.number.int({ min: 5, max: 40 }),
                        utilizationPercentage: faker_1.faker.number.float({ min: 20, max: 90, fractionDigits: 1 })
                    })),
                    management: {
                        warehouseManagerName: faker_1.faker.person.fullName(),
                        totalStaff: faker_1.faker.number.int({ min: 5, max: 50 })
                    },
                    facilities: {
                        loadingDocks: faker_1.faker.number.int({ min: 2, max: 8 }),
                        parkingSpaces: faker_1.faker.number.int({ min: 10, max: 100 }),
                        securitySystems: getRandomElements(['CCTV', 'Access Control', 'Alarm System'], 2),
                        safetyEquipment: getRandomElements(['Fire Extinguisher', 'Sprinkler System', 'Emergency Exit'], 2),
                        utilities: getRandomElements(['Electricity', 'Water', 'Internet', 'Phone'], 3)
                    },
                    operatingHours: {
                        monday: { open: '08:00', close: '18:00', isOpen: true },
                        tuesday: { open: '08:00', close: '18:00', isOpen: true },
                        wednesday: { open: '08:00', close: '18:00', isOpen: true },
                        thursday: { open: '08:00', close: '18:00', isOpen: true },
                        friday: { open: '08:00', close: '18:00', isOpen: true },
                        saturday: { open: '08:00', close: '14:00', isOpen: true },
                        sunday: { open: '00:00', close: '00:00', isOpen: false }
                    },
                    isActive: true,
                    createdBy: createdBy._id
                });
                this.warehouses.push(warehouse);
            }
        }
        console.log(`✅ Created ${this.warehouses.length} warehouses`);
    }
    async seedInventoryItems() {
        console.log('📦 Seeding inventory items...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.inventoryItemsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const category = getRandomElement(PRODUCT_CATEGORIES);
                const itemCode = `ITEM${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`;
                const companyItemCode = `${company.companyCode}-${itemCode}`;
                const item = await models_1.InventoryItem.create({
                    companyId: company._id,
                    itemCode: itemCode,
                    itemName: faker_1.faker.commerce.productName(),
                    itemDescription: faker_1.faker.commerce.productDescription(),
                    companyItemCode: companyItemCode,
                    category: {
                        primary: getRandomElement(['raw_material', 'semi_finished', 'finished_goods', 'consumables', 'spare_parts'])
                    },
                    productType: getRandomElement(['saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom']),
                    specifications: {
                        gsm: faker_1.faker.number.int({ min: 100, max: 500 }),
                        width: faker_1.faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 2 }),
                        length: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
                        weight: faker_1.faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
                        color: faker_1.faker.color.human(),
                        design: faker_1.faker.commerce.productAdjective(),
                        material: getRandomElement(['Cotton', 'Silk', 'Polyester', 'Wool', 'Linen']),
                        finish: getRandomElement(['Matte', 'Glossy', 'Textured', 'Smooth'])
                    },
                    pricing: {
                        costPrice: faker_1.faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
                        sellingPrice: faker_1.faker.number.float({ min: 15, max: 1500, fractionDigits: 2 }),
                        mrp: faker_1.faker.number.float({ min: 20, max: 2000, fractionDigits: 2 }),
                        currency: 'INR',
                        priceValidFrom: faker_1.faker.date.past(),
                        priceValidTo: faker_1.faker.date.future()
                    },
                    stock: {
                        currentStock: faker_1.faker.number.int({ min: 0, max: 1000 }),
                        reservedStock: faker_1.faker.number.int({ min: 0, max: 100 }),
                        availableStock: faker_1.faker.number.int({ min: 0, max: 900 }),
                        reorderLevel: faker_1.faker.number.int({ min: 10, max: 50 }),
                        maxStockLevel: faker_1.faker.number.int({ min: 500, max: 2000 }),
                        unit: getRandomElement(['pieces', 'kg', 'meters', 'liters', 'boxes']),
                        lastStockUpdate: faker_1.faker.date.recent()
                    },
                    quality: {
                        hasQualityCheck: faker_1.faker.datatype.boolean(),
                        qualityGrade: getRandomElement(['A', 'B', 'C']),
                        qualityStandards: getRandomElements(['ISO', 'CE', 'BIS', 'ROHS'], faker_1.faker.number.int({ min: 0, max: 3 })),
                        defectRate: faker_1.faker.number.float({ min: 0, max: 5, fractionDigits: 2 })
                    },
                    status: {
                        isActive: true,
                        isDiscontinued: false,
                        lifecycle: getRandomElement(['new', 'active', 'mature', 'declining'])
                    },
                    tracking: {
                        createdBy: createdBy._id,
                        lastModifiedBy: createdBy._id,
                        lastStockUpdate: faker_1.faker.date.recent(),
                        totalInward: faker_1.faker.number.int({ min: 100, max: 1000 }),
                        totalOutward: faker_1.faker.number.int({ min: 50, max: 500 })
                    },
                    createdBy: createdBy._id
                });
                this.inventoryItems.push(item);
            }
        }
        console.log(`✅ Created ${this.inventoryItems.length} inventory items`);
    }
    async seedProductionOrders() {
        console.log('🏭 Seeding production orders...');
        for (const company of this.companies) {
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.productionOrdersPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 3 }));
                const productionOrder = await models_1.ProductionOrder.create({
                    companyId: company._id,
                    productionOrderNumber: `PO${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    orderDate: faker_1.faker.date.past({ years: 1 }),
                    expectedCompletionDate: faker_1.faker.date.future({ years: 0.5 }),
                    product: {
                        productType: getRandomElement(['saree', 'african_cotton', 'garment_fabric', 'digital_print', 'custom']),
                        design: faker_1.faker.commerce.productAdjective(),
                        color: faker_1.faker.color.human(),
                        gsm: faker_1.faker.number.int({ min: 100, max: 500 }),
                        width: faker_1.faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 2 }),
                        length: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 2 })
                    },
                    orderQuantity: faker_1.faker.number.int({ min: 10, max: 500 }),
                    unit: getRandomElement(['pieces', 'meters', 'kg']),
                    completedQuantity: faker_1.faker.number.int({ min: 0, max: 100 }),
                    pendingQuantity: faker_1.faker.number.int({ min: 0, max: 400 }),
                    status: getRandomElement(['draft', 'approved', 'in_progress', 'completed', 'cancelled']),
                    priority: getRandomElement(['low', 'medium', 'high', 'urgent']),
                    productionStages: [
                        {
                            stageNumber: 1,
                            stageName: 'Material Preparation',
                            status: getRandomElement(['pending', 'in_progress', 'completed']),
                            timing: {
                                plannedStartTime: faker_1.faker.date.past(),
                                plannedDuration: faker_1.faker.number.int({ min: 1, max: 5 })
                            }
                        },
                        {
                            stageNumber: 2,
                            stageName: 'Manufacturing',
                            status: getRandomElement(['pending', 'in_progress', 'completed']),
                            timing: {
                                plannedStartTime: faker_1.faker.date.past(),
                                plannedDuration: faker_1.faker.number.int({ min: 3, max: 10 })
                            }
                        }
                    ],
                    estimatedCost: faker_1.faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
                    actualCost: faker_1.faker.number.float({ min: 800, max: 55000, fractionDigits: 2 }),
                    assignedTo: getRandomElement(companyUsers)._id,
                    createdBy: createdBy._id
                });
                this.productionOrders.push(productionOrder);
            }
        }
        console.log(`✅ Created ${this.productionOrders.length} production orders`);
    }
    async seedCustomerOrders() {
        console.log('🛒 Seeding customer orders...');
        for (const company of this.companies) {
            const companyCustomers = this.customers.filter(c => c.companyId.toString() === company._id.toString());
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < 4; i++) {
                const customer = getRandomElement(companyCustomers);
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 4 }));
                const customerOrder = await models_1.CustomerOrder.create({
                    companyId: company._id,
                    orderNumber: `CO${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    customerId: customer._id,
                    customerName: customer.customerName,
                    orderDate: faker_1.faker.date.past({ years: 1 }),
                    orderType: getRandomElement(['local', 'export', 'custom', 'sample', 'bulk', 'repeat']),
                    orderSource: getRandomElement(['direct', 'meesho', 'indiamart', 'website', 'phone', 'email', 'whatsapp', 'exhibition']),
                    expectedDeliveryDate: faker_1.faker.date.future({ years: 0.3 }),
                    items: items.map(item => ({
                        itemId: item._id,
                        quantity: faker_1.faker.number.int({ min: 1, max: 100 }),
                        unitPrice: faker_1.faker.number.float({ min: 50, max: 1500, fractionDigits: 2 }),
                        discount: faker_1.faker.number.float({ min: 0, max: 15, fractionDigits: 2 }),
                        totalPrice: faker_1.faker.number.float({ min: 50, max: 10000, fractionDigits: 2 })
                    })),
                    subtotal: faker_1.faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
                    taxAmount: faker_1.faker.number.float({ min: 180, max: 9000, fractionDigits: 2 }),
                    totalAmount: faker_1.faker.number.float({ min: 1180, max: 59000, fractionDigits: 2 }),
                    status: getRandomElement(['draft', 'confirmed', 'in_production', 'ready_to_dispatch', 'dispatched', 'delivered', 'completed', 'cancelled']),
                    priority: getRandomElement(['low', 'medium', 'high', 'urgent']),
                    shippingAddress: {
                        street: faker_1.faker.location.streetAddress(),
                        city: faker_1.faker.location.city(),
                        state: faker_1.faker.location.state(),
                        pincode: faker_1.faker.location.zipCode(),
                        country: 'India'
                    },
                    paymentStatus: getRandomElement(['Pending', 'Partial', 'Paid', 'Overdue']),
                    paymentMethod: getRandomElement(['Cash', 'Bank Transfer', 'Cheque', 'Online']),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.customerOrders.push(customerOrder);
            }
        }
        console.log(`✅ Created ${this.customerOrders.length} customer orders`);
    }
    async seedPurchaseOrders() {
        console.log('🛍️ Seeding purchase orders...');
        for (const company of this.companies) {
            const companySuppliers = this.suppliers.filter(s => s.companyId.toString() === company._id.toString());
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < 3; i++) {
                const supplier = getRandomElement(companySuppliers);
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 3 }));
                const poNumber = `PUR${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`;
                const purchaseOrder = await models_1.PurchaseOrder.create({
                    companyId: company._id,
                    poNumber: poNumber,
                    supplier: {
                        supplierId: supplier._id,
                        supplierCode: supplier.supplierCode,
                        supplierName: supplier.supplierName,
                        address: {
                            addressLine1: supplier.addresses[0]?.addressLine1 || faker_1.faker.location.streetAddress(),
                            city: supplier.addresses[0]?.city || faker_1.faker.location.city(),
                            state: supplier.addresses[0]?.state || faker_1.faker.location.state(),
                            pincode: supplier.addresses[0]?.pincode || faker_1.faker.location.zipCode(),
                            country: 'India'
                        }
                    },
                    poDate: faker_1.faker.date.past({ years: 1 }),
                    expectedDeliveryDate: faker_1.faker.date.future({ years: 0.2 }),
                    deliveryInfo: {
                        deliveryAddress: {
                            addressLine1: faker_1.faker.location.streetAddress(),
                            city: faker_1.faker.location.city(),
                            state: faker_1.faker.location.state(),
                            pincode: faker_1.faker.location.zipCode(),
                            country: 'India'
                        },
                        contactPerson: faker_1.faker.person.fullName(),
                        contactPhone: `+91${faker_1.faker.string.numeric(10)}`
                    },
                    financialYear: '2024-25',
                    poType: getRandomElement(['standard', 'blanket', 'contract', 'planned', 'emergency', 'service', 'capital']),
                    category: getRandomElement(['raw_material', 'finished_goods', 'consumables', 'services', 'capital_goods', 'maintenance']),
                    items: items.map(item => {
                        const quantity = faker_1.faker.number.int({ min: 10, max: 1000 });
                        const rate = faker_1.faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
                        const taxableAmount = quantity * rate;
                        const lineTotal = taxableAmount * 1.18;
                        return {
                            itemId: item._id,
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            description: item.itemDescription,
                            quantity: quantity,
                            unit: getRandomElement(['pieces', 'kg', 'meters', 'liters']),
                            rate: rate,
                            taxableAmount: taxableAmount,
                            lineTotal: lineTotal
                        };
                    }),
                    amounts: {
                        subtotal: faker_1.faker.number.float({ min: 5000, max: 100000, fractionDigits: 2 }),
                        taxableAmount: faker_1.faker.number.float({ min: 5000, max: 100000, fractionDigits: 2 }),
                        totalTaxAmount: faker_1.faker.number.float({ min: 900, max: 18000, fractionDigits: 2 }),
                        grandTotal: faker_1.faker.number.float({ min: 5900, max: 118000, fractionDigits: 2 })
                    },
                    taxDetails: {
                        placeOfSupply: faker_1.faker.location.state()
                    },
                    paymentTerms: {
                        termType: getRandomElement(['advance', 'net', 'cod', 'credit'])
                    },
                    status: getRandomElement(['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'in_progress', 'partially_received', 'completed', 'cancelled']),
                    terms: `Payment: ${getRandomElement(['Advance', '15 Days', '30 Days', '45 Days'])}. Delivery: ${getRandomElement(['FOB', 'CIF', 'Ex-Works'])}. Warranty: ${faker_1.faker.number.int({ min: 6, max: 36 })} months.`,
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.purchaseOrders.push(purchaseOrder);
            }
        }
        console.log(`✅ Created ${this.purchaseOrders.length} purchase orders`);
    }
    async seedInvoices() {
        console.log('🧾 Seeding invoices...');
        for (const company of this.companies) {
            const companyCustomers = this.customers.filter(c => c.companyId.toString() === company._id.toString());
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.invoicesPerCompany; i++) {
                const customer = getRandomElement(companyCustomers);
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 3 }));
                const invoice = await models_1.Invoice.create({
                    companyId: company._id,
                    invoiceNumber: `INV${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    invoiceDate: faker_1.faker.date.past({ years: 1 }),
                    dueDate: faker_1.faker.date.future({ years: 0.1 }),
                    customer: {
                        customerId: customer._id,
                        customerCode: customer.customerCode,
                        customerName: customer.customerName,
                        billingAddress: {
                            addressLine1: customer.addresses[0]?.addressLine1 || faker_1.faker.location.streetAddress(),
                            city: customer.addresses[0]?.city || faker_1.faker.location.city(),
                            state: customer.addresses[0]?.state || faker_1.faker.location.state(),
                            pincode: customer.addresses[0]?.pincode || faker_1.faker.location.zipCode(),
                            country: 'India'
                        }
                    },
                    financialYear: '2024-25',
                    invoiceType: getRandomElement(['sales', 'service', 'proforma', 'credit_note', 'debit_note', 'advance', 'final']),
                    invoiceCategory: getRandomElement(['b2b', 'b2c', 'export', 'import', 'sez', 'deemed_export']),
                    placeOfSupply: faker_1.faker.location.state(),
                    items: items.map(item => {
                        const quantity = faker_1.faker.number.int({ min: 1, max: 50 });
                        const rate = faker_1.faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
                        const discount = faker_1.faker.number.float({ min: 0, max: 10, fractionDigits: 2 });
                        const taxableAmount = (quantity * rate) - discount;
                        const taxAmount = taxableAmount * 0.18;
                        const lineTotal = taxableAmount + taxAmount;
                        return {
                            itemId: item._id,
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            description: item.itemDescription,
                            quantity: quantity,
                            unit: getRandomElement(['pieces', 'kg', 'meters', 'liters']),
                            rate: rate,
                            discount: discount,
                            taxableAmount: taxableAmount,
                            taxAmount: taxAmount,
                            lineTotal: lineTotal
                        };
                    }),
                    amounts: {
                        subtotal: faker_1.faker.number.float({ min: 1000, max: 25000, fractionDigits: 2 }),
                        totalDiscount: faker_1.faker.number.float({ min: 0, max: 2500, fractionDigits: 2 }),
                        taxableAmount: faker_1.faker.number.float({ min: 1000, max: 25000, fractionDigits: 2 }),
                        totalTaxAmount: faker_1.faker.number.float({ min: 180, max: 4500, fractionDigits: 2 }),
                        grandTotal: faker_1.faker.number.float({ min: 1180, max: 27000, fractionDigits: 2 }),
                        balanceAmount: faker_1.faker.number.float({ min: 1180, max: 27000, fractionDigits: 2 })
                    },
                    status: getRandomElement(['draft', 'approved', 'sent', 'cancelled']),
                    paymentStatus: getRandomElement(['unpaid', 'partially_paid', 'paid', 'overdue']),
                    gstDetails: {
                        gstNumber: customer.businessInfo?.gstNumber || '',
                        placeOfSupply: faker_1.faker.location.state(),
                        reverseCharge: faker_1.faker.datatype.boolean()
                    },
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.invoices.push(invoice);
            }
        }
        console.log(`✅ Created ${this.invoices.length} invoices`);
    }
    async seedQuotations() {
        console.log('💰 Seeding quotations...');
        for (const company of this.companies) {
            const companyCustomers = this.customers.filter(c => c.companyId.toString() === company._id.toString());
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.quotationsPerCompany; i++) {
                const customer = getRandomElement(companyCustomers);
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 3 }));
                const quotation = await models_1.Quotation.create({
                    companyId: company._id,
                    quotationNumber: `QUO${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    quotationDate: faker_1.faker.date.past({ years: 1 }),
                    validUntil: faker_1.faker.date.future({ years: 0.1 }),
                    party: {
                        partyType: 'customer',
                        partyId: customer._id,
                        partyCode: customer.customerCode,
                        partyName: customer.customerName,
                        address: {
                            addressLine1: customer.addresses[0]?.addressLine1 || faker_1.faker.location.streetAddress(),
                            city: customer.addresses[0]?.city || faker_1.faker.location.city(),
                            state: customer.addresses[0]?.state || faker_1.faker.location.state(),
                            pincode: customer.addresses[0]?.pincode || faker_1.faker.location.zipCode(),
                            country: 'India'
                        }
                    },
                    quotationType: getRandomElement(['sales', 'purchase', 'service', 'rental', 'maintenance', 'project']),
                    category: getRandomElement(['product', 'service', 'mixed', 'project', 'amc', 'rental']),
                    items: items.map(item => {
                        const quantity = faker_1.faker.number.int({ min: 1, max: 100 });
                        const rate = faker_1.faker.number.float({ min: 50, max: 1000, fractionDigits: 2 });
                        const discount = faker_1.faker.number.float({ min: 0, max: 15, fractionDigits: 2 });
                        const taxableAmount = (quantity * rate) - discount;
                        const taxAmount = taxableAmount * 0.18;
                        const lineTotal = taxableAmount + taxAmount;
                        return {
                            itemId: item._id,
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            description: item.itemDescription,
                            quantity: quantity,
                            unit: getRandomElement(['pieces', 'kg', 'meters', 'liters']),
                            rate: rate,
                            discount: discount,
                            taxableAmount: taxableAmount,
                            taxAmount: taxAmount,
                            lineTotal: lineTotal
                        };
                    }),
                    amounts: {
                        subtotal: faker_1.faker.number.float({ min: 1000, max: 40000, fractionDigits: 2 }),
                        totalDiscount: faker_1.faker.number.float({ min: 0, max: 6000, fractionDigits: 2 }),
                        taxableAmount: faker_1.faker.number.float({ min: 1000, max: 40000, fractionDigits: 2 }),
                        totalTaxAmount: faker_1.faker.number.float({ min: 180, max: 7200, fractionDigits: 2 }),
                        grandTotal: faker_1.faker.number.float({ min: 1180, max: 41200, fractionDigits: 2 })
                    },
                    taxDetails: {
                        placeOfSupply: faker_1.faker.location.state()
                    },
                    status: getRandomElement(['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'negotiation', 'accepted', 'rejected', 'expired', 'cancelled']),
                    terms: [{
                            termType: 'payment',
                            title: 'Payment Terms',
                            description: `Payment: ${getRandomElement(['Advance', '15 Days', '30 Days'])}`
                        }, {
                            termType: 'delivery',
                            title: 'Delivery Terms',
                            description: `Delivery: ${getRandomElement(['7 Days', '15 Days', '30 Days'])}`
                        }, {
                            termType: 'warranty',
                            title: 'Warranty Terms',
                            description: `Warranty: ${faker_1.faker.number.int({ min: 12, max: 24 })} months`
                        }],
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.quotations.push(quotation);
            }
        }
        console.log(`✅ Created ${this.quotations.length} quotations`);
    }
    async seedFinancialTransactions() {
        console.log('💳 Seeding financial transactions...');
        for (const company of this.companies) {
            const companyCustomers = this.customers.filter(c => c.companyId.toString() === company._id.toString());
            const companySuppliers = this.suppliers.filter(s => s.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.financialTransactionsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const transactionType = getRandomElement(['income', 'expense', 'transfer']);
                let relatedEntity = null;
                if (transactionType === 'Income' && companyCustomers.length > 0) {
                    relatedEntity = { type: 'Customer', id: getRandomElement(companyCustomers)._id };
                }
                else if (transactionType === 'Expense' && companySuppliers.length > 0) {
                    relatedEntity = { type: 'Supplier', id: getRandomElement(companySuppliers)._id };
                }
                const transaction = await models_1.FinancialTransaction.create({
                    companyId: company._id,
                    transactionNumber: `TXN${faker_1.faker.number.int({ min: 100000, max: 999999 })}`,
                    transactionDate: faker_1.faker.date.past({ years: 1 }),
                    transactionType: transactionType,
                    category: getRandomElement(['sales_revenue', 'service_income', 'raw_material', 'salary_wages', 'rent', 'utilities', 'maintenance']),
                    financialYear: '2024-25',
                    amount: faker_1.faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
                    currency: 'INR',
                    description: faker_1.faker.lorem.sentence(),
                    paymentDetails: {
                        paymentMethod: getRandomElement(['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'online']),
                        paymentReference: faker_1.faker.string.alphanumeric(10)
                    },
                    relatedEntity,
                    bankAccount: {
                        accountNumber: faker_1.faker.finance.accountNumber(),
                        bankName: getRandomElement(['SBI', 'HDFC', 'ICICI', 'Axis Bank'])
                    },
                    status: getRandomElement(['Pending', 'Completed', 'Failed', 'Cancelled']),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.financialTransactions.push(transaction);
            }
        }
        console.log(`✅ Created ${this.financialTransactions.length} financial transactions`);
    }
    async seedVisitors() {
        console.log('👥 Seeding visitors...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.visitorsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const hostUser = getRandomElement(companyUsers);
                const entryTime = faker_1.faker.date.past({ years: 0.5 });
                const exitTime = Math.random() > 0.3 ? faker_1.faker.date.between({ from: entryTime, to: new Date() }) : null;
                const visitorNumber = `VIS${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`;
                const visitor = await models_1.Visitor.create({
                    companyId: company._id,
                    visitorId: visitorNumber,
                    visitorNumber: visitorNumber,
                    personalInfo: {
                        firstName: faker_1.faker.person.firstName(),
                        lastName: faker_1.faker.person.lastName(),
                        fullName: faker_1.faker.person.fullName(),
                        gender: getRandomElement(['Male', 'Female', 'Other'])
                    },
                    contactInfo: {
                        primaryPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        email: faker_1.faker.internet.email()
                    },
                    address: {
                        addressLine1: faker_1.faker.location.streetAddress(),
                        city: faker_1.faker.location.city(),
                        state: faker_1.faker.location.state(),
                        pincode: faker_1.faker.location.zipCode(),
                        country: 'India'
                    },
                    identification: {
                        idType: getRandomElement(['aadhar', 'pan', 'driving_license', 'passport']),
                        idNumber: faker_1.faker.string.alphanumeric(12),
                        idPhoto: faker_1.faker.image.avatar()
                    },
                    visitInfo: {
                        visitType: getRandomElement(['business', 'interview', 'meeting', 'delivery', 'maintenance', 'audit']),
                        visitPurpose: getRandomElement(['Business Meeting', 'Interview', 'Delivery', 'Maintenance', 'Audit']),
                        expectedDuration: faker_1.faker.number.int({ min: 30, max: 480 })
                    },
                    hostInfo: {
                        hostId: hostUser._id,
                        hostName: hostUser.firstName + ' ' + hostUser.lastName,
                        hostDepartment: getRandomElement(['Admin', 'Production', 'Quality', 'HR', 'Finance']),
                        meetingLocation: getRandomElement(['Conference Room A', 'Meeting Room 1', 'Reception', 'Office Floor 2', 'Factory Floor'])
                    },
                    entryTime,
                    exitTime,
                    status: exitTime ? 'Exited' : getRandomElement(['Pending', 'Approved', 'Inside', 'Rejected']),
                    securityCheck: {
                        metalDetector: faker_1.faker.datatype.boolean(),
                        bagCheck: faker_1.faker.datatype.boolean(),
                        temperatureCheck: faker_1.faker.number.float({ min: 96.5, max: 99.5, fractionDigits: 1 }),
                        remarks: faker_1.faker.lorem.sentence()
                    },
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.visitors.push(visitor);
            }
        }
        console.log(`✅ Created ${this.visitors.length} visitors`);
    }
    async seedVehicles() {
        console.log('🚗 Seeding vehicles...');
        const VEHICLE_TYPES = ['car', 'bike', 'truck', 'bus', 'auto', 'tempo', 'trailer'];
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < 4; i++) {
                const createdBy = getRandomElement(companyUsers);
                const vehicleType = getRandomElement(VEHICLE_TYPES);
                const entryTime = faker_1.faker.date.past({ years: 0.2 });
                const exitTime = Math.random() > 0.2 ? faker_1.faker.date.between({ from: entryTime, to: new Date() }) : null;
                const vehicleNumber = faker_1.faker.vehicle.vrm();
                const vehicle = await models_1.Vehicle.create({
                    companyId: company._id,
                    vehicleId: vehicleNumber,
                    vehicleNumber: vehicleNumber,
                    vehicleType,
                    vehicleInfo: {
                        make: faker_1.faker.vehicle.manufacturer(),
                        model: faker_1.faker.vehicle.model(),
                        year: faker_1.faker.number.int({ min: 2010, max: 2024 }),
                        color: faker_1.faker.vehicle.color(),
                        fuelType: getRandomElement(['petrol', 'diesel', 'cng'])
                    },
                    vehicleCategory: getRandomElement(['visitor', 'contractor', 'vendor', 'other']),
                    ownerInfo: {
                        ownerType: getRandomElement(['visitor', 'contractor', 'vendor', 'other']),
                        ownerName: faker_1.faker.person.fullName(),
                        ownerPhone: `+91${faker_1.faker.string.numeric(10)}`
                    },
                    driverInfo: {
                        driverName: faker_1.faker.person.fullName(),
                        driverPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        licenseNumber: faker_1.faker.string.alphanumeric(15),
                        licenseExpiry: faker_1.faker.date.future({ years: 2 })
                    },
                    visitInfo: {
                        purpose: getRandomElement(['Delivery', 'Pickup', 'Service', 'Official', 'Visitor']),
                        destination: getRandomElement(['Warehouse', 'Office', 'Factory', 'Loading Bay']),
                        expectedDuration: faker_1.faker.number.int({ min: 30, max: 300 }),
                        loadType: vehicleType === 'Truck' ? getRandomElement(['Raw Material', 'Finished Goods', 'Empty']) : undefined,
                        weight: vehicleType === 'Truck' ? faker_1.faker.number.int({ min: 1000, max: 25000 }) : undefined
                    },
                    entryTime,
                    exitTime,
                    status: exitTime ? 'Exited' : getRandomElement(['Pending', 'Approved', 'Inside', 'Loading', 'Unloading']),
                    securityCheck: {
                        documentVerified: faker_1.faker.datatype.boolean(),
                        vehicleInspected: faker_1.faker.datatype.boolean(),
                        weighbridgeEntry: vehicleType === 'Truck' ? faker_1.faker.number.int({ min: 5000, max: 30000 }) : undefined,
                        weighbridgeExit: vehicleType === 'Truck' && exitTime ? faker_1.faker.number.int({ min: 5000, max: 30000 }) : undefined,
                        remarks: faker_1.faker.lorem.sentence()
                    },
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.vehicles.push(vehicle);
            }
        }
        console.log(`✅ Created ${this.vehicles.length} vehicles`);
    }
    async seedSecurityLogs() {
        console.log('🔒 Seeding security logs...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.securityLogsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const logNumber = `SEC${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`;
                const securityLog = await models_1.SecurityLog.create({
                    companyId: company._id,
                    logId: logNumber,
                    logNumber: logNumber,
                    timestamp: faker_1.faker.date.past({ years: 0.5 }),
                    eventType: getRandomElement(['incident', 'patrol', 'cctv_event', 'access_event', 'alarm', 'maintenance', 'training', 'drill', 'visitor_management', 'vehicle_management', 'other']),
                    eventCategory: getRandomElement(['security', 'safety', 'operational', 'maintenance', 'compliance', 'emergency']),
                    priority: getRandomElement(['low', 'medium', 'high', 'critical', 'emergency']),
                    location: {
                        area: getRandomElement(['Main Gate', 'Factory Floor', 'Warehouse', 'Office Building', 'Parking']),
                        zone: getRandomElement(['Zone A', 'Zone B', 'Zone C']),
                        building: getRandomElement(['Building 1', 'Building 2', 'Main Building'])
                    },
                    description: faker_1.faker.lorem.paragraph(),
                    involvedPersons: [{
                            name: faker_1.faker.person.fullName(),
                            role: getRandomElement(['Employee', 'Visitor', 'Contractor', 'Security Guard']),
                            id: faker_1.faker.string.alphanumeric(10)
                        }],
                    actionTaken: faker_1.faker.lorem.sentence(),
                    status: getRandomElement(['open', 'in_progress', 'resolved', 'closed', 'escalated', 'cancelled']),
                    personnel: {
                        reportedBy: createdBy._id,
                        reporterName: createdBy.firstName + ' ' + createdBy.lastName,
                        reporterRole: createdBy.role,
                        assignedTo: getRandomElement(companyUsers)._id,
                        assigneeName: faker_1.faker.person.fullName()
                    },
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.securityLogs.push(securityLog);
            }
        }
        console.log(`✅ Created ${this.securityLogs.length} security logs`);
    }
    async seedAuditLogs() {
        console.log('📋 Seeding audit logs...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.auditLogsPerCompany; i++) {
                const user = getRandomElement(companyUsers);
                const auditLog = await models_1.AuditLog.create({
                    companyId: company._id,
                    eventId: `AUD${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    userId: user._id,
                    action: getRandomElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT']),
                    actionCategory: getRandomElement(['authentication', 'authorization', 'data_access', 'data_modification', 'system_configuration', 'user_management', 'financial_transaction', 'inventory_management', 'production_management', 'order_management']),
                    actionType: getRandomElement(['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject']),
                    resource: getRandomElement(['User', 'Customer', 'Order', 'Invoice', 'Product', 'Report']),
                    resourceId: faker_1.faker.database.mongodbObjectId(),
                    description: faker_1.faker.lorem.sentence(),
                    details: {
                        method: getRandomElement(['GET', 'POST', 'PUT', 'DELETE']),
                        endpoint: faker_1.faker.internet.url(),
                        userAgent: faker_1.faker.internet.userAgent(),
                        ipAddress: faker_1.faker.internet.ip(),
                        changes: {
                            before: { status: 'active' },
                            after: { status: 'inactive' }
                        }
                    },
                    timestamp: faker_1.faker.date.past({ years: 0.5 }),
                    success: faker_1.faker.datatype.boolean({ probability: 0.95 }),
                    errorMessage: Math.random() > 0.95 ? faker_1.faker.lorem.sentence() : undefined
                });
                this.auditLogs.push(auditLog);
            }
        }
        console.log(`✅ Created ${this.auditLogs.length} audit logs`);
    }
    async seedBusinessAnalytics() {
        console.log('📊 Seeding business analytics...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.businessAnalyticsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const analytics = await models_1.BusinessAnalytics.create({
                    companyId: company._id,
                    analyticsId: `ANA${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    analyticsName: `Monthly Business Report ${i + 1}`,
                    reportDate: faker_1.faker.date.past({ years: 1 }),
                    revenue: {
                        totalRevenue: faker_1.faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 }),
                        monthlyGrowth: faker_1.faker.number.float({ min: -10, max: 25, fractionDigits: 2 }),
                        yearlyGrowth: faker_1.faker.number.float({ min: -5, max: 40, fractionDigits: 2 })
                    },
                    orders: {
                        totalOrders: faker_1.faker.number.int({ min: 50, max: 500 }),
                        completedOrders: faker_1.faker.number.int({ min: 40, max: 450 }),
                        pendingOrders: faker_1.faker.number.int({ min: 5, max: 50 }),
                        cancelledOrders: faker_1.faker.number.int({ min: 0, max: 20 })
                    },
                    customers: {
                        totalCustomers: faker_1.faker.number.int({ min: 20, max: 200 }),
                        newCustomers: faker_1.faker.number.int({ min: 2, max: 20 }),
                        activeCustomers: faker_1.faker.number.int({ min: 15, max: 150 })
                    },
                    inventory: {
                        totalItems: faker_1.faker.number.int({ min: 100, max: 1000 }),
                        lowStockItems: faker_1.faker.number.int({ min: 5, max: 50 }),
                        outOfStockItems: faker_1.faker.number.int({ min: 0, max: 10 })
                    },
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.businessAnalytics.push(analytics);
            }
        }
        console.log(`✅ Created ${this.businessAnalytics.length} business analytics`);
    }
    async seedMonitoringData() {
        console.log('⚡ Seeding monitoring data...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.boilerMonitoringPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                await models_1.BoilerMonitoring.create({
                    companyId: company._id,
                    boilerId: `BOILER${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    boilerNumber: `B${i.toString().padStart(3, '0')}`,
                    boilerName: `Boiler Unit ${i + 1}`,
                    location: getRandomElement(['Factory Floor A', 'Factory Floor B', 'Power Plant', 'Utility Building']),
                    specifications: {
                        capacity: faker_1.faker.number.int({ min: 1000, max: 10000 }),
                        workingPressure: faker_1.faker.number.float({ min: 8, max: 15, fractionDigits: 1 }),
                        maxPressure: faker_1.faker.number.float({ min: 10, max: 20, fractionDigits: 1 }),
                        maxTemperature: faker_1.faker.number.int({ min: 150, max: 200 }),
                        boilerType: getRandomElement(['fire_tube', 'water_tube', 'electric', 'waste_heat']),
                        serialNumber: faker_1.faker.string.alphanumeric(12),
                        yearOfManufacture: faker_1.faker.number.int({ min: 2010, max: 2024 }),
                        model: faker_1.faker.string.alphanumeric(8),
                        manufacturer: getRandomElement(['Thermax', 'Forbes Marshall', 'Bosch', 'Cochran']),
                        fuelType: getRandomElement(['coal', 'gas', 'oil', 'biomass', 'electric'])
                    },
                    timestamp: faker_1.faker.date.past({ years: 0.5 }),
                    temperature: faker_1.faker.number.float({ min: 80, max: 150, fractionDigits: 1 }),
                    pressure: faker_1.faker.number.float({ min: 5, max: 15, fractionDigits: 2 }),
                    waterLevel: faker_1.faker.number.float({ min: 30, max: 90, fractionDigits: 1 }),
                    fuelConsumption: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
                    status: getRandomElement(['Normal', 'Warning', 'Critical', 'Maintenance']),
                    efficiency: faker_1.faker.number.float({ min: 75, max: 95, fractionDigits: 1 }),
                    alerts: Math.random() > 0.8 ? [{
                            alertTime: faker_1.faker.date.recent(),
                            alertType: getRandomElement(['temperature_high', 'temperature_low', 'pressure_high', 'pressure_low', 'water_level_low', 'water_level_high', 'efficiency_low', 'fuel_consumption_high', 'emission_high', 'maintenance_due', 'safety_violation', 'equipment_failure']),
                            severity: getRandomElement(['low', 'medium', 'high', 'critical', 'emergency']),
                            parameter: getRandomElement(['temperature', 'pressure', 'water_level', 'efficiency', 'fuel_consumption']),
                            currentValue: faker_1.faker.number.float({ min: 50, max: 200, fractionDigits: 2 }),
                            thresholdValue: faker_1.faker.number.float({ min: 80, max: 150, fractionDigits: 2 }),
                            unit: getRandomElement(['°C', 'bar', '%', 'kg/hr']),
                            description: faker_1.faker.lorem.sentence(),
                            status: getRandomElement(['active', 'acknowledged', 'resolved'])
                        }] : [],
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
            }
            for (let i = 0; i < SEED_CONFIG.electricityMonitoringPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                await models_1.ElectricityMonitoring.create({
                    companyId: company._id,
                    monitoringId: `ELEC${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    monitoringName: `Electricity Monitor ${i + 1}`,
                    meterId: `METER${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    location: getRandomElement(['Main Panel', 'Factory Floor A', 'Factory Floor B', 'Office Building', 'Warehouse']),
                    systemDetails: {
                        connectionType: getRandomElement(['3_phase_4_wire', '3_phase_3_wire', '1_phase_2_wire']),
                        ratedVoltage: faker_1.faker.number.int({ min: 220, max: 440 }),
                        ratedCurrent: faker_1.faker.number.int({ min: 50, max: 200 }),
                        ratedPower: faker_1.faker.number.int({ min: 10, max: 100 }),
                        panelType: getRandomElement(['main', 'sub', 'distribution', 'control'])
                    },
                    meteringEquipment: {
                        meterType: getRandomElement(['analog', 'digital', 'smart', 'ct_pt']),
                        meterMake: getRandomElement(['Schneider', 'ABB', 'Siemens', 'L&T']),
                        meterModel: faker_1.faker.string.alphanumeric(8),
                        meterSerialNumber: faker_1.faker.string.alphanumeric(12),
                        installationDate: faker_1.faker.date.past({ years: 2 })
                    },
                    tariffStructure: {
                        tariffType: getRandomElement(['flat', 'tod', 'seasonal', 'demand']),
                        energyRate: faker_1.faker.number.float({ min: 3, max: 8, fractionDigits: 2 })
                    },
                    timestamp: faker_1.faker.date.past({ years: 0.5 }),
                    voltage: faker_1.faker.number.float({ min: 220, max: 240, fractionDigits: 1 }),
                    current: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
                    power: faker_1.faker.number.float({ min: 1000, max: 10000, fractionDigits: 0 }),
                    energy: faker_1.faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
                    powerFactor: faker_1.faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 3 }),
                    frequency: faker_1.faker.number.float({ min: 49.5, max: 50.5, fractionDigits: 2 }),
                    cost: faker_1.faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
            }
        }
        console.log(`✅ Created monitoring data for all companies`);
    }
    async seedHospitality() {
        console.log('🏨 Seeding hospitality data...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.hospitalityPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const hospitality = await models_1.Hospitality.create({
                    companyId: company._id,
                    facilityId: `FAC${company._id.toString().slice(-4)}${i.toString().padStart(3, '0')}`,
                    facilityName: `Hotel ${faker_1.faker.company.name()}`,
                    facilityType: getRandomElement(['hotel', 'guest_house', 'resort', 'lodge', 'hostel', 'service_apartment']),
                    address: {
                        addressLine1: faker_1.faker.location.streetAddress(),
                        city: faker_1.faker.location.city(),
                        state: faker_1.faker.location.state(),
                        country: 'India',
                        pincode: faker_1.faker.location.zipCode()
                    },
                    contactInfo: {
                        primaryPhone: `+91${faker_1.faker.string.numeric(10)}`,
                        email: faker_1.faker.internet.email(),
                        website: faker_1.faker.internet.url()
                    },
                    facilityDetails: {
                        totalRooms: faker_1.faker.number.int({ min: 10, max: 100 }),
                        totalFloors: faker_1.faker.number.int({ min: 2, max: 10 }),
                        maxCapacity: faker_1.faker.number.int({ min: 20, max: 200 }),
                        checkInTime: '14:00',
                        checkOutTime: '12:00'
                    },
                    bookingId: `BOOK${faker_1.faker.number.int({ min: 10000, max: 99999 })}`,
                    guestInfo: {
                        name: faker_1.faker.person.fullName(),
                        phone: `+91${faker_1.faker.string.numeric(10)}`,
                        email: faker_1.faker.internet.email(),
                        company: faker_1.faker.company.name(),
                        designation: faker_1.faker.person.jobTitle()
                    },
                    roomInfo: {
                        roomNumber: `R${faker_1.faker.number.int({ min: 101, max: 350 })}`,
                        roomType: getRandomElement(['Single', 'Double', 'Suite', 'Conference Room']),
                        capacity: faker_1.faker.number.int({ min: 1, max: 8 }),
                        amenities: getRandomElements(['AC', 'WiFi', 'TV', 'Minibar', 'Balcony'], faker_1.faker.number.int({ min: 2, max: 5 }))
                    },
                    bookingDates: {
                        checkIn: faker_1.faker.date.past({ years: 0.5 }),
                        checkOut: faker_1.faker.date.future({ years: 0.1 }),
                        duration: faker_1.faker.number.int({ min: 1, max: 7 })
                    },
                    services: [{
                            serviceDate: faker_1.faker.date.recent(),
                            serviceType: getRandomElement(['room_service', 'laundry', 'spa', 'restaurant', 'bar', 'transport', 'conference', 'other']),
                            serviceName: getRandomElement(['Room Service', 'Breakfast', 'Airport Transfer', 'Laundry', 'Conference Hall']),
                            description: faker_1.faker.lorem.sentence(),
                            quantity: faker_1.faker.number.int({ min: 1, max: 5 }),
                            unitPrice: faker_1.faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
                            totalPrice: faker_1.faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
                            status: getRandomElement(['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'])
                        }],
                    billing: {
                        roomCharges: faker_1.faker.number.float({ min: 2000, max: 8000, fractionDigits: 2 }),
                        serviceCharges: faker_1.faker.number.float({ min: 500, max: 2000, fractionDigits: 2 }),
                        taxes: faker_1.faker.number.float({ min: 300, max: 1200, fractionDigits: 2 }),
                        totalAmount: faker_1.faker.number.float({ min: 2800, max: 11200, fractionDigits: 2 })
                    },
                    status: getRandomElement(['Booked', 'Checked In', 'Checked Out', 'Cancelled']),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.hospitality.push(hospitality);
            }
        }
        console.log(`✅ Created ${this.hospitality.length} hospitality records`);
    }
    async seedDispatches() {
        console.log('🚚 Seeding dispatches...');
        for (const company of this.companies) {
            const companyCustomers = this.customers.filter(c => c.companyId.toString() === company._id.toString());
            const companyWarehouses = this.warehouses.filter(w => w.companyId.toString() === company._id.toString());
            const companyItems = this.inventoryItems.filter(i => i.companyId.toString() === company._id.toString());
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.dispatchesPerCompany; i++) {
                const customer = getRandomElement(companyCustomers);
                const warehouse = getRandomElement(companyWarehouses);
                const createdBy = getRandomElement(companyUsers);
                const items = getRandomElements(companyItems, faker_1.faker.number.int({ min: 1, max: 3 }));
                const dispatch = await models_1.Dispatch.create({
                    companyId: company._id,
                    dispatchNumber: `DISP${faker_1.faker.number.int({ min: 10000, max: 99999 })}`,
                    customerId: customer._id,
                    dispatchDate: faker_1.faker.date.past({ years: 0.5 }),
                    dispatchType: getRandomElement(['sales', 'transfer', 'return', 'sample', 'replacement', 'warranty', 'loan']),
                    source: {
                        warehouseId: warehouse._id,
                        warehouseName: warehouse.warehouseName,
                        address: warehouse.address,
                        contactPerson: warehouse.contactPerson || faker_1.faker.person.fullName(),
                        contactPhone: warehouse.contactPhone || `+91${faker_1.faker.string.numeric(10)}`
                    },
                    items: items.map(item => ({
                        itemId: item._id,
                        itemCode: item.itemCode,
                        itemName: item.itemName,
                        description: item.itemDescription,
                        quantity: faker_1.faker.number.int({ min: 1, max: 50 }),
                        unit: item.unit || 'pcs',
                        weight: faker_1.faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
                        value: faker_1.faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
                        packingType: getRandomElement(['box', 'carton', 'pallet', 'bag', 'drum', 'loose']),
                        packingDetails: {
                            packagesCount: faker_1.faker.number.int({ min: 1, max: 10 }),
                            totalWeight: faker_1.faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
                            dimensions: {
                                length: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 1 }),
                                width: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 1 }),
                                height: faker_1.faker.number.float({ min: 10, max: 100, fractionDigits: 1 })
                            }
                        },
                        batchNumber: faker_1.faker.string.alphanumeric(8),
                        serialNumbers: []
                    })),
                    vehicleInfo: {
                        vehicleNumber: faker_1.faker.vehicle.vrm(),
                        driverName: faker_1.faker.person.fullName(),
                        driverPhone: `+91${faker_1.faker.string.numeric(10)}`
                    },
                    destination: {
                        destinationType: 'customer',
                        destinationId: customer._id,
                        destinationName: customer.customerName,
                        address: {
                            addressLine1: faker_1.faker.location.streetAddress(),
                            city: faker_1.faker.location.city(),
                            state: faker_1.faker.location.state(),
                            country: 'India',
                            pincode: faker_1.faker.location.zipCode()
                        },
                        contactPerson: customer.contactPerson || faker_1.faker.person.fullName(),
                        contactPhone: customer.phone || `+91${faker_1.faker.string.numeric(10)}`
                    },
                    packingDetails: {
                        totalPackages: faker_1.faker.number.int({ min: 1, max: 10 }),
                        packingMethod: getRandomElement(['standard', 'export', 'fragile', 'hazardous']),
                        packingCost: faker_1.faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
                        packedBy: createdBy.firstName + ' ' + createdBy.lastName,
                        packedAt: faker_1.faker.date.recent()
                    },
                    financials: {
                        goodsValue: faker_1.faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
                        freightCharges: faker_1.faker.number.float({ min: 100, max: 2000, fractionDigits: 2 }),
                        packingCharges: faker_1.faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
                        totalCharges: faker_1.faker.number.float({ min: 1200, max: 55000, fractionDigits: 2 })
                    },
                    status: getRandomElement(['draft', 'ready_to_dispatch', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'partially_delivered', 'failed_delivery', 'returned', 'cancelled']),
                    tracking: [{
                            trackingDateTime: faker_1.faker.date.recent(),
                            status: getRandomElement(['dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'returned']),
                            location: faker_1.faker.location.city(),
                            description: faker_1.faker.lorem.sentence(),
                            updatedBy: createdBy._id.toString()
                        }],
                    currentLocation: faker_1.faker.location.city(),
                    estimatedDelivery: faker_1.faker.date.future({ years: 0.1 }),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.dispatches.push(dispatch);
            }
        }
        console.log(`✅ Created ${this.dispatches.length} dispatches`);
    }
    async seedReports() {
        console.log('📄 Seeding reports...');
        for (const company of this.companies) {
            const companyUsers = this.users.filter(u => u.companyAccess.some((ca) => ca.companyId.toString() === company._id.toString()));
            for (let i = 0; i < SEED_CONFIG.reportsPerCompany; i++) {
                const createdBy = getRandomElement(companyUsers);
                const reportId = `RPT${faker_1.faker.number.int({ min: 10000, max: 99999 })}`;
                const report = await models_1.Report.create({
                    companyId: company._id,
                    reportId: reportId,
                    reportCode: reportId,
                    reportName: faker_1.faker.lorem.words(4),
                    title: faker_1.faker.lorem.words(4),
                    category: getRandomElement(['financial', 'operational', 'sales', 'purchase', 'inventory', 'production', 'hr', 'quality', 'security', 'analytics', 'compliance', 'custom']),
                    reportType: getRandomElement(['tabular', 'summary', 'detailed', 'dashboard', 'chart', 'pivot', 'matrix', 'subreport']),
                    dataSource: {
                        sourceType: getRandomElement(['database', 'api', 'file', 'multiple']),
                        primarySource: 'database',
                        connectionString: 'mongodb://localhost:27017/erp',
                        query: 'db.collection.find({})',
                        queryType: 'mongodb'
                    },
                    parameters: [{
                            parameterName: 'dateRange',
                            parameterType: 'daterange',
                            displayName: 'Date Range',
                            description: 'Select the date range for the report',
                            isRequired: true,
                            defaultValue: {
                                from: faker_1.faker.date.past({ years: 1 }),
                                to: faker_1.faker.date.recent()
                            }
                        }, {
                            parameterName: 'department',
                            parameterType: 'select',
                            displayName: 'Department',
                            description: 'Filter by department',
                            isRequired: false,
                            validationRules: {
                                allowedValues: ['All', 'Production', 'Sales', 'Finance']
                            },
                            defaultValue: 'All'
                        }],
                    data: {
                        summary: {
                            totalRecords: faker_1.faker.number.int({ min: 100, max: 1000 }),
                            totalValue: faker_1.faker.number.float({ min: 10000, max: 100000, fractionDigits: 2 })
                        },
                        details: []
                    },
                    format: getRandomElement(['PDF', 'Excel', 'CSV']),
                    status: getRandomElement(['draft', 'testing', 'approved', 'published', 'deprecated', 'archived']),
                    executions: [],
                    schedules: [],
                    generatedAt: faker_1.faker.date.recent(),
                    fileSize: faker_1.faker.number.int({ min: 100, max: 5000 }),
                    downloadCount: faker_1.faker.number.int({ min: 0, max: 50 }),
                    createdBy: createdBy._id,
                    updatedBy: createdBy._id
                });
                this.reports.push(report);
            }
        }
        console.log(`✅ Created ${this.reports.length} reports`);
    }
    async run() {
        try {
            await this.connect();
            await this.clearDatabase();
            await this.seedCompanies();
            await this.seedUsers();
            await this.seedRoles();
            await this.seedCustomers();
            await this.seedSuppliers();
            await this.seedWarehouses();
            await this.seedInventoryItems();
            await this.seedProductionOrders();
            await this.seedCustomerOrders();
            await this.seedPurchaseOrders();
            await this.seedInvoices();
            await this.seedQuotations();
            await this.seedFinancialTransactions();
            await this.seedVisitors();
            await this.seedSecurityLogs();
            await this.seedAuditLogs();
            await this.seedBusinessAnalytics();
            await this.seedMonitoringData();
            await this.seedHospitality();
            await this.seedDispatches();
            console.log('🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
            console.log(`📊 COMPLETE SEEDING SUMMARY:`);
            console.log(`   🏢 Companies: ${this.companies.length}`);
            console.log(`   👤 Users: ${this.users.length}`);
            console.log(`   👥 Roles: ${this.roles.length}`);
            console.log(`   🤝 Customers: ${this.customers.length}`);
            console.log(`   🏭 Suppliers: ${this.suppliers.length}`);
            console.log(`   🏪 Warehouses: ${this.warehouses.length}`);
            console.log(`   📦 Inventory Items: ${this.inventoryItems.length}`);
            console.log(`   🏭 Production Orders: ${this.productionOrders.length}`);
            console.log(`   🛒 Customer Orders: ${this.customerOrders.length}`);
            console.log(`   🛍️ Purchase Orders: ${this.purchaseOrders.length}`);
            console.log(`   🧾 Invoices: ${this.invoices.length}`);
            console.log(`   💰 Quotations: ${this.quotations.length}`);
            console.log(`   💳 Financial Transactions: ${this.financialTransactions.length}`);
            console.log(`   👥 Visitors: ${this.visitors.length}`);
            console.log(`   🚗 Vehicles: ${this.vehicles.length}`);
            console.log(`   🔒 Security Logs: ${this.securityLogs.length}`);
            console.log(`   📋 Audit Logs: ${this.auditLogs.length}`);
            console.log(`   📊 Business Analytics: ${this.businessAnalytics.length}`);
            console.log(`   ⚡ Monitoring Records: ${(SEED_CONFIG.boilerMonitoringPerCompany + SEED_CONFIG.electricityMonitoringPerCompany) * this.companies.length}`);
            console.log(`   🏨 Hospitality Records: ${this.hospitality.length}`);
            console.log(`   🚚 Dispatches: ${this.dispatches.length}`);
            console.log(`   📄 Reports: ${this.reports.length}`);
            const totalRecords = this.companies.length + this.users.length + this.roles.length +
                this.customers.length + this.suppliers.length + this.warehouses.length +
                this.inventoryItems.length + this.productionOrders.length +
                this.customerOrders.length + this.purchaseOrders.length +
                this.invoices.length + this.quotations.length +
                this.financialTransactions.length + this.visitors.length +
                this.vehicles.length + this.securityLogs.length +
                this.auditLogs.length + this.businessAnalytics.length +
                ((SEED_CONFIG.boilerMonitoringPerCompany + SEED_CONFIG.electricityMonitoringPerCompany) * this.companies.length) +
                this.hospitality.length + this.dispatches.length + this.reports.length;
            console.log(`\n🎯 TOTAL RECORDS: ${totalRecords}`);
            console.log(`💾 Database: FULLY POPULATED with realistic factory ERP data across ALL MODELS!`);
            console.log(`🚀 Ready for production use with complete business workflows!`);
        }
        catch (error) {
            console.error('❌ Seeding failed:', error);
        }
        finally {
            await mongoose_1.default.disconnect();
            console.log('🔌 Disconnected from MongoDB');
        }
    }
}
if (require.main === module) {
    const seed = new SimpleSeed();
    seed.run();
}
exports.default = SimpleSeed;
//# sourceMappingURL=simple-seed.js.map