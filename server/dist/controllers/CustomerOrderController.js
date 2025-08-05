"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerOrderController = void 0;
const BaseController_1 = require("./BaseController");
const CustomerOrderService_1 = require("../services/CustomerOrderService");
class CustomerOrderController extends BaseController_1.BaseController {
    customerOrderService;
    constructor() {
        const customerOrderService = new CustomerOrderService_1.CustomerOrderService();
        super(customerOrderService, 'CustomerOrder');
        this.customerOrderService = customerOrderService;
    }
    async createCustomerOrder(req, res) {
        try {
            const orderData = req.body;
            const createdBy = req.user?.id;
            const order = await this.customerOrderService.createCustomerOrder(orderData, createdBy);
            res.status(201).json({
                success: true,
                message: 'Customer order created successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const order = await this.customerOrderService.updateOrderStatus(orderId, status, updatedBy);
            res.json({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getOrdersByCustomer(req, res) {
        try {
            const { customerId } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10 } = req.query;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const orders = await this.customerOrderService.getOrdersByCustomer(customerId, companyId.toString(), options);
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getOrdersByStatus(req, res) {
        try {
            const { status } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10 } = req.query;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const orders = await this.customerOrderService.getOrdersByStatus(companyId.toString(), status, options);
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getOrderStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { startDate, endDate } = req.query;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            let dateRange;
            if (startDate && endDate) {
                dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const stats = await this.customerOrderService.getOrderStats(companyId.toString(), dateRange);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getOrdersByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, status, search } = req.query;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            let query = { companyId };
            if (status) {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { orderNumber: { $regex: search, $options: 'i' } },
                    { 'customer.customerName': { $regex: search, $options: 'i' } }
                ];
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const orders = await this.customerOrderService.findMany(query, options);
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async updateCustomerOrder(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const order = await this.customerOrderService.update(id, updateData, updatedBy);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Customer order not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Customer order updated successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getCustomerOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await this.customerOrderService.findById(id);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Customer order not found'
                });
                return;
            }
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async deleteCustomerOrder(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const order = await this.customerOrderService.update(id, {
                status: 'cancelled',
                cancelledAt: new Date()
            }, deletedBy);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Customer order not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Customer order cancelled successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getOrderByNumber(req, res) {
        try {
            const { orderNumber } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const order = await this.customerOrderService.findOne({
                orderNumber,
                companyId
            });
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Customer order not found'
                });
                return;
            }
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
}
exports.CustomerOrderController = CustomerOrderController;
//# sourceMappingURL=CustomerOrderController.js.map