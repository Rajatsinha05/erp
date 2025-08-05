"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchController = void 0;
const BaseController_1 = require("./BaseController");
const DispatchService_1 = require("../services/DispatchService");
class DispatchController extends BaseController_1.BaseController {
    dispatchService;
    constructor() {
        const dispatchService = new DispatchService_1.DispatchService();
        super(dispatchService, 'Dispatch');
        this.dispatchService = dispatchService;
    }
    async createDispatch(req, res) {
        try {
            const dispatchData = req.body;
            const createdBy = req.user?.id;
            const dispatch = await this.dispatchService.createDispatch(dispatchData, createdBy);
            this.sendSuccess(res, dispatch, 'Dispatch entry created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create dispatch entry');
        }
    }
    async updateDispatchStatus(req, res) {
        try {
            const { dispatchId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const dispatch = await this.dispatchService.updateDispatchStatus(dispatchId, status, updatedBy);
            this.sendSuccess(res, dispatch, 'Dispatch status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update dispatch status');
        }
    }
    async getDispatchesByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, status, customerName, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (status) {
                options.status = status;
            }
            if (customerName) {
                options.customerName = customerName;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const dispatches = await this.dispatchService.getDispatchesByCompany(companyId.toString(), options);
            this.sendSuccess(res, dispatches, 'Dispatches retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get dispatches');
        }
    }
    async getDispatchStats(req, res) {
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
            const stats = await this.dispatchService.getDispatchStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Dispatch statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get dispatch statistics');
        }
    }
    async getDispatchById(req, res) {
        try {
            const { id } = req.params;
            const dispatch = await this.dispatchService.findById(id);
            if (!dispatch) {
                this.sendError(res, new Error('Dispatch not found'), 'Dispatch not found', 404);
                return;
            }
            this.sendSuccess(res, dispatch, 'Dispatch retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get dispatch');
        }
    }
    async updateDispatch(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const dispatch = await this.dispatchService.update(id, updateData, updatedBy);
            if (!dispatch) {
                this.sendError(res, new Error('Dispatch not found'), 'Dispatch not found', 404);
                return;
            }
            this.sendSuccess(res, dispatch, 'Dispatch updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update dispatch');
        }
    }
}
exports.DispatchController = DispatchController;
//# sourceMappingURL=DispatchController.js.map