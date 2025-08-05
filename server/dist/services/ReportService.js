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
exports.ReportService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const Report_1 = __importDefault(require("../models/Report"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class ReportService extends BaseService_1.BaseService {
    constructor() {
        super(Report_1.default);
    }
    async createReport(reportData, createdBy) {
        try {
            this.validateReportData(reportData);
            const report = await this.create({
                ...reportData,
                reportId: `RPT-${Date.now()}`,
                hasParameters: false,
                parameters: [],
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Report created successfully', {
                reportId: report.reportId,
                reportType: report.reportType,
                reportName: report.reportName,
                createdBy
            });
            return report;
        }
        catch (error) {
            logger_1.logger.error('Error creating report', { error, reportData, createdBy });
            throw error;
        }
    }
    async getReportsByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.reportType) {
                query.reportType = options.reportType;
            }
            if (options.status) {
                query.status = options.status;
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
            logger_1.logger.error('Error getting reports by company', { error, companyId, options });
            throw error;
        }
    }
    async generateSalesReport(companyId, dateRange, format = 'json') {
        try {
            const { default: Invoice } = await Promise.resolve().then(() => __importStar(require('../models/Invoice')));
            const { default: CustomerOrder } = await Promise.resolve().then(() => __importStar(require('../models/CustomerOrder')));
            const matchQuery = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                }
            };
            const [salesSummary, salesDetails, topCustomers, salesByProduct] = await Promise.all([
                Invoice.aggregate([
                    { $match: { ...matchQuery, status: 'paid' } },
                    { $group: {
                            _id: null,
                            totalSales: { $sum: '$totalAmount' },
                            totalOrders: { $sum: 1 },
                            avgOrderValue: { $avg: '$totalAmount' }
                        } }
                ]),
                Invoice.find({ ...matchQuery, status: 'paid' })
                    .populate('customerId', 'customerName')
                    .select('invoiceNumber totalAmount createdAt customerId')
                    .sort({ createdAt: -1 })
                    .limit(100),
                Invoice.aggregate([
                    { $match: { ...matchQuery, status: 'paid' } },
                    { $group: {
                            _id: '$customerId',
                            totalSales: { $sum: '$totalAmount' },
                            orderCount: { $sum: 1 }
                        } },
                    { $sort: { totalSales: -1 } },
                    { $limit: 10 },
                    { $lookup: {
                            from: 'customers',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'customer'
                        } },
                    { $unwind: '$customer' },
                    { $project: {
                            customerName: '$customer.customerName',
                            totalSales: 1,
                            orderCount: 1
                        } }
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
                    { $limit: 20 }
                ])
            ]);
            const summary = salesSummary[0] || { totalSales: 0, totalOrders: 0, avgOrderValue: 0 };
            const salesData = {
                reportType: 'summary',
                dateRange,
                summary: {
                    totalSales: summary.totalSales,
                    totalOrders: summary.totalOrders,
                    averageOrderValue: summary.avgOrderValue
                },
                details: salesDetails,
                topCustomers,
                salesByProduct,
                generatedAt: new Date()
            };
            const reportRecord = await this.createReport({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                reportType: 'summary',
                reportName: `Sales Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
                reportCode: `SALES_${Date.now()}`,
                version: '1.0',
                category: 'sales',
                complexity: 'simple',
                status: 'published'
            });
            return { reportRecord, data: salesData };
        }
        catch (error) {
            logger_1.logger.error('Error generating sales report', { error, companyId, dateRange });
            throw error;
        }
    }
    async generateInventoryReport(companyId, format = 'json') {
        try {
            const { default: InventoryItem } = await Promise.resolve().then(() => __importStar(require('../models/InventoryItem')));
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            const [inventorySummary, inventoryDetails, lowStockItems, highValueItems] = await Promise.all([
                InventoryItem.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: null,
                            totalItems: { $sum: 1 },
                            totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
                            lowStockItems: {
                                $sum: {
                                    $cond: [
                                        { $lt: ['$currentStock', '$reorderLevel'] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            outOfStockItems: {
                                $sum: {
                                    $cond: [
                                        { $lte: ['$currentStock', 0] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        } }
                ]),
                InventoryItem.find(matchQuery)
                    .select('itemCode itemName currentStock reorderLevel unitPrice category')
                    .sort({ itemName: 1 })
                    .limit(500),
                InventoryItem.find({
                    ...matchQuery,
                    $expr: { $lt: ['$currentStock', '$reorderLevel'] }
                })
                    .select('itemCode itemName currentStock reorderLevel unitPrice')
                    .sort({ currentStock: 1 }),
                InventoryItem.aggregate([
                    { $match: matchQuery },
                    { $addFields: {
                            totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
                        } },
                    { $sort: { totalValue: -1 } },
                    { $limit: 20 },
                    { $project: {
                            itemCode: 1,
                            itemName: 1,
                            currentStock: 1,
                            unitPrice: 1,
                            totalValue: 1
                        } }
                ])
            ]);
            const summary = inventorySummary[0] || {
                totalItems: 0,
                totalValue: 0,
                lowStockItems: 0,
                outOfStockItems: 0
            };
            const inventoryData = {
                reportType: 'detailed',
                summary,
                details: inventoryDetails,
                lowStockItems,
                highValueItems,
                generatedAt: new Date()
            };
            const reportRecord = await this.createReport({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                reportType: 'detailed',
                reportName: `Inventory Report - ${new Date().toDateString()}`,
                reportCode: `INV_${Date.now()}`,
                version: '1.0',
                category: 'inventory',
                complexity: 'simple',
                status: 'published'
            });
            return { reportRecord, data: inventoryData };
        }
        catch (error) {
            logger_1.logger.error('Error generating inventory report', { error, companyId });
            throw error;
        }
    }
    async generateProductionReport(companyId, dateRange, format = 'json') {
        try {
            const { default: ProductionOrder } = await Promise.resolve().then(() => __importStar(require('../models/ProductionOrder')));
            const matchQuery = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                }
            };
            const [productionSummary, productionDetails, statusBreakdown, productionByItem] = await Promise.all([
                ProductionOrder.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            totalQuantity: { $sum: '$quantityToProduce' },
                            completedOrders: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$status', 'completed'] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            pendingOrders: {
                                $sum: {
                                    $cond: [
                                        { $in: ['$status', ['pending', 'in_progress']] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        } }
                ]),
                ProductionOrder.find(matchQuery)
                    .populate('itemId', 'itemName itemCode')
                    .select('productionOrderNumber quantityToProduce quantityProduced status startDate endDate')
                    .sort({ createdAt: -1 })
                    .limit(100),
                ProductionOrder.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            totalQuantity: { $sum: '$quantityToProduce' }
                        } },
                    { $sort: { count: -1 } }
                ]),
                ProductionOrder.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: '$itemId',
                            totalOrders: { $sum: 1 },
                            totalQuantity: { $sum: '$quantityToProduce' },
                            completedQuantity: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$status', 'completed'] },
                                        '$quantityProduced',
                                        0
                                    ]
                                }
                            }
                        } },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 20 },
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
                            totalOrders: 1,
                            totalQuantity: 1,
                            completedQuantity: 1
                        } }
                ])
            ]);
            const summary = productionSummary[0] || {
                totalOrders: 0,
                totalQuantity: 0,
                completedOrders: 0,
                pendingOrders: 0
            };
            const productionData = {
                reportType: 'tabular',
                dateRange,
                summary,
                details: productionDetails,
                statusBreakdown,
                productionByItem,
                generatedAt: new Date()
            };
            const reportRecord = await this.createReport({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                reportType: 'tabular',
                reportName: `Production Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
                reportCode: `PROD_${Date.now()}`,
                version: '1.0',
                category: 'production',
                complexity: 'simple',
                status: 'published'
            });
            return { reportRecord, data: productionData };
        }
        catch (error) {
            logger_1.logger.error('Error generating production report', { error, companyId, dateRange });
            throw error;
        }
    }
    async getReportStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.generatedAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalReports, reportsByType, reportsByStatus] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$reportType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ])
            ]);
            return {
                totalReports,
                reportsByType,
                reportsByStatus
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting report statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    validateReportData(reportData) {
        if (!reportData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!reportData.reportType) {
            throw new errors_1.AppError('Report type is required', 400);
        }
        if (!reportData.reportName) {
            throw new errors_1.AppError('Report name is required', 400);
        }
        if (!reportData.reportCode) {
            throw new errors_1.AppError('Report code is required', 400);
        }
        if (!reportData.version) {
            throw new errors_1.AppError('Report version is required', 400);
        }
        if (!reportData.category) {
            throw new errors_1.AppError('Report category is required', 400);
        }
        if (!reportData.complexity) {
            throw new errors_1.AppError('Report complexity is required', 400);
        }
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=ReportService.js.map