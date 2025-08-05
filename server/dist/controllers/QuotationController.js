"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationController = void 0;
const BaseController_1 = require("./BaseController");
const QuotationService_1 = require("../services/QuotationService");
class QuotationController extends BaseController_1.BaseController {
    quotationService;
    constructor() {
        const quotationService = new QuotationService_1.QuotationService();
        super(quotationService, 'Quotation');
        this.quotationService = quotationService;
    }
    async createQuotation(req, res) {
        try {
            const quotationData = req.body;
            const createdBy = req.user?.id;
            const quotation = await this.quotationService.createQuotation(quotationData, createdBy);
            this.sendSuccess(res, quotation, 'Quotation created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create quotation');
        }
    }
    async updateQuotationStatus(req, res) {
        try {
            const { quotationId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const quotation = await this.quotationService.updateQuotationStatus(quotationId, status, updatedBy);
            this.sendSuccess(res, quotation, 'Quotation status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update quotation status');
        }
    }
    async convertToOrder(req, res) {
        try {
            const { quotationId } = req.params;
            const convertedBy = req.user?.id;
            const orderData = await this.quotationService.convertToOrder(quotationId, convertedBy);
            this.sendSuccess(res, orderData, 'Quotation converted to order successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to convert quotation to order');
        }
    }
    async getQuotationsByCustomer(req, res) {
        try {
            const { customerId } = req.params;
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
            const quotations = await this.quotationService.getQuotationsByCustomer(customerId, companyId.toString(), options);
            this.sendSuccess(res, quotations, 'Quotations retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get quotations');
        }
    }
    async getExpiredQuotations(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const quotations = await this.quotationService.getExpiredQuotations(companyId.toString());
            this.sendSuccess(res, quotations, 'Expired quotations retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get expired quotations');
        }
    }
    async getQuotationStats(req, res) {
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
            const stats = await this.quotationService.getQuotationStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Quotation statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get quotation statistics');
        }
    }
    async getQuotationsByCompany(req, res) {
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
                    { quotationNumber: { $regex: search, $options: 'i' } },
                    { 'party.partyName': { $regex: search, $options: 'i' } }
                ];
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const quotations = await this.quotationService.findMany(query, options);
            this.sendSuccess(res, quotations, 'Quotations retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get quotations');
        }
    }
    async updateQuotation(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const quotation = await this.quotationService.update(id, updateData, updatedBy);
            if (!quotation) {
                this.sendError(res, new Error('Quotation not found'), 'Quotation not found', 404);
                return;
            }
            this.sendSuccess(res, quotation, 'Quotation updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update quotation');
        }
    }
    async getQuotationById(req, res) {
        try {
            const { id } = req.params;
            const quotation = await this.quotationService.findById(id);
            if (!quotation) {
                this.sendError(res, new Error('Quotation not found'), 'Quotation not found', 404);
                return;
            }
            this.sendSuccess(res, quotation, 'Quotation retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get quotation');
        }
    }
    async deleteQuotation(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const quotation = await this.quotationService.update(id, {
                status: 'cancelled',
                cancelledAt: new Date()
            }, deletedBy);
            if (!quotation) {
                this.sendError(res, new Error('Quotation not found'), 'Quotation not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Quotation cancelled successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to cancel quotation');
        }
    }
}
exports.QuotationController = QuotationController;
//# sourceMappingURL=QuotationController.js.map