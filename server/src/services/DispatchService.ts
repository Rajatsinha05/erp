import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import Dispatch from '../models/Dispatch';
import { IDispatch } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class DispatchService extends BaseService<IDispatch> {
  constructor() {
    super(Dispatch);
  }

  /**
   * Create a new dispatch entry
   */
  async createDispatch(dispatchData: Partial<IDispatch>, createdBy?: string): Promise<IDispatch> {
    try {
      this.validateDispatchData(dispatchData);

      const dispatch = await this.create({
        ...dispatchData,
        dispatchNumber: await this.generateDispatchNumber(dispatchData.companyId!.toString()),
        dispatchDate: dispatchData.dispatchDate || new Date(),
        totalItems: 0,
        totalQuantity: 0,
        totalWeight: 0,
        totalVolume: 0,
        totalValue: 0,
        items: [],
        createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined
      }, createdBy);

      logger.info('Dispatch entry created successfully', {
        dispatchNumber: dispatch.dispatchNumber,
        dispatchType: dispatch.dispatchType,
        totalQuantity: dispatch.totalQuantity,
        createdBy
      });

      return dispatch;
    } catch (error) {
      logger.error('Error creating dispatch entry', { error, dispatchData, createdBy });
      throw error;
    }
  }

  /**
   * Update dispatch status
   */
  async updateDispatchStatus(dispatchId: string, status: string, updatedBy?: string): Promise<IDispatch | null> {
    try {
      const dispatch = await this.findById(dispatchId);
      if (!dispatch) {
        throw new AppError('Dispatch not found', 404);
      }

      const updateData: any = { 
        status,
        lastModifiedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined
      };

      // Set specific dates based on status
      if (status === 'dispatched') {
        updateData.actualDispatchDate = new Date();
      } else if (status === 'delivered') {
        updateData.deliveryDate = new Date();
      }

      const updatedDispatch = await this.update(dispatchId, updateData, updatedBy);

      logger.info('Dispatch status updated', { 
        dispatchId, 
        oldStatus: dispatch.status,
        newStatus: status,
        updatedBy 
      });

      return updatedDispatch;
    } catch (error) {
      logger.error('Error updating dispatch status', { error, dispatchId, status, updatedBy });
      throw error;
    }
  }

  /**
   * Get dispatches by company
   */
  async getDispatchesByCompany(companyId: string, options: any = {}): Promise<IDispatch[]> {
    try {
      let query: any = { 
        companyId: new Types.ObjectId(companyId)
      };

      if (options.status) {
        query.status = options.status;
      }

      if (options.customerName) {
        query.customerName = { $regex: options.customerName, $options: 'i' };
      }

      if (options.dateRange) {
        query.dispatchDate = {
          $gte: options.dateRange.start,
          $lte: options.dateRange.end
        };
      }

      return await this.findMany(query, { 
        sort: { dispatchDate: -1 },
        page: options.page,
        limit: options.limit
      });
    } catch (error) {
      logger.error('Error getting dispatches by company', { error, companyId, options });
      throw error;
    }
  }

  /**
   * Get dispatch statistics
   */
  async getDispatchStats(companyId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const matchQuery: any = { companyId: new Types.ObjectId(companyId) };
      
      if (dateRange) {
        matchQuery.dispatchDate = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const [
        totalDispatches,
        dispatchesByStatus,
        totalQuantity,
        avgDeliveryTime,
        topCustomers
      ] = await Promise.all([
        this.count(matchQuery),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$status', count: { $sum: 1 }, totalQty: { $sum: '$totalQuantity' } } }
        ]),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: null, totalQty: { $sum: '$totalQuantity' } } }
        ]),
        this.model.aggregate([
          { $match: { ...matchQuery, deliveryDate: { $exists: true }, actualDispatchDate: { $exists: true } } },
          { $project: {
            deliveryTime: { $subtract: ['$deliveryDate', '$actualDispatchDate'] }
          }},
          { $group: { _id: null, avgTime: { $avg: '$deliveryTime' } } }
        ]),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$customerName', totalDispatches: { $sum: 1 }, totalQuantity: { $sum: '$totalQuantity' } } },
          { $sort: { totalDispatches: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        totalDispatches,
        dispatchesByStatus,
        totalQuantity: totalQuantity[0]?.totalQty || 0,
        averageDeliveryTime: avgDeliveryTime[0]?.avgTime || 0,
        topCustomers
      };
    } catch (error) {
      logger.error('Error getting dispatch statistics', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Generate dispatch number
   */
  private async generateDispatchNumber(companyId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await this.count({ 
      companyId: new Types.ObjectId(companyId),
      createdAt: {
        $gte: new Date(year, today.getMonth(), 1),
        $lt: new Date(year, today.getMonth() + 1, 1)
      }
    });

    return `DSP${year}${month}${(count + 1).toString().padStart(6, '0')}`;
  }

  /**
   * Validate dispatch data
   */
  private validateDispatchData(dispatchData: Partial<IDispatch>): void {
    if (!dispatchData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!dispatchData.dispatchType) {
      throw new AppError('Dispatch type is required', 400);
    }

    if (!dispatchData.priority) {
      throw new AppError('Priority is required', 400);
    }
  }
}
