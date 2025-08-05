import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import Report from '../models/Report';
import { IReport } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ReportService extends BaseService<IReport> {
  constructor() {
    super(Report);
  }

  /**
   * Create a new report
   */
  async createReport(reportData: Partial<IReport>, createdBy?: string): Promise<IReport> {
    try {
      this.validateReportData(reportData);

      const report = await this.create({
        ...reportData,
        reportId: `RPT-${Date.now()}`,
        hasParameters: false,
        parameters: [],
        createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined
      }, createdBy);

      logger.info('Report created successfully', {
        reportId: report.reportId,
        reportType: report.reportType,
        reportName: report.reportName,
        createdBy
      });

      return report;
    } catch (error) {
      logger.error('Error creating report', { error, reportData, createdBy });
      throw error;
    }
  }

  /**
   * Get reports by company
   */
  async getReportsByCompany(companyId: string, options: any = {}): Promise<IReport[]> {
    try {
      let query: any = { 
        companyId: new Types.ObjectId(companyId)
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
    } catch (error) {
      logger.error('Error getting reports by company', { error, companyId, options });
      throw error;
    }
  }

  /**
   * Generate sales report from real database data
   */
  async generateSalesReport(companyId: string, dateRange: { start: Date; end: Date }, format: string = 'json'): Promise<any> {
    try {
      const { default: Invoice } = await import('../models/Invoice');
      const { default: CustomerOrder } = await import('../models/CustomerOrder');

      const matchQuery = {
        companyId: new Types.ObjectId(companyId),
        createdAt: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      };

      const [
        salesSummary,
        salesDetails,
        topCustomers,
        salesByProduct
      ] = await Promise.all([
        // Sales summary
        Invoice.aggregate([
          { $match: { ...matchQuery, status: 'paid' } },
          { $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }}
        ]),
        // Detailed sales data
        Invoice.find({ ...matchQuery, status: 'paid' })
          .populate('customerId', 'customerName')
          .select('invoiceNumber totalAmount createdAt customerId')
          .sort({ createdAt: -1 })
          .limit(100),
        // Top customers by sales
        Invoice.aggregate([
          { $match: { ...matchQuery, status: 'paid' } },
          { $group: {
            _id: '$customerId',
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }},
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          { $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }},
          { $unwind: '$customer' },
          { $project: {
            customerName: '$customer.customerName',
            totalSales: 1,
            orderCount: 1
          }}
        ]),
        // Sales by product
        CustomerOrder.aggregate([
          { $match: matchQuery },
          { $unwind: '$items' },
          { $group: {
            _id: '$items.itemName',
            totalQuantity: { $sum: '$items.quantity' },
            totalValue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } }
          }},
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

      // Create report record
      const reportRecord = await this.createReport({
        companyId: new Types.ObjectId(companyId),
        reportType: 'summary',
        reportName: `Sales Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        reportCode: `SALES_${Date.now()}`,
        version: '1.0',
        category: 'sales',
        complexity: 'simple',
        status: 'published'
      });

      return { reportRecord, data: salesData };
    } catch (error) {
      logger.error('Error generating sales report', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Generate inventory report from real database data
   */
  async generateInventoryReport(companyId: string, format: string = 'json'): Promise<any> {
    try {
      const { default: InventoryItem } = await import('../models/InventoryItem');

      const matchQuery = { companyId: new Types.ObjectId(companyId) };

      const [
        inventorySummary,
        inventoryDetails,
        lowStockItems,
        highValueItems
      ] = await Promise.all([
        // Inventory summary
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
          }}
        ]),
        // Detailed inventory data
        InventoryItem.find(matchQuery)
          .select('itemCode itemName currentStock reorderLevel unitPrice category')
          .sort({ itemName: 1 })
          .limit(500),
        // Low stock items
        InventoryItem.find({
          ...matchQuery,
          $expr: { $lt: ['$currentStock', '$reorderLevel'] }
        })
          .select('itemCode itemName currentStock reorderLevel unitPrice')
          .sort({ currentStock: 1 }),
        // High value items
        InventoryItem.aggregate([
          { $match: matchQuery },
          { $addFields: {
            totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
          }},
          { $sort: { totalValue: -1 } },
          { $limit: 20 },
          { $project: {
            itemCode: 1,
            itemName: 1,
            currentStock: 1,
            unitPrice: 1,
            totalValue: 1
          }}
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
        companyId: new Types.ObjectId(companyId),
        reportType: 'detailed',
        reportName: `Inventory Report - ${new Date().toDateString()}`,
        reportCode: `INV_${Date.now()}`,
        version: '1.0',
        category: 'inventory',
        complexity: 'simple',
        status: 'published'
      });

      return { reportRecord, data: inventoryData };
    } catch (error) {
      logger.error('Error generating inventory report', { error, companyId });
      throw error;
    }
  }

  /**
   * Generate production report from real database data
   */
  async generateProductionReport(companyId: string, dateRange: { start: Date; end: Date }, format: string = 'json'): Promise<any> {
    try {
      const { default: ProductionOrder } = await import('../models/ProductionOrder');

      const matchQuery = {
        companyId: new Types.ObjectId(companyId),
        createdAt: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      };

      const [
        productionSummary,
        productionDetails,
        statusBreakdown,
        productionByItem
      ] = await Promise.all([
        // Production summary
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
          }}
        ]),
        // Detailed production data
        ProductionOrder.find(matchQuery)
          .populate('itemId', 'itemName itemCode')
          .select('productionOrderNumber quantityToProduce quantityProduced status startDate endDate')
          .sort({ createdAt: -1 })
          .limit(100),
        // Status breakdown
        ProductionOrder.aggregate([
          { $match: matchQuery },
          { $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantityToProduce' }
          }},
          { $sort: { count: -1 } }
        ]),
        // Production by item
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
          }},
          { $sort: { totalQuantity: -1 } },
          { $limit: 20 },
          { $lookup: {
            from: 'inventory_items',
            localField: '_id',
            foreignField: '_id',
            as: 'item'
          }},
          { $unwind: '$item' },
          { $project: {
            itemName: '$item.itemName',
            itemCode: '$item.itemCode',
            totalOrders: 1,
            totalQuantity: 1,
            completedQuantity: 1
          }}
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
        companyId: new Types.ObjectId(companyId),
        reportType: 'tabular',
        reportName: `Production Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        reportCode: `PROD_${Date.now()}`,
        version: '1.0',
        category: 'production',
        complexity: 'simple',
        status: 'published'
      });

      return { reportRecord, data: productionData };
    } catch (error) {
      logger.error('Error generating production report', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats(companyId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const matchQuery: any = { companyId: new Types.ObjectId(companyId) };
      
      if (dateRange) {
        matchQuery.generatedAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const [
        totalReports,
        reportsByType,
        reportsByStatus
      ] = await Promise.all([
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
    } catch (error) {
      logger.error('Error getting report statistics', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Validate report data
   */
  private validateReportData(reportData: Partial<IReport>): void {
    if (!reportData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!reportData.reportType) {
      throw new AppError('Report type is required', 400);
    }

    if (!reportData.reportName) {
      throw new AppError('Report name is required', 400);
    }

    if (!reportData.reportCode) {
      throw new AppError('Report code is required', 400);
    }

    if (!reportData.version) {
      throw new AppError('Report version is required', 400);
    }

    if (!reportData.category) {
      throw new AppError('Report category is required', 400);
    }

    if (!reportData.complexity) {
      throw new AppError('Report complexity is required', 400);
    }
  }
}
