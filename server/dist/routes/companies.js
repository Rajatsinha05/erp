"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const Company_1 = __importDefault(require("@/models/Company"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/all', async (req, res) => {
    try {
        const user = req.user;
        if (!user.isSuperAdmin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only super administrators can access all companies'
            });
        }
        const companies = await Company_1.default.aggregate([
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
                    _id: 1,
                    companyName: 1,
                    companyCode: 1,
                    legalName: 1,
                    industry: 1,
                    status: 1,
                    isActive: 1,
                    createdAt: 1,
                    userCount: 1,
                    activeUsers: 1,
                    contactInfo: 1,
                    address: 1
                }
            },
            {
                $sort: { companyName: 1 }
            }
        ]);
        res.json({
            success: true,
            data: companies,
            total: companies.length
        });
    }
    catch (error) {
        console.error('Get all companies error:', error);
        res.status(500).json({
            error: 'Failed to fetch companies',
            message: 'An error occurred while fetching companies'
        });
    }
});
router.get('/:companyId', async (req, res) => {
    try {
        const user = req.user;
        const { companyId } = req.params;
        const hasAccess = user.isSuperAdmin ||
            user.companyAccess?.some((access) => access.companyId.toString() === companyId && access.isActive);
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have access to this company'
            });
        }
        const company = await Company_1.default.aggregate([
            {
                $match: {
                    _id: companyId,
                    isActive: true
                }
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
                    },
                    roleDistribution: {
                        $reduce: {
                            input: '$users',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    {
                                        $arrayToObject: [
                                            [
                                                {
                                                    k: {
                                                        $arrayElemAt: [
                                                            {
                                                                $map: {
                                                                    input: {
                                                                        $filter: {
                                                                            input: '$$this.companyAccess',
                                                                            cond: { $eq: ['$$this.companyId', companyId] }
                                                                        }
                                                                    },
                                                                    as: 'access',
                                                                    in: '$$access.role'
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    v: { $add: [{ $ifNull: [{ $getField: { field: { $toString: '$k' }, input: '$$value' } }, 0] }, 1] }
                                                }
                                            ]
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    companyName: 1,
                    companyCode: 1,
                    legalName: 1,
                    industry: 1,
                    status: 1,
                    isActive: 1,
                    createdAt: 1,
                    userCount: 1,
                    activeUsers: 1,
                    roleDistribution: 1,
                    contactInfo: 1,
                    address: 1,
                    settings: 1
                }
            }
        ]);
        if (!company || company.length === 0) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'The requested company was not found'
            });
        }
        res.json({
            success: true,
            data: company[0]
        });
    }
    catch (error) {
        console.error('Get company details error:', error);
        res.status(500).json({
            error: 'Failed to fetch company details',
            message: 'An error occurred while fetching company details'
        });
    }
});
router.get('/user/accessible', async (req, res) => {
    try {
        const user = req.user;
        let companies = [];
        if (user.isSuperAdmin) {
            companies = await Company_1.default.find({ isActive: true })
                .select('_id companyName companyCode legalName industry status')
                .sort({ companyName: 1 });
        }
        else {
            const companyIds = user.companyAccess
                ?.filter((access) => access.isActive)
                ?.map((access) => access.companyId) || [];
            if (companyIds.length > 0) {
                companies = await Company_1.default.find({
                    _id: { $in: companyIds },
                    isActive: true
                })
                    .select('_id companyName companyCode legalName industry status')
                    .sort({ companyName: 1 });
            }
        }
        res.json({
            success: true,
            data: companies,
            total: companies.length
        });
    }
    catch (error) {
        console.error('Get user companies error:', error);
        res.status(500).json({
            error: 'Failed to fetch user companies',
            message: 'An error occurred while fetching accessible companies'
        });
    }
});
exports.default = router;
//# sourceMappingURL=companies.js.map