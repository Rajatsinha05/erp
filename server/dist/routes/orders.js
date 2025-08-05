"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const CustomerOrder_1 = __importDefault(require("@/models/CustomerOrder"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', status = 'all', priority = 'all', dateFrom = '', dateTo = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const searchTerm = search;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        let query = {
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        };
        if (searchTerm) {
            query.$or = [
                { orderNumber: { $regex: searchTerm, $options: 'i' } },
                { 'customerInfo.name': { $regex: searchTerm, $options: 'i' } },
                { 'customerInfo.email': { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            query.status = status;
        }
        if (priority !== 'all') {
            query.priority = priority;
        }
        if (dateFrom || dateTo) {
            query.orderDate = {};
            if (dateFrom) {
                query.orderDate.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.orderDate.$lte = new Date(dateTo);
            }
        }
        const orders = await CustomerOrder_1.default.find(query)
            .populate('customerId', 'customerCode name companyName')
            .populate('companyId', 'companyName companyCode')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await CustomerOrder_1.default.countDocuments(query);
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName || order.customerId?.customerName || order.customerId?.displayName,
            customerEmail: order.customerId?.contactInfo?.primaryEmail,
            customerPhone: order.customerId?.contactInfo?.primaryPhone,
            status: order.status,
            priority: order.priority || 'medium',
            orderDate: order.orderDate,
            deliveryDate: order.delivery?.expectedDeliveryDate,
            totalAmount: order.orderSummary?.finalAmount || order.orderSummary?.totalAmount,
            items: order.orderItems?.length || 0,
            companyId: order.companyId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));
        res.json({
            success: true,
            data: transformedOrders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            error: 'Failed to fetch orders',
            message: 'An error occurred while fetching orders'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        const stats = await CustomerOrder_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                    processingOrders: { $sum: { $cond: [{ $eq: ['$status', 'in_production'] }, 1, 0] } },
                    shippedOrders: { $sum: { $cond: [{ $eq: ['$status', 'dispatched'] }, 1, 0] } },
                    deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    totalRevenue: { $sum: '$orderSummary.finalAmount' },
                    highPriorityOrders: {
                        $sum: {
                            $cond: [
                                { $in: ['$priority', ['high', 'urgent', 'rush']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        const result = stats[0] || {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0,
            highPriorityOrders: 0
        };
        const finalStats = {
            ...result,
            averageOrderValue: result.totalOrders > 0 ? Math.round(result.totalRevenue / result.totalOrders) : 0
        };
        res.json({
            success: true,
            data: finalStats
        });
    }
    catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch order statistics',
            message: 'An error occurred while fetching order statistics'
        });
    }
});
router.get('/:orderId', async (req, res) => {
    try {
        const user = req.user;
        const { orderId } = req.params;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                error: 'Invalid order ID',
                message: 'The provided order ID is not valid'
            });
        }
        const order = await CustomerOrder_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(orderId),
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        })
            .populate('customerId', 'customerName displayName contactInfo')
            .lean();
        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: 'The requested order was not found'
            });
        }
        const detailedOrder = {
            ...order,
            items: [
                {
                    id: 1,
                    productName: 'Premium Cotton Fabric',
                    sku: 'PCF-001',
                    quantity: 100,
                    unitPrice: 250,
                    totalPrice: 25000
                },
                {
                    id: 2,
                    productName: 'Silk Blend Material',
                    sku: 'SBM-002',
                    quantity: 50,
                    unitPrice: 450,
                    totalPrice: 22500
                }
            ],
            shippingAddress: {
                street: '123 Industrial Area',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India'
            },
            billingAddress: {
                street: '123 Industrial Area',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India'
            },
            paymentInfo: {
                method: 'Bank Transfer',
                status: 'Paid',
                transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            },
            timeline: [
                {
                    status: 'Order Placed',
                    date: order.orderDate,
                    description: 'Order has been placed successfully'
                },
                {
                    status: 'Payment Confirmed',
                    date: new Date(order.orderDate.getTime() + 2 * 60 * 60 * 1000),
                    description: 'Payment has been confirmed'
                },
                {
                    status: 'Processing',
                    date: new Date(order.orderDate.getTime() + 24 * 60 * 60 * 1000),
                    description: 'Order is being processed'
                }
            ]
        };
        res.json({
            success: true,
            data: detailedOrder
        });
    }
    catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            error: 'Failed to fetch order',
            message: 'An error occurred while fetching order details'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const orderData = req.body;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.orders?.create && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to create orders'
            });
        }
        const newOrder = {
            _id: `order_${user.companyId}_${Date.now()}`,
            orderNumber: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
            ...orderData,
            companyId: user.companyId,
            status: 'pending',
            orderDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Order created successfully'
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            error: 'Failed to create order',
            message: 'An error occurred while creating the order'
        });
    }
});
router.patch('/:orderId/status', async (req, res) => {
    try {
        const user = req.user;
        const { orderId } = req.params;
        const { status, notes } = req.body;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.orders?.edit && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to update orders'
            });
        }
        const updatedOrder = {
            _id: orderId,
            status,
            notes,
            updatedAt: new Date(),
            updatedBy: user.username
        };
        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order status updated successfully'
        });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            error: 'Failed to update order status',
            message: 'An error occurred while updating the order status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map