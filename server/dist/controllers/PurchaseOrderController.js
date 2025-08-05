"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const BaseController_1 = require("./BaseController");
const PurchaseOrderService_1 = require("../services/PurchaseOrderService");
class PurchaseOrderController extends BaseController_1.BaseController {
    purchaseOrderService;
    constructor() {
        const purchaseOrderService = new PurchaseOrderService_1.PurchaseOrderService();
        super(purchaseOrderService, 'PurchaseOrder');
        this.purchaseOrderService = purchaseOrderService;
    }
    async createPurchaseOrder(req, res) {
        try {
            const orderData = req.body;
            const createdBy = req.user?.id;
            const order = await this.purchaseOrderService.createPurchaseOrder(orderData, createdBy);
            this.sendSuccess(res, order, 'Purchase order created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create purchase order');
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const order = await this.purchaseOrderService.updateOrderStatus(orderId, status, updatedBy);
            this.sendSuccess(res, order, 'Purchase order status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update purchase order status');
        }
    }
    async receiveItems(req, res) {
        try {
            const { orderId } = req.params;
            const { receivedItems } = req.body;
            const receivedBy = req.user?.id;
            const order = await this.purchaseOrderService.receiveItems(orderId, receivedItems, receivedBy);
            this.sendSuccess(res, order, 'Items received successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to receive items');
        }
    }
    async getOrdersBySupplier(req, res) {
        try {
            const { supplierId } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const orders = await this.purchaseOrderService.getOrdersBySupplier(supplierId, companyId.toString(), options);
            this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get purchase orders');
        }
    }
    async getOrdersByStatus(req, res) {
        try {
            const { status } = req.params;
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const orders = await this.purchaseOrderService.getOrdersByStatus(companyId.toString(), status, options);
            this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get purchase orders');
        }
    }
    async getOrderStats(req, res) {
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
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const stats = await this.purchaseOrderService.getOrderStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Purchase order statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get purchase order statistics');
        }
    }
    async getOrdersByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, status, search } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            let query = { companyId };
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
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const orders = await this.purchaseOrderService.findMany(query, options);
            this.sendSuccess(res, orders, 'Purchase orders retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get purchase orders');
        }
    }
    async updatePurchaseOrder(req, res) {
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
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update purchase order');
        }
    }
    async getPurchaseOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await this.purchaseOrderService.findById(id);
            if (!order) {
                this.sendError(res, new Error('Purchase order not found'), 'Purchase order not found', 404);
                return;
            }
            this.sendSuccess(res, order, 'Purchase order retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get purchase order');
        }
    }
    async deletePurchaseOrder(req, res) {
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
        }
        catch (error) {
            this.sendError(res, error, 'Failed to cancel purchase order');
        }
    }
}
exports.PurchaseOrderController = PurchaseOrderController;
//# sourceMappingURL=PurchaseOrderController.js.map