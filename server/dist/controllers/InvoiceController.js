"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const BaseController_1 = require("./BaseController");
const InvoiceService_1 = require("../services/InvoiceService");
class InvoiceController extends BaseController_1.BaseController {
    invoiceService;
    constructor() {
        const invoiceService = new InvoiceService_1.InvoiceService();
        super(invoiceService, 'Invoice');
        this.invoiceService = invoiceService;
    }
    async createInvoice(req, res) {
        try {
            const invoiceData = req.body;
            const createdBy = req.user?.id;
            const invoice = await this.invoiceService.createInvoice(invoiceData, createdBy);
            this.sendSuccess(res, invoice, 'Invoice created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create invoice');
        }
    }
    async updateInvoiceStatus(req, res) {
        try {
            const { invoiceId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const invoice = await this.invoiceService.updateInvoiceStatus(invoiceId, status, updatedBy);
            this.sendSuccess(res, invoice, 'Invoice status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update invoice status');
        }
    }
    async recordPayment(req, res) {
        try {
            const { invoiceId } = req.params;
            const { paymentAmount, paymentMethod, paymentDate } = req.body;
            const recordedBy = req.user?.id;
            const invoice = await this.invoiceService.recordPayment(invoiceId, paymentAmount, paymentMethod, paymentDate, recordedBy);
            this.sendSuccess(res, invoice, 'Payment recorded successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to record payment');
        }
    }
    async getInvoicesByCustomer(req, res) {
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
            const invoices = await this.invoiceService.getInvoicesByCustomer(customerId, companyId.toString(), options);
            this.sendSuccess(res, invoices, 'Invoices retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get invoices');
        }
    }
    async getOverdueInvoices(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const invoices = await this.invoiceService.getOverdueInvoices(companyId.toString());
            this.sendSuccess(res, invoices, 'Overdue invoices retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get overdue invoices');
        }
    }
    async getInvoiceStats(req, res) {
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
            const stats = await this.invoiceService.getInvoiceStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Invoice statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get invoice statistics');
        }
    }
    async getInvoicesByCompany(req, res) {
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
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { 'customer.customerName': { $regex: search, $options: 'i' } }
                ];
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const invoices = await this.invoiceService.findMany(query, options);
            this.sendSuccess(res, invoices, 'Invoices retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get invoices');
        }
    }
    async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const invoice = await this.invoiceService.update(id, updateData, updatedBy);
            if (!invoice) {
                this.sendError(res, new Error('Invoice not found'), 'Invoice not found', 404);
                return;
            }
            this.sendSuccess(res, invoice, 'Invoice updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update invoice');
        }
    }
    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await this.invoiceService.findById(id);
            if (!invoice) {
                this.sendError(res, new Error('Invoice not found'), 'Invoice not found', 404);
                return;
            }
            this.sendSuccess(res, invoice, 'Invoice retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get invoice');
        }
    }
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const invoice = await this.invoiceService.update(id, {
                status: 'cancelled',
                cancelledAt: new Date()
            }, deletedBy);
            if (!invoice) {
                this.sendError(res, new Error('Invoice not found'), 'Invoice not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Invoice cancelled successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to cancel invoice');
        }
    }
    async generateInvoiceNumber(req, res) {
        try {
            const { companyId, invoiceType, financialYear } = req.body;
            if (!companyId || !invoiceType) {
                this.sendError(res, new Error('Company ID and invoice type are required'), 'Missing required fields', 400);
                return;
            }
            const invoiceNumber = await this.invoiceService.generateInvoiceNumber(companyId, invoiceType, financialYear);
            this.sendSuccess(res, {
                invoiceNumber,
                financialYear: financialYear || this.getCurrentFinancialYear()
            }, 'Invoice number generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate invoice number');
        }
    }
    async generateInvoicePDF(req, res) {
        try {
            const { id } = req.params;
            const invoice = await this.invoiceService.findById(id);
            if (!invoice) {
                this.sendError(res, new Error('Invoice not found'), 'Invoice not found', 404);
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
            const pdfContent = `PDF content for invoice ${invoice.invoiceNumber}`;
            res.send(Buffer.from(pdfContent));
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate PDF');
        }
    }
    async previewInvoice(req, res) {
        try {
            const invoiceData = req.body;
            const previewData = await this.invoiceService.calculateInvoiceAmounts(invoiceData);
            this.sendSuccess(res, previewData, 'Invoice preview generated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to generate invoice preview');
        }
    }
    getCurrentFinancialYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (month >= 4) {
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
        else {
            return `${year - 1}-${year.toString().slice(-2)}`;
        }
    }
}
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=InvoiceController.js.map