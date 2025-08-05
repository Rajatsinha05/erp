"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Company_1 = __importDefault(require("../models/Company"));
const database_1 = __importDefault(require("../config/database"));
async function seedUserCompanies() {
    try {
        console.log('🚀 Starting user company seeding...');
        await database_1.default.connect();
        console.log('✅ Database connected');
        const companies = await Company_1.default.find({ isActive: true });
        console.log(`📊 Found ${companies.length} active companies`);
        if (companies.length === 0) {
            console.log('❌ No companies found. Please create companies first.');
            return;
        }
        const users = await User_1.default.find({});
        console.log(`👥 Found ${users.length} users to update`);
        let updatedCount = 0;
        let superAdminCount = 0;
        for (const user of users) {
            console.log(`\n🔄 Processing user: ${user.username} (${user.email})`);
            if (user.isSuperAdmin) {
                console.log(`👑 Super Admin detected: ${user.username}`);
                const companyAccess = companies.map(company => ({
                    companyId: company._id,
                    role: 'super_admin',
                    isActive: true,
                    permissions: {
                        inventory: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: true,
                            approve: true,
                            viewReports: true
                        },
                        production: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: true,
                            approve: true,
                            viewReports: true
                        },
                        orders: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: true,
                            approve: true,
                            viewReports: true
                        },
                        financial: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: true,
                            approve: true,
                            viewReports: true
                        },
                        security: {
                            gateManagement: true,
                            visitorManagement: true,
                            vehicleTracking: true,
                            cctvAccess: true,
                            emergencyResponse: true,
                            securityReports: true,
                            incidentManagement: true,
                            accessControl: true,
                            patrolManagement: true
                        },
                        hr: {
                            viewEmployees: true,
                            manageEmployees: true,
                            manageAttendance: true,
                            manageSalary: true,
                            manageLeaves: true,
                            viewReports: true,
                            recruitment: true,
                            performance: true,
                            training: true,
                            disciplinary: true
                        },
                        admin: {
                            userManagement: true,
                            systemSettings: true,
                            backupRestore: true,
                            auditLogs: true
                        }
                    },
                    joinedAt: new Date()
                }));
                user.primaryCompanyId = companies[0]._id;
                user.companyAccess = companyAccess;
                await user.save();
                superAdminCount++;
                console.log(`✅ Super Admin updated with access to ${companies.length} companies`);
            }
            else {
                console.log(`👤 Regular user detected: ${user.username}`);
                if (user.companyAccess && user.companyAccess.length > 0) {
                    console.log(`ℹ️  User already has company access, skipping...`);
                    continue;
                }
                const defaultCompany = companies[0];
                const companyAccess = [{
                        companyId: defaultCompany._id,
                        role: 'operator',
                        isActive: true,
                        permissions: {
                            inventory: {
                                view: true,
                                create: false,
                                edit: false,
                                delete: false,
                                approve: false,
                                viewReports: false
                            },
                            production: {
                                view: true,
                                create: true,
                                edit: true,
                                delete: false,
                                approve: false,
                                viewReports: false
                            },
                            orders: {
                                view: true,
                                create: false,
                                edit: false,
                                delete: false,
                                approve: false,
                                viewReports: false
                            },
                            financial: {
                                view: false,
                                create: false,
                                edit: false,
                                delete: false,
                                approve: false,
                                viewReports: false
                            },
                            security: {
                                gateManagement: false,
                                visitorManagement: true,
                                vehicleTracking: false,
                                cctvAccess: false,
                                emergencyResponse: false,
                                securityReports: false,
                                incidentManagement: false,
                                accessControl: false,
                                patrolManagement: false
                            },
                            hr: {
                                viewEmployees: false,
                                manageEmployees: false,
                                manageAttendance: false,
                                manageSalary: false,
                                manageLeaves: false,
                                viewReports: false,
                                recruitment: false,
                                performance: false,
                                training: false,
                                disciplinary: false
                            },
                            admin: {
                                userManagement: false,
                                systemSettings: false,
                                backupRestore: false,
                                auditLogs: false
                            }
                        },
                        joinedAt: new Date()
                    }];
                user.primaryCompanyId = defaultCompany._id;
                user.companyAccess = companyAccess;
                await user.save();
                updatedCount++;
                console.log(`✅ Regular user updated with access to: ${defaultCompany.companyName}`);
            }
        }
        console.log('\n🎉 Seeding completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Super Admins updated: ${superAdminCount}`);
        console.log(`   - Regular users updated: ${updatedCount}`);
        console.log(`   - Total users processed: ${users.length}`);
    }
    catch (error) {
        console.error('❌ Error seeding user companies:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('🔌 Database disconnected');
    }
}
if (require.main === module) {
    seedUserCompanies();
}
exports.default = seedUserCompanies;
//# sourceMappingURL=seedUserCompanies.js.map