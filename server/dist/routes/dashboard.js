"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(auth_1.requireCompany);
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        let stats = {};
        if (isSuperAdmin) {
            const totalCompanies = await Company_1.default.countDocuments({ isActive: true });
            const totalUsers = await User_1.default.countDocuments({ isActive: true });
            const activeCompanies = await Company_1.default.countDocuments({
                isActive: true,
                status: 'active'
            });
            stats = {
                totalCompanies,
                totalUsers,
                activeCompanies,
                systemHealth: 98,
                totalRevenue: 0,
                pendingApprovals: 0,
                securityAlerts: 0,
                systemUptime: '99.9%'
            };
        }
        else {
            const companyUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': companyId,
                'companyAccess.isActive': true,
                isActive: true
            });
            const userAccess = user.companyAccess?.find((access) => access.companyId.toString() === companyId && access.isActive);
            stats = {
                totalEmployees: companyUsers,
                totalOrders: 0,
                totalRevenue: 0,
                totalCustomers: 0,
                totalProducts: 0,
                totalProduction: 0,
                totalInventory: 0,
                totalSuppliers: 0,
                pendingOrders: 0,
                completedOrders: 0,
                lowStockItems: 0,
                activeProduction: 0,
                monthlyRevenue: 0,
                outstandingPayments: 0,
                profitMargin: 0
            };
            if (userAccess?.permissions?.production?.view) {
                stats.activeProductionLines = 0;
                stats.todayProduction = 0;
                stats.qualityChecksPending = 0;
            }
            if (userAccess?.permissions?.inventory?.view) {
                stats.lowStockAlerts = 0;
                stats.inventoryValue = 0;
                stats.stockMovements = 0;
            }
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard stats',
            message: 'An error occurred while fetching dashboard statistics'
        });
    }
});
router.get('/activities', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        const limit = parseInt(req.query.limit) || 10;
        let activities = [];
        if (isSuperAdmin) {
            const recentUsers = await User_1.default.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('username createdAt');
            const recentCompanies = await Company_1.default.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('companyName createdAt');
            recentUsers.forEach((newUser) => {
                activities.push({
                    id: `user-${newUser._id}`,
                    type: 'user',
                    title: 'New User Registered',
                    description: `User ${newUser.username} joined the system`,
                    timestamp: newUser.createdAt.toISOString(),
                    user: 'System',
                    status: 'success'
                });
            });
            recentCompanies.forEach((company) => {
                activities.push({
                    id: `company-${company._id}`,
                    type: 'system',
                    title: 'New Company Registered',
                    description: `${company.companyName} registered in the system`,
                    timestamp: company.createdAt.toISOString(),
                    user: 'System Admin',
                    status: 'info'
                });
            });
        }
        else {
            const recentCompanyUsers = await User_1.default.find({
                'companyAccess.companyId': companyId,
                'companyAccess.isActive': true,
                isActive: true
            })
                .sort({ 'companyAccess.joinedAt': -1 })
                .limit(5)
                .select('username companyAccess');
            recentCompanyUsers.forEach((newUser) => {
                const companyAccess = newUser.companyAccess?.find((access) => access.companyId.toString() === companyId);
                if (companyAccess) {
                    activities.push({
                        id: `company-user-${newUser._id}`,
                        type: 'user',
                        title: 'New Team Member',
                        description: `${newUser.username} joined as ${companyAccess.role}`,
                        timestamp: companyAccess.joinedAt?.toISOString() || new Date().toISOString(),
                        user: 'HR Team',
                        status: 'success'
                    });
                }
            });
        }
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        res.json({
            success: true,
            data: activities.slice(0, limit)
        });
    }
    catch (error) {
        console.error('Dashboard activities error:', error);
        res.status(500).json({
            error: 'Failed to fetch activities',
            message: 'An error occurred while fetching recent activities'
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        console.log('Dashboard request - User:', user ? { id: user.userId, username: user.username, isSuperAdmin: user.isSuperAdmin } : 'No user');
        if (!user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access dashboard'
            });
        }
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        let stats = {};
        if (isSuperAdmin) {
            const totalCompanies = await Company_1.default.countDocuments({ isActive: true });
            const totalUsers = await User_1.default.countDocuments({ isActive: true });
            const activeUsers = await User_1.default.countDocuments({
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const companiesWithUsers = await Company_1.default.aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: 'users',
                        let: { companyId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$isActive', true] },
                                            {
                                                $anyElementTrue: {
                                                    $map: {
                                                        input: '$companyAccess',
                                                        as: 'access',
                                                        in: {
                                                            $and: [
                                                                { $eq: ['$$access.companyId', '$$companyId'] },
                                                                { $eq: ['$$access.isActive', true] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'users'
                    }
                },
                {
                    $addFields: {
                        userCount: { $size: '$users' },
                        activeUserCount: {
                            $size: {
                                $filter: {
                                    input: '$users',
                                    cond: {
                                        $gte: ['$$this.lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
                                    }
                                }
                            }
                        }
                    }
                }
            ]);
            const avgUsersPerCompany = totalCompanies > 0 ? Math.round(totalUsers / totalCompanies) : 0;
            const systemHealth = Math.round(95 + Math.random() * 5);
            stats = {
                totalCompanies,
                totalUsers,
                activeUsers,
                totalEmployees: totalUsers,
                avgUsersPerCompany,
                systemHealth,
                totalOrders: Math.floor(totalUsers * 2.5),
                totalRevenue: Math.floor(totalUsers * 15000),
                monthlyRevenue: Math.floor(totalUsers * 1250),
                outstandingPayments: Math.floor(totalUsers * 500),
                profitMargin: 18.5,
                companiesWithUsers: companiesWithUsers.length
            };
        }
        else {
            const companyUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': companyId,
                'companyAccess.isActive': true,
                isActive: true
            });
            const activeCompanyUsers = await User_1.default.countDocuments({
                'companyAccess.companyId': companyId,
                'companyAccess.isActive': true,
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const company = await Company_1.default.findById(companyId);
            const companyAge = company ? Math.floor((Date.now() - company.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            stats = {
                totalEmployees: companyUsers,
                activeUsers: activeCompanyUsers,
                companyAge,
                totalOrders: Math.floor(companyUsers * 3.2),
                totalRevenue: Math.floor(companyUsers * 18000),
                monthlyRevenue: Math.floor(companyUsers * 1500),
                outstandingPayments: Math.floor(companyUsers * 600),
                profitMargin: 15.8 + Math.random() * 5,
                totalCustomers: Math.floor(companyUsers * 4.5),
                totalProducts: Math.floor(companyUsers * 2.1),
                totalProduction: Math.floor(companyUsers * 125),
                totalInventory: Math.floor(companyUsers * 85),
                productionEfficiency: 92 + Math.random() * 6,
                qualityScore: 96 + Math.random() * 3,
                inventoryTurnover: 8.5 + Math.random() * 2
            };
        }
        const recentActivities = await User_1.default.find({
            ...(isSuperAdmin ? {} : { 'companyAccess.companyId': companyId }),
            isActive: true
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username createdAt companyAccess');
        const activities = recentActivities.map((newUser) => ({
            id: `user-${newUser._id}`,
            type: 'user',
            title: 'New User Joined',
            description: `${newUser.username} joined the ${isSuperAdmin ? 'system' : 'company'}`,
            timestamp: newUser.createdAt.toISOString(),
            user: 'System',
            status: 'success'
        }));
        const userAccess = user.companyAccess?.find((access) => access.companyId.toString() === companyId && access.isActive);
        const permissions = {
            canViewFinancials: isSuperAdmin || userAccess?.permissions?.financial?.view || false,
            canViewProduction: isSuperAdmin || userAccess?.permissions?.production?.view || false,
            canViewInventory: isSuperAdmin || userAccess?.permissions?.inventory?.view || false,
            canViewOrders: isSuperAdmin || userAccess?.permissions?.orders?.view || false,
            canViewUsers: isSuperAdmin || userAccess?.permissions?.users?.view || false,
            canViewReports: isSuperAdmin || userAccess?.permissions?.financial?.viewReports || false
        };
        res.json({
            success: true,
            data: {
                stats,
                recentActivities: activities,
                permissions,
                user: {
                    name: user.personalInfo?.firstName || user.username || 'User',
                    role: isSuperAdmin ? 'super_admin' : userAccess?.role || 'user',
                    isSuperAdmin
                }
            }
        });
    }
    catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard data',
            message: 'An error occurred while fetching dashboard overview'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map