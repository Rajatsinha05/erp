import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { CustomerOrder } from '../models';
import { ICustomerOrder } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class CustomerOrderService extends BaseService<ICustomerOrder> {
  constructor() {
    super(CustomerOrder);
  }

  /**
   * Create a new customer order
   */
  async createCustomerOrder(orderData: Partial<ICustomerOrder>, createdBy?: string): Promise<ICustomerOrder> {
    try {
      // Validate order data
      this.validateOrderData(orderData);

      // Generate order number if not provided
      if (!orderData.orderNumber) {
        orderData.orderNumber = await this.generateOrderNumber(orderData.companyId!.toString());
      }

      // Calculate totals
      const totals = this.calculateOrderTotals(orderData.orderItems || []);

      const order = await this.create({
        ...orderData,
        orderNumber: orderData.orderNumber,
        status: 'draft',
        orderSummary: {
          ...orderData.orderSummary,
          finalAmount: totals.totalAmount,
          subtotal: totals.subtotal,
          totalTax: totals.totalTax
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }, createdBy);

      logger.info('Customer order created successfully', { 
        orderId: order._id, 
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        grandTotal: order.orderSummary?.finalAmount || 0,
        createdBy 
      });

      return order;
    } catch (error) {
      logger.error('Error creating customer order', { error, orderData, createdBy });
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string, updatedBy?: string): Promise<ICustomerOrder | null> {
    try {
      const order = await this.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Validate status transition
      this.validateStatusTransition(order.status, status);

      const updateData: any = { status };

      // Set specific dates based on status
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'in_production') {
        updateData.productionStartedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      const updatedOrder = await this.update(orderId, updateData, updatedBy);

      logger.info('Customer order status updated', { 
        orderId, 
        oldStatus: order.status,
        newStatus: status,
        updatedBy 
      });

      return updatedOrder;
    } catch (error) {
      logger.error('Error updating order status', { error, orderId, status, updatedBy });
      throw error;
    }
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(customerId: string, companyId: string, options: any = {}): Promise<ICustomerOrder[]> {
    try {
      const query = { 
        customerId: new Types.ObjectId(customerId),
        companyId: new Types.ObjectId(companyId)
      };

      return await this.findMany(query, { 
        sort: { createdAt: -1 },
        ...options 
      });
    } catch (error) {
      logger.error('Error getting orders by customer', { error, customerId, companyId });
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(companyId: string, status: string, options: any = {}): Promise<ICustomerOrder[]> {
    try {
      const query = { 
        companyId: new Types.ObjectId(companyId),
        status
      };

      return await this.findMany(query, { 
        sort: { createdAt: -1 },
        ...options 
      });
    } catch (error) {
      logger.error('Error getting orders by status', { error, companyId, status });
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(companyId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const matchQuery: any = { companyId: new Types.ObjectId(companyId) };
      
      if (dateRange) {
        matchQuery.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const [
        totalOrders,
        ordersByStatus,
        totalRevenue,
        averageOrderValue,
        topCustomers
      ] = await Promise.all([
        this.count(matchQuery),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } }
        ]),
        this.model.aggregate([
          { $match: { ...matchQuery, status: { $in: ['completed', 'delivered'] } } },
          { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
        ]),
        this.model.aggregate([
          { $match: matchQuery },
          { $group: { _id: null, avgOrderValue: { $avg: '$grandTotal' } } }
        ]),
        this.model.aggregate([
          { $match: matchQuery },
          { 
            $group: { 
              _id: '$customerId', 
              orderCount: { $sum: 1 }, 
              totalValue: { $sum: '$grandTotal' } 
            }
          },
          { $sort: { totalValue: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        totalOrders,
        ordersByStatus,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        averageOrderValue: averageOrderValue[0]?.avgOrderValue || 0,
        topCustomers
      };
    } catch (error) {
      logger.error('Error getting order statistics', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Calculate order totals
   */
  private calculateOrderTotals(items: any[]): { subtotal: number; totalTax: number; totalAmount: number } {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.rate;
      const itemTax = itemTotal * (item.taxRate || 0) / 100;

      subtotal += itemTotal;
      totalTax += itemTax;
    });

    const totalAmount = subtotal + totalTax;

    return { subtotal, totalTax, totalAmount };
  }

  /**
   * Generate order number
   */
  private async generateOrderNumber(companyId: string): Promise<string> {
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

    return `CO${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: { [key: string]: string[] } = {
      'draft': ['confirmed', 'cancelled'],
      'confirmed': ['in_production', 'cancelled'],
      'in_production': ['quality_check', 'cancelled'],
      'quality_check': ['ready_for_dispatch', 'in_production'],
      'ready_for_dispatch': ['dispatched'],
      'dispatched': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
    }
  }

  /**
   * Validate order data
   */
  private validateOrderData(orderData: Partial<ICustomerOrder>): void {
    if (!orderData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!orderData.customerId) {
      throw new AppError('Customer ID is required', 400);
    }

    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      throw new AppError('Order must have at least one item', 400);
    }

    // Validate each item
    orderData.orderItems.forEach((item, index) => {
      if (!item.productType) {
        throw new AppError(`Item ${index + 1}: Product type is required`, 400);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new AppError(`Item ${index + 1}: Quantity must be greater than 0`, 400);
      }
      if (!item.rate || item.rate < 0) {
        throw new AppError(`Item ${index + 1}: Rate must be non-negative`, 400);
      }
    });
  }
}
