import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { StockMovement } from '../models';
import { IStockMovement } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class StockMovementService extends BaseService<IStockMovement> {
  constructor() {
    super(StockMovement);
  }

  /**
   * Create a new stock movement
   */
  async createStockMovement(movementData: Partial<IStockMovement>, createdBy?: string): Promise<IStockMovement> {
    try {
      // Validate movement data
      this.validateMovementData(movementData);

      // Generate movement number if not provided
      if (!movementData.movementNumber) {
        movementData.movementNumber = await this.generateMovementNumber(movementData.companyId!.toString());
      }

      const movement = await this.create({
        ...movementData,
        movementDate: movementData.movementDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }, createdBy);

      logger.info('Stock movement created successfully', { 
        movementId: movement._id, 
        movementNumber: movement.movementNumber,
        movementType: movement.movementType,
        itemId: movement.itemId,
        quantity: movement.quantity,
        createdBy 
      });

      return movement;
    } catch (error) {
      logger.error('Error creating stock movement', { error, movementData, createdBy });
      throw error;
    }
  }

  /**
   * Get stock movements by item
   */
  async getMovementsByItem(itemId: string, options: any = {}): Promise<IStockMovement[]> {
    try {
      const query: any = {
        itemId: new Types.ObjectId(itemId)
      };

      if (options.movementType) {
        query.movementType = options.movementType;
      }

      if (options.dateRange) {
        query.movementDate = {
          $gte: options.dateRange.start,
          $lte: options.dateRange.end
        };
      }

      return await this.findMany(query, {
        sort: { movementDate: -1 },
        page: options.page,
        limit: options.limit
      });
    } catch (error) {
      logger.error('Error getting movements by item', { error, itemId });
      throw error;
    }
  }

  /**
   * Get movements by warehouse
   */
  async getMovementsByWarehouse(warehouseId: string, options: any = {}): Promise<IStockMovement[]> {
    try {
      const query: any = {
        warehouseId: new Types.ObjectId(warehouseId)
      };

      if (options.movementType) {
        query.movementType = options.movementType;
      }

      if (options.dateRange) {
        query.movementDate = {
          $gte: options.dateRange.start,
          $lte: options.dateRange.end
        };
      }

      return await this.findMany(query, {
        sort: { movementDate: -1 },
        page: options.page,
        limit: options.limit
      });
    } catch (error) {
      logger.error('Error getting movements by warehouse', { error, warehouseId });
      throw error;
    }
  }

  /**
   * Get stock movements by date range
   */
  async getMovementsByDateRange(
    companyId: string, 
    startDate: Date, 
    endDate: Date, 
    options: any = {}
  ): Promise<IStockMovement[]> {
    try {
      const query = { 
        companyId: new Types.ObjectId(companyId),
        movementDate: {
          $gte: startDate,
          $lte: endDate
        }
      };

      return await this.findMany(query, { 
        sort: { movementDate: -1 },
        ...options 
      });
    } catch (error) {
      logger.error('Error getting movements by date range', { error, companyId, startDate, endDate });
      throw error;
    }
  }

  /**
   * Get stock movements by type
   */
  async getMovementsByType(
    companyId: string, 
    movementType: string, 
    options: any = {}
  ): Promise<IStockMovement[]> {
    try {
      const query = { 
        companyId: new Types.ObjectId(companyId),
        movementType
      };

      return await this.findMany(query, { 
        sort: { movementDate: -1 },
        ...options 
      });
    } catch (error) {
      logger.error('Error getting movements by type', { error, companyId, movementType });
      throw error;
    }
  }

  /**
   * Get stock movement statistics
   */
  async getMovementStats(companyId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const matchQuery: any = { companyId: new Types.ObjectId(companyId) };
      
      if (dateRange) {
        matchQuery.movementDate = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const [
        totalMovements,
        movementsByType,
        totalQuantityIn,
        totalQuantityOut,
        movementsByDate
      ] = await Promise.all([
        this.count(matchQuery),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$movementType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
        ]),
        this.model.aggregate([
          { $match: { ...matchQuery, movementType: 'inward' } },
          { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
        ]),
        this.model.aggregate([
          { $match: { ...matchQuery, movementType: 'outward' } },
          { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
        ]),
        this.model.aggregate([
          { $match: matchQuery },
          { 
            $group: { 
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$movementDate' } },
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      return {
        totalMovements,
        movementsByType,
        totalQuantityIn: totalQuantityIn[0]?.totalQuantity || 0,
        totalQuantityOut: totalQuantityOut[0]?.totalQuantity || 0,
        movementsByDate
      };
    } catch (error) {
      logger.error('Error getting movement statistics', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Get item movement history with balance tracking
   */
  async getItemMovementHistory(itemId: string, companyId: string): Promise<any[]> {
    try {
      const movements = await this.findMany(
        { 
          itemId: new Types.ObjectId(itemId),
          companyId: new Types.ObjectId(companyId)
        },
        { sort: { movementDate: 1 } }
      );

      let runningBalance = 0;
      const history = movements.map(movement => {
        if (movement.movementType === 'inward') {
          runningBalance += movement.quantity;
        } else if (movement.movementType === 'outward') {
          runningBalance -= movement.quantity;
        } else if (movement.movementType === 'adjustment') {
          runningBalance = movement.quantity; // Adjustment sets absolute quantity
        }

        return {
          ...movement.toObject(),
          runningBalance
        };
      });

      return history;
    } catch (error) {
      logger.error('Error getting item movement history', { error, itemId, companyId });
      throw error;
    }
  }

  /**
   * Generate movement number
   */
  private async generateMovementNumber(companyId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await this.count({ 
      companyId: new Types.ObjectId(companyId),
      movementDate: {
        $gte: new Date(year, today.getMonth(), 1),
        $lt: new Date(year, today.getMonth() + 1, 1)
      }
    });

    return `MOV${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }

  /**
   * Validate movement data
   */
  private validateMovementData(movementData: Partial<IStockMovement>): void {
    if (!movementData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!movementData.itemId) {
      throw new AppError('Item ID is required', 400);
    }

    if (!movementData.movementType) {
      throw new AppError('Movement type is required', 400);
    }

    if (!movementData.quantity || movementData.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
    }

    if (!movementData.unit) {
      throw new AppError('Unit is required', 400);
    }

    const validMovementTypes = ['inward', 'outward', 'transfer', 'adjustment'];
    if (!validMovementTypes.includes(movementData.movementType)) {
      throw new AppError('Invalid movement type', 400);
    }
  }
}
