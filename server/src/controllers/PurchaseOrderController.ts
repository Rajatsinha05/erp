import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PurchaseOrderService } from '../services/PurchaseOrderService';
import { IPurchaseOrder } from '../types/models';

export class PurchaseOrderController extends BaseController<IPurchaseOrder> {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    const purchaseOrderService = new PurchaseOrderService();
    super(purchaseOrderService, 'PurchaseOrder');
    this.purchaseOrderService = purchaseOrderService;
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const createdBy = req.user?.id;

      const order = await this.purchaseOrderService.createPurchaseOrder(orderData, createdBy);

      this.sendSuccess(res, order, 'Purchase order created successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to create purchase order');
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const updatedBy = req.user?.id;

      const order = await this.purchaseOrderService.updateOrderStatus(orderId, status, updatedBy);

      this.sendSuccess(res, order, 'Purchase order status updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update purchase order status');
    }
  }

  /**
   * Receive items
   */
  async receiveItems(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { receivedItems } = req.body;
      const receivedBy = req.user?.id;

      const order = await this.purchaseOrderService.receiveItems(orderId, receivedItems, receivedBy);

      this.sendSuccess(res, order, 'Items received successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to receive items');
    }
  }

  /**
   * Get orders by supplier
   */
  async getOrdersBySupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const companyId = req.user?.companyId;
      const { page = 1, limit = 10 } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const orders = await this.purchaseOrderService.getOrdersBySupplier(supplierId, companyId.toString(), options);

      this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase orders');
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const companyId = req.user?.companyId;
      const { page = 1, limit = 10 } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const orders = await this.purchaseOrderService.getOrdersByStatus(companyId.toString(), status, options);

      this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase orders');
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const stats = await this.purchaseOrderService.getOrderStats(companyId.toString(), dateRange);

      this.sendSuccess(res, stats, 'Purchase order statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase order statistics');
    }
  }

  /**
   * Get all orders by company
   */
  async getOrdersByCompany(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { page = 1, limit = 10, status, search } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      let query: any = { companyId };

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { poNumber: { $regex: search, $options: 'i' } },
          { 'supplier.supplierName': { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: { createdAt: -1 }
      };

      const orders = await this.purchaseOrderService.findMany(query, options);

      this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase orders');
    }
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      const order = await this.purchaseOrderService.update(id, updateData, updatedBy);

      if (!order) {
        this.sendError(res, new Error('Purchase order not found'), 'Purchase order not found', 404);
        return;
      }

      this.sendSuccess(res, order, 'Purchase order updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update purchase order');
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await this.purchaseOrderService.findById(id);

      if (!order) {
        this.sendError(res, new Error('Purchase order not found'), 'Purchase order not found', 404);
        return;
      }

      this.sendSuccess(res, order, 'Purchase order retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get purchase order');
    }
  }

  /**
   * Delete purchase order (soft delete)
   */
  async deletePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      const order = await this.purchaseOrderService.update(id, {
        status: 'cancelled',
        cancelledAt: new Date()
      }, deletedBy);

      if (!order) {
        this.sendError(res, new Error('Purchase order not found'), 'Purchase order not found', 404);
        return;
      }

      this.sendSuccess(res, null, 'Purchase order cancelled successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to cancel purchase order');
    }
  }
}
