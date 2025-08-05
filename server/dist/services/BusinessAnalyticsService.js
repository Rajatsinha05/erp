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
exports.BusinessAnalyticsService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const BusinessAnalytics_1 = __importDefault(require("../models/BusinessAnalytics"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class BusinessAnalyticsService extends BaseService_1.BaseService {
    constructor() {
        super(BusinessAnalytics_1.default);
    }
    async createAnalytics(analyticsData, createdBy) {
        try {
            this.validateAnalyticsData(analyticsData);
            const analytics = await this.create({
                ...analyticsData,
                analyticsId: `BA-${Date.now()}`,
                kpiMetrics: [],
                totalMetrics: 0,
                activeMetrics: 0,
                dataSources: [],
                reports: [],
                dashboards: [],
                alerts: [],
                integrations: [],
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Business analytics system created successfully', {
                analyticsId: analytics.analyticsId,
                analyticsName: analytics.analyticsName,
                createdBy
            });
            return analytics;
        }
        catch (error) {
            logger_1.logger.error('Error creating business analytics system', { error, analyticsData, createdBy });
            throw error;
        }
    }
    async getAnalyticsByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.reportType) {
                query.reportType = options.reportType;
            }
            if (options.dateRange) {
                query.generatedAt = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { generatedAt: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting analytics by company', { error, companyId, options });
            throw error;
        }
    }
    async generateSalesAnalytics(companyId, dateRange) {
        try {
            const { default: Invoice } = await Promise.resolve().then(() => __importStar(require('../models/Invoice')));
            const { default: CustomerOrder } = await Promise.resolve().then(() => __importStar(require('../models/CustomerOrder')));
            const { default: Customer } = await Promise.resolve().then(() => __importStar(require('../models/Customer')));
            const matchQuery = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                }
            };
            const [totalSalesData, totalOrdersData, topProductsData, salesByMonthData, customerAnalyticsData] = await Promise.all([
                Invoice.aggregate([
                    { $match: { ...matchQuery, status: 'paid' } },
                    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
                ]),
                CustomerOrder.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalOrders: { $sum: 1 } } }
                ]),
                CustomerOrder.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$items' },
                    { $group: {
                            _id: '$items.itemName',
                            totalQuantity: { $sum: '$items.quantity' },
                            totalValue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } }
                        } },
                    { $sort: { totalValue: -1 } },
                    { $limit: 10 }
                ]),
                Invoice.aggregate([
                    { $match: { ...matchQuery, status: 'paid' } },
                    { $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            totalSales: { $sum: '$totalAmount' },
                            orderCount: { $sum: 1 }
                        } },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]),
                Customer.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId) } },
                    { $group: {
                            _id: null,
                            totalCustomers: { $sum: 1 },
                            newCustomers: {
                                $sum: {
                                    $cond: [
                                        { $gte: ['$createdAt', dateRange.start] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        } }
                ])
            ]);
            const totalSales = totalSalesData[0]?.totalSales || 0;
            const totalOrders = totalOrdersData[0]?.totalOrders || 0;
            const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
            return {
                totalSales,
                totalOrders,
                averageOrderValue,
                topProducts: topProductsData,
                salesByMonth: salesByMonthData,
                customerAnalytics: {
                    newCustomers: customerAnalyticsData[0]?.newCustomers || 0,
                    totalCustomers: customerAnalyticsData[0]?.totalCustomers || 0,
                    returningCustomers: (customerAnalyticsData[0]?.totalCustomers || 0) - (customerAnalyticsData[0]?.newCustomers || 0),
                    customerRetentionRate: customerAnalyticsData[0]?.totalCustomers > 0 ?
                        ((customerAnalyticsData[0]?.totalCustomers - customerAnalyticsData[0]?.newCustomers) / customerAnalyticsData[0]?.totalCustomers) * 100 : 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating sales analytics', { error, companyId, dateRange });
            throw error;
        }
    }
    async generateInventoryAnalytics(companyId) {
        try {
            const { default: InventoryItem } = await Promise.resolve().then(() => __importStar(require('../models/InventoryItem')));
            const { default: StockMovement } = await Promise.resolve().then(() => __importStar(require('../models/StockMovement')));
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            const [totalItemsData, lowStockItemsData, outOfStockItemsData, totalValueData, topMovingItemsData, slowMovingItemsData] = await Promise.all([
                InventoryItem.countDocuments(matchQuery),
                InventoryItem.countDocuments({
                    ...matchQuery,
                    $expr: { $lt: ['$currentStock', '$reorderLevel'] }
                }),
                InventoryItem.countDocuments({
                    ...matchQuery,
                    currentStock: { $lte: 0 }
                }),
                InventoryItem.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: null,
                            totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } }
                        } }
                ]),
                StockMovement.aggregate([
                    {
                        $match: {
                            ...matchQuery,
                            movementDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                        }
                    },
                    { $group: {
                            _id: '$itemId',
                            totalMovements: { $sum: 1 },
                            totalQuantity: { $sum: '$quantity' }
                        } },
                    { $sort: { totalMovements: -1 } },
                    { $limit: 10 },
                    { $lookup: {
                            from: 'inventory_items',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'item'
                        } },
                    { $unwind: '$item' },
                    { $project: {
                            itemName: '$item.itemName',
                            itemCode: '$item.itemCode',
                            totalMovements: 1,
                            totalQuantity: 1
                        } }
                ]),
                StockMovement.aggregate([
                    {
                        $match: {
                            ...matchQuery,
                            movementDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                        }
                    },
                    { $group: {
                            _id: '$itemId',
                            totalMovements: { $sum: 1 }
                        } },
                    { $sort: { totalMovements: 1 } },
                    { $limit: 10 },
                    { $lookup: {
                            from: 'inventory_items',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'item'
                        } },
                    { $unwind: '$item' },
                    { $project: {
                            itemName: '$item.itemName',
                            itemCode: '$item.itemCode',
                            totalMovements: 1
                        } }
                ])
            ]);
            const totalValue = totalValueData[0]?.totalValue || 0;
            const totalMovementValue = topMovingItemsData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
            const stockTurnoverRate = totalValue > 0 ? (totalMovementValue / totalValue) * 100 : 0;
            return {
                totalItems: totalItemsData,
                lowStockItems: lowStockItemsData,
                outOfStockItems: outOfStockItemsData,
                totalValue,
                topMovingItems: topMovingItemsData,
                slowMovingItems: slowMovingItemsData,
                stockTurnoverRate
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating inventory analytics', { error, companyId });
            throw error;
        }
    }
    validateAnalyticsData(analyticsData) {
        if (!analyticsData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!analyticsData.analyticsName) {
            throw new errors_1.AppError('Analytics name is required', 400);
        }
    }
}
exports.BusinessAnalyticsService = BusinessAnalyticsService;
//# sourceMappingURL=BusinessAnalyticsService.js.map