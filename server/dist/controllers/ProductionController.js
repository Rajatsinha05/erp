"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionController = void 0;
const BaseController_1 = require("./BaseController");
const ProductionService_1 = require("../services/ProductionService");
class ProductionController extends BaseController_1.BaseController {
    productionService;
    constructor() {
        const productionService = new ProductionService_1.ProductionService();
        super(productionService, 'ProductionOrder');
        this.productionService = productionService;
    }
    async createProductionOrder(req, res) {
        try {
            const orderData = req.body;
            const createdBy = req.user?.id;
            const order = await this.productionService.createProductionOrder(orderData, createdBy);
            res.status(201).json({
                success: true,
                message: 'Production order created successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async startProduction(req, res) {
        try {
            const { orderId } = req.params;
            const startedBy = req.user?.id;
            const order = await this.productionService.startProduction(orderId, startedBy);
            res.json({
                success: true,
                message: 'Production started successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async completeStage(req, res) {
        try {
            const { orderId } = req.params;
            const { stageIndex, completionData } = req.body;
            const order = await this.productionService.completeStage(orderId, stageIndex, completionData);
            res.json({
                success: true,
                message: 'Production stage completed successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async completeProduction(req, res) {
        try {
            const { orderId } = req.params;
            const completionData = req.body;
            const order = await this.productionService.completeProduction(orderId, completionData);
            res.json({
                success: true,
                message: 'Production completed successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async cancelProduction(req, res) {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;
            const cancelledBy = req.user?.id;
            const order = await this.productionService.cancelProduction(orderId, reason, cancelledBy);
            res.json({
                success: true,
                message: 'Production cancelled successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getProductionOrdersByCompany(req, res) {
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
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (status) {
                options.status = status;
            }
            if (search) {
                options.search = search;
            }
            let query = { companyId };
            if (status) {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { productionOrderNumber: { $regex: search, $options: 'i' } },
                    { productName: { $regex: search, $options: 'i' } }
                ];
            }
            const orders = await this.productionService.findMany(query, {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            });
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
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const orders = await this.productionService.findMany({
                companyId,
                status
            }, { sort: { createdAt: -1 } });
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getProductionStats(req, res) {
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
            const stats = await this.productionService.getProductionStats(companyId.toString(), dateRange);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async updateProductionOrder(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const order = await this.productionService.update(id, updateData, updatedBy);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Production order not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Production order updated successfully',
                data: order
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getProductionOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await this.productionService.findById(id);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Production order not found'
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
            const order = await this.productionService.findOne({
                productionOrderNumber: orderNumber,
                companyId
            });
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Production order not found'
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
exports.ProductionController = ProductionController;
//# sourceMappingURL=ProductionController.js.map