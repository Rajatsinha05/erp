import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { InventoryService } from '../services/InventoryService';
import { IInventoryItem } from '../types/models';
import QueryOptimizer from '../utils/query-optimizer';

export class InventoryController extends BaseController<IInventoryItem> {
  private inventoryService: InventoryService;

  constructor() {
    const inventoryService = new InventoryService();
    super(inventoryService, 'InventoryItem');
    this.inventoryService = inventoryService;
  }

  /**
   * Create a new inventory item
   */
  async createInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const itemData = req.body;
      const createdBy = req.user?.id;

      const item = await this.inventoryService.createInventoryItem(itemData, createdBy);

      this.sendSuccess(res, item, 'Inventory item created successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to create inventory item');
    }
  }

  /**
   * Get inventory item by code
   */
  async getItemByCode(req: Request, res: Response): Promise<void> {
    try {
      const { itemCode } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const item = await this.inventoryService.findOne({
        itemCode: itemCode.toUpperCase(),
        companyId,
        'status.isActive': true
      });

      if (!item) {
        this.sendError(res, new Error('Item not found'), 'Inventory item not found', 404);
        return;
      }

      this.sendSuccess(res, item, 'Inventory item retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get inventory item');
    }
  }

  /**
   * Get inventory items by company with optimization
   */
  async getItemsByCompany(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      this.validateRequestWithTracking(req);

      const companyId = req.user?.companyId;
      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      // Parse query parameters
      const { page = 1, limit = 10, search, category, lowStock } = req.query;

      // Build optimized filter
      let filter = QueryOptimizer.createCompanyFilter(companyId.toString(), {
        'status.isActive': true
      });

      // Add search filter
      if (search && typeof search === 'string') {
        const searchFilter = QueryOptimizer.createTextSearchFilter(search, ['itemName', 'itemCode', 'description']);
        filter = { ...filter, ...searchFilter };
      }

      // Add category filter
      if (category) {
        filter.category = category;
      }

      // Add low stock filter
      if (lowStock === 'true') {
        filter.$expr = { $lte: ['$stock.currentStock', '$stock.reorderLevel'] };
      }

      // Get total count for pagination
      const total = await this.inventoryService.count(filter);

      // Get items with optimized query
      const items = await this.inventoryService.findManyLean(filter, {
        ...QueryOptimizer.createPaginationOptions(Number(page), Number(limit)),
        sort: { createdAt: -1 }
      });

      // Set cache headers for better performance
      this.setCacheHeaders(res, 180); // 3 minutes cache

      // Log performance
      this.logControllerPerformance('getItemsByCompany', startTime, req, items.length);

      // Send paginated response
      this.sendOptimizedPaginatedResponse(res, items, total, Number(page), Number(limit), 'Inventory items retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get inventory items');
    }
  }

  /**
   * Update stock
   */
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { warehouseId, quantity, movementType, reference, notes } = req.body;
      const updatedBy = req.user?.id;

      const result = await this.inventoryService.updateStock(
        itemId,
        warehouseId,
        quantity,
        movementType,
        reference,
        notes,
        updatedBy
      );

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: result
      });
    } catch (error) {
      this.sendError(res, error, 'Operation failed');
    }
  }

  /**
   * Reserve stock
   */
  async reserveStock(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { quantity, reference, notes } = req.body;
      const reservedBy = req.user?.id;

      const result = await this.inventoryService.reserveStock(
        itemId,
        quantity,
        reference,
        reservedBy
      );

      res.json({
        success: true,
        message: 'Stock reserved successfully',
        data: result
      });
    } catch (error) {
      this.sendError(res, error, 'Failed to reserve stock');
    }
  }

  /**
   * Release reserved stock
   */
  async releaseReservedStock(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { quantity, reference, notes } = req.body;
      const releasedBy = req.user?.id;

      const result = await this.inventoryService.releaseReservedStock(
        itemId,
        quantity,
        reference,
        releasedBy
      );

      this.sendSuccess(res, result, 'Reserved stock released successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to release reserved stock');
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
        return;
      }

      const items = await this.inventoryService.getLowStockItems(companyId.toString());

      this.sendSuccess(res, items, 'Low stock items retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get low stock items');
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const stats = await this.inventoryService.getInventoryStats(companyId.toString());

      this.sendSuccess(res, stats, 'Inventory statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get inventory statistics');
    }
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      const item = await this.inventoryService.update(id, updateData, updatedBy);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Inventory item updated successfully',
        data: item
      });
    } catch (error) {
      this.sendError(res, error, 'Failed to update inventory item');
    }
  }

  /**
   * Delete inventory item (soft delete)
   */
  async deleteInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      const item = await this.inventoryService.update(id, {
        'status.isActive': false,
        'status.deletedAt': new Date()
      }, deletedBy);

      if (!item) {
        this.sendError(res, new Error('Item not found'), 'Inventory item not found', 404);
        return;
      }

      this.sendSuccess(res, null, 'Inventory item deleted successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to delete inventory item');
    }
  }

  /**
   * Search inventory items
   */
  async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { q: searchTerm, limit = 10 } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      if (!searchTerm) {
        this.sendError(res, new Error('Search term is required'), 'Search term is required', 400);
        return;
      }

      const items = await this.inventoryService.findMany({
        companyId,
        $or: [
          { itemName: { $regex: searchTerm, $options: 'i' } },
          { itemCode: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ],
        'status.isActive': true
      }, { limit: parseInt(limit as string) });

      this.sendSuccess(res, items, 'Search results retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to search inventory items');
    }
  }
}
