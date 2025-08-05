"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerOrderService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class CustomerOrderService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.CustomerOrder);
    }
    async createCustomerOrder(orderData, createdBy) {
        try {
            this.validateOrderData(orderData);
            if (!orderData.orderNumber) {
                orderData.orderNumber = await this.generateOrderNumber(orderData.companyId.toString());
            }
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
            logger_1.logger.info('Customer order created successfully', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                customerId: order.customerId,
                grandTotal: order.orderSummary?.finalAmount || 0,
                createdBy
            });
            return order;
        }
        catch (error) {
            logger_1.logger.error('Error creating customer order', { error, orderData, createdBy });
            throw error;
        }
    }
    async updateOrderStatus(orderId, status, updatedBy) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Order not found', 404);
            }
            this.validateStatusTransition(order.status, status);
            const updateData = { status };
            if (status === 'confirmed') {
                updateData.confirmedAt = new Date();
            }
            else if (status === 'in_production') {
                updateData.productionStartedAt = new Date();
            }
            else if (status === 'completed') {
                updateData.completedAt = new Date();
            }
            else if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
            }
            const updatedOrder = await this.update(orderId, updateData, updatedBy);
            logger_1.logger.info('Customer order status updated', {
                orderId,
                oldStatus: order.status,
                newStatus: status,
                updatedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error updating order status', { error, orderId, status, updatedBy });
            throw error;
        }
    }
    async getOrdersByCustomer(customerId, companyId, options = {}) {
        try {
            const query = {
                customerId: new mongoose_1.Types.ObjectId(customerId),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            return await this.findMany(query, {
                sort: { createdAt: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting orders by customer', { error, customerId, companyId });
            throw error;
        }
    }
    async getOrdersByStatus(companyId, status, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                status
            };
            return await this.findMany(query, {
                sort: { createdAt: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting orders by status', { error, companyId, status });
            throw error;
        }
    }
    async getOrderStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalOrders, ordersByStatus, totalRevenue, averageOrderValue, topCustomers] = await Promise.all([
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
        }
        catch (error) {
            logger_1.logger.error('Error getting order statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    calculateOrderTotals(items) {
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
    async generateOrderNumber(companyId) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const count = await this.count({
            companyId: new mongoose_1.Types.ObjectId(companyId),
            createdAt: {
                $gte: new Date(year, today.getMonth(), 1),
                $lt: new Date(year, today.getMonth() + 1, 1)
            }
        });
        return `CO${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
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
            throw new errors_1.AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
        }
    }
    validateOrderData(orderData) {
        if (!orderData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!orderData.customerId) {
            throw new errors_1.AppError('Customer ID is required', 400);
        }
        if (!orderData.orderItems || orderData.orderItems.length === 0) {
            throw new errors_1.AppError('Order must have at least one item', 400);
        }
        orderData.orderItems.forEach((item, index) => {
            if (!item.productType) {
                throw new errors_1.AppError(`Item ${index + 1}: Product type is required`, 400);
            }
            if (!item.quantity || item.quantity <= 0) {
                throw new errors_1.AppError(`Item ${index + 1}: Quantity must be greater than 0`, 400);
            }
            if (!item.rate || item.rate < 0) {
                throw new errors_1.AppError(`Item ${index + 1}: Rate must be non-negative`, 400);
            }
        });
    }
}
exports.CustomerOrderService = CustomerOrderService;
//# sourceMappingURL=CustomerOrderService.js.map