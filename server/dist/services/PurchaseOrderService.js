"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class PurchaseOrderService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.PurchaseOrder);
    }
    async createPurchaseOrder(orderData, createdBy) {
        try {
            this.validateOrderData(orderData);
            if (!orderData.poNumber) {
                orderData.poNumber = await this.generateOrderNumber(orderData.companyId.toString());
            }
            const totals = this.calculateOrderTotals(orderData.items || []);
            const order = await this.create({
                ...orderData,
                poNumber: orderData.poNumber,
                status: 'draft',
                amounts: {
                    subtotal: totals.subtotal,
                    totalTaxAmount: totals.totalTax,
                    grandTotal: totals.totalAmount,
                    totalDiscount: 0,
                    taxableAmount: totals.subtotal,
                    roundingAdjustment: 0,
                    freightCharges: 0,
                    packingCharges: 0,
                    otherCharges: 0
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Purchase order created successfully', {
                orderId: order._id,
                poNumber: order.poNumber,
                supplierId: order.supplier?.supplierId,
                grandTotal: order.amounts?.grandTotal,
                createdBy
            });
            return order;
        }
        catch (error) {
            logger_1.logger.error('Error creating purchase order', { error, orderData, createdBy });
            throw error;
        }
    }
    async updateOrderStatus(orderId, status, updatedBy) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Purchase order not found', 404);
            }
            this.validateStatusTransition(order.status, status);
            const updateData = { status };
            if (status === 'sent') {
                updateData.sentAt = new Date();
            }
            else if (status === 'acknowledged') {
                updateData.acknowledgedAt = new Date();
            }
            else if (status === 'partially_received') {
                updateData.firstReceiptAt = new Date();
            }
            else if (status === 'received') {
                updateData.fullyReceivedAt = new Date();
            }
            else if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
            }
            const updatedOrder = await this.update(orderId, updateData, updatedBy);
            logger_1.logger.info('Purchase order status updated', {
                orderId,
                oldStatus: order.status,
                newStatus: status,
                updatedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error updating purchase order status', { error, orderId, status, updatedBy });
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
            logger_1.logger.error('Error getting purchase orders by status', { error, companyId, status });
            throw error;
        }
    }
    async getOrdersBySupplier(supplierId, companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                'supplier.supplierId': new mongoose_1.Types.ObjectId(supplierId)
            };
            return await this.findMany(query, {
                sort: { createdAt: -1 },
                ...options
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting orders by supplier', { error, supplierId, companyId });
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
            const [totalOrders, ordersByStatus, totalValue, averageOrderValue] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$amounts.grandTotal' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalValue: { $sum: '$amounts.grandTotal' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, avgValue: { $avg: '$amounts.grandTotal' } } }
                ])
            ]);
            return {
                totalOrders,
                ordersByStatus,
                totalValue: totalValue[0]?.totalValue || 0,
                averageOrderValue: averageOrderValue[0]?.avgValue || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting order statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async getOverdueOrders(companyId) {
        try {
            const today = new Date();
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                status: { $in: ['sent', 'acknowledged', 'partially_received'] },
                expectedDeliveryDate: { $lt: today }
            };
            return await this.findMany(query, { sort: { expectedDeliveryDate: 1 } });
        }
        catch (error) {
            logger_1.logger.error('Error getting overdue purchase orders', { error, companyId });
            throw error;
        }
    }
    async getPurchaseOrderStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalOrders, ordersByStatus, totalSpend, averageOrderValue, topSuppliers, overdueCount] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, status: { $in: ['received', 'partially_received'] } } },
                    { $group: { _id: null, totalSpend: { $sum: '$grandTotal' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, avgOrderValue: { $avg: '$grandTotal' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    {
                        $group: {
                            _id: '$supplierId',
                            orderCount: { $sum: 1 },
                            totalValue: { $sum: '$grandTotal' }
                        }
                    },
                    { $sort: { totalValue: -1 } },
                    { $limit: 10 }
                ]),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    status: { $in: ['sent', 'acknowledged', 'partially_received'] },
                    expectedDeliveryDate: { $lt: new Date() }
                })
            ]);
            return {
                totalOrders,
                ordersByStatus,
                totalSpend: totalSpend[0]?.totalSpend || 0,
                averageOrderValue: averageOrderValue[0]?.avgOrderValue || 0,
                topSuppliers,
                overdueCount
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting purchase order statistics', { error, companyId, dateRange });
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
        return `PO${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }
    async receiveItems(orderId, receivedItems, receivedBy) {
        try {
            const order = await this.findById(orderId);
            if (!order) {
                throw new errors_1.AppError('Purchase order not found', 404);
            }
            if (order.status !== 'acknowledged') {
                throw new errors_1.AppError('Only acknowledged orders can receive items', 400);
            }
            const updateData = {
                receivedItems,
                firstReceiptAt: new Date(),
                status: 'partially_received'
            };
            const allReceived = receivedItems.every(item => item.receivedQuantity >= item.orderedQuantity);
            if (allReceived) {
                updateData.status = 'received';
                updateData.fullyReceivedAt = new Date();
            }
            const updatedOrder = await this.update(orderId, updateData, receivedBy);
            logger_1.logger.info('Items received for purchase order', {
                orderId,
                receivedItems: receivedItems.length,
                receivedBy
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error receiving items', { error, orderId, receivedItems, receivedBy });
            throw error;
        }
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'draft': ['sent', 'cancelled'],
            'sent': ['acknowledged', 'cancelled'],
            'acknowledged': ['partially_received', 'received', 'cancelled'],
            'partially_received': ['received', 'cancelled'],
            'received': [],
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
        if (!orderData.supplier?.supplierId) {
            throw new errors_1.AppError('Supplier ID is required', 400);
        }
        if (!orderData.items || orderData.items.length === 0) {
            throw new errors_1.AppError('Purchase order must have at least one item', 400);
        }
        orderData.items.forEach((item, index) => {
            if (!item.itemName) {
                throw new errors_1.AppError(`Item ${index + 1}: Item name is required`, 400);
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
exports.PurchaseOrderService = PurchaseOrderService;
//# sourceMappingURL=PurchaseOrderService.js.map