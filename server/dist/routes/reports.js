"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const User_1 = __importDefault(require("@/models/User"));
const Company_1 = __importDefault(require("@/models/Company"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(auth_1.requireCompany);
router.get('/user-analytics', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        let userAnalytics = {};
        if (isSuperAdmin) {
            const totalUsers = await User_1.default.countDocuments({ isActive: true });
            const activeUsers = await User_1.default.countDocuments({
                isActive: true,
                lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const userTrends = await User_1.default.aggregate([
                {
                    $match: {
                        isActive: true,
                        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);
            const usersByCompany = await User_1.default.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $unwind: '$companyAccess'
                },
                {
                    $match: { 'companyAccess.isActive': true }
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companyAccess.companyId',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {
                    $unwind: '$company'
                },
                {
                    $group: {
                        _id: '$company.companyName',
                        userCount: { $sum: 1 },
                        roles: { $push: '$companyAccess.role' }
                    }
                },
                {
                    $sort: { userCount: -1 }
                }
            ]);
            userAnalytics = {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                userTrends: userTrends.map(trend => ({
                    month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
                    users: trend.count
                })),
                usersByCompany
            };
        }
        else {
            const companyUsers = await User_1.default.find({
                'companyAccess.companyId': companyId,
                'companyAccess.isActive': true,
                isActive: true
            }).populate('companyAccess.companyId', 'companyName');
            const totalCompanyUsers = companyUsers.length;
            const activeCompanyUsers = companyUsers.filter(u => u.security?.lastLogin && u.security.lastLogin >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
            const roleDistribution = companyUsers.reduce((acc, user) => {
                const userAccess = user.companyAccess?.find((access) => access.companyId.toString() === companyId && access.isActive);
                if (userAccess) {
                    acc[userAccess.role] = (acc[userAccess.role] || 0) + 1;
                }
                return acc;
            }, {});
            const userActivityTrends = await User_1.default.aggregate([
                {
                    $match: {
                        'companyAccess.companyId': new mongoose_1.default.Types.ObjectId(companyId),
                        'companyAccess.isActive': true,
                        isActive: true,
                        lastLoginAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$lastLoginAt' },
                            month: { $month: '$lastLoginAt' },
                            day: { $dayOfMonth: '$lastLoginAt' }
                        },
                        activeUsers: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
                }
            ]);
            userAnalytics = {
                totalUsers: totalCompanyUsers,
                activeUsers: activeCompanyUsers,
                inactiveUsers: totalCompanyUsers - activeCompanyUsers,
                roleDistribution,
                activityTrends: userActivityTrends.map(trend => ({
                    date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
                    activeUsers: trend.activeUsers
                }))
            };
        }
        res.json({
            success: true,
            data: userAnalytics
        });
    }
    catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch user analytics',
            message: 'An error occurred while generating user analytics report'
        });
    }
});
router.get('/company-performance', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        if (!isSuperAdmin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only super admins can access company performance reports'
            });
        }
        const companyPerformance = await Company_1.default.aggregate([
            {
                $match: { isActive: true }
            },
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
                    activeUsers: {
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
            },
            {
                $project: {
                    companyName: 1,
                    companyCode: 1,
                    industry: 1,
                    status: 1,
                    createdAt: 1,
                    userCount: 1,
                    activeUsers: 1,
                    inactiveUsers: { $subtract: ['$userCount', '$activeUsers'] }
                }
            },
            {
                $sort: { userCount: -1 }
            }
        ]);
        const companyGrowthTrends = await Company_1.default.aggregate([
            {
                $match: {
                    isActive: true,
                    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    newCompanies: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);
        res.json({
            success: true,
            data: {
                companyPerformance,
                growthTrends: companyGrowthTrends.map(trend => ({
                    month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
                    newCompanies: trend.newCompanies
                })),
                totalCompanies: companyPerformance.length,
                totalUsers: companyPerformance.reduce((sum, company) => sum + company.userCount, 0),
                averageUsersPerCompany: Math.round(companyPerformance.reduce((sum, company) => sum + company.userCount, 0) / companyPerformance.length)
            }
        });
    }
    catch (error) {
        console.error('Company performance error:', error);
        res.status(500).json({
            error: 'Failed to fetch company performance',
            message: 'An error occurred while generating company performance report'
        });
    }
});
router.get('/system-health', async (req, res) => {
    try {
        const user = req.user;
        const isSuperAdmin = user.isSuperAdmin;
        if (!isSuperAdmin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only super admins can access system health reports'
            });
        }
        const dbStats = await mongoose_1.default.connection.db.stats();
        const userMetrics = await User_1.default.aggregate([
            {
                $facet: {
                    totalUsers: [{ $match: { isActive: true } }, { $count: 'count' }],
                    activeUsers: [
                        {
                            $match: {
                                isActive: true,
                                lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                            }
                        },
                        { $count: 'count' }
                    ],
                    newUsersToday: [
                        {
                            $match: {
                                isActive: true,
                                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                            }
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ]);
        const systemHealth = {
            database: {
                status: 'healthy',
                collections: dbStats.collections,
                dataSize: Math.round(dbStats.dataSize / 1024 / 1024),
                storageSize: Math.round(dbStats.storageSize / 1024 / 1024),
                indexes: dbStats.indexes
            },
            users: {
                total: userMetrics[0].totalUsers[0]?.count || 0,
                activeToday: userMetrics[0].activeUsers[0]?.count || 0,
                newToday: userMetrics[0].newUsersToday[0]?.count || 0
            },
            system: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            }
        };
        res.json({
            success: true,
            data: systemHealth
        });
    }
    catch (error) {
        console.error('System health error:', error);
        res.status(500).json({
            error: 'Failed to fetch system health',
            message: 'An error occurred while generating system health report'
        });
    }
});
router.get('/financial', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const isSuperAdmin = user.isSuperAdmin;
        const { startDate, endDate, period = '30d' } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        else {
            const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
            dateFilter = {
                createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
            };
        }
        let financialReport = {};
        if (isSuperAdmin) {
            const totalCompanies = await Company_1.default.countDocuments({ isActive: true });
            financialReport = {
                overview: {
                    totalCompanies,
                    totalRevenue: 0,
                    totalExpenses: 0,
                    netProfit: 0,
                    averageRevenuePerCompany: 0
                },
                trends: {
                    monthlyRevenue: [],
                    expenseBreakdown: [],
                    profitMargins: []
                },
                topPerformingCompanies: []
            };
        }
        else {
            financialReport = {
                overview: {
                    totalRevenue: 0,
                    totalExpenses: 0,
                    netProfit: 0,
                    profitMargin: 0,
                    outstandingInvoices: 0,
                    overduePayments: 0
                },
                cashFlow: {
                    inflow: [],
                    outflow: [],
                    netFlow: []
                },
                invoiceAnalysis: {
                    totalInvoices: 0,
                    paidInvoices: 0,
                    pendingInvoices: 0,
                    overdueInvoices: 0,
                    averageInvoiceValue: 0
                },
                expenseBreakdown: []
            };
        }
        res.json({
            success: true,
            data: financialReport,
            period,
            dateRange: { startDate, endDate }
        });
    }
    catch (error) {
        console.error('Financial report error:', error);
        res.status(500).json({
            error: 'Failed to generate financial report',
            message: 'An error occurred while generating financial report'
        });
    }
});
router.get('/production', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.companyId;
        const { startDate, endDate, period = '30d' } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        else {
            const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
            dateFilter = {
                createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
            };
        }
        const productionReport = {
            overview: {
                totalOrders: 0,
                completedOrders: 0,
                inProgressOrders: 0,
                pendingOrders: 0,
                totalQuantityProduced: 0,
                averageCompletionTime: 0,
                onTimeDeliveryRate: 0
            },
            efficiency: {
                productionEfficiency: 0,
                machineUtilization: 0,
                laborEfficiency: 0,
                qualityRate: 0,
                wastePercentage: 0
            },
            trends: {
                dailyProduction: [],
                weeklyTrends: [],
                monthlyTargets: [],
                productionByLine: []
            },
            qualityMetrics: {
                totalQualityChecks: 0,
                passedChecks: 0,
                failedChecks: 0,
                qualityScore: 0,
                defectRate: 0,
                reworkRate: 0
            },
            resourceUtilization: {
                machineHours: 0,
                laborHours: 0,
                materialConsumption: 0,
                energyConsumption: 0
            }
        };
        res.json({
            success: true,
            data: productionReport,
            period,
            dateRange: { startDate, endDate }
        });
    }
    catch (error) {
        console.error('Production report error:', error);
        res.status(500).json({
            error: 'Failed to generate production report',
            message: 'An error occurred while generating production report'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map