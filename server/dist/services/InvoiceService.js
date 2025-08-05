"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class InvoiceService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Invoice);
    }
    async createInvoice(invoiceData, createdBy) {
        try {
            this.validateInvoiceData(invoiceData);
            if (!invoiceData.invoiceNumber) {
                invoiceData.invoiceNumber = await this.generateInvoiceNumberInternal(invoiceData.companyId.toString());
            }
            const totals = this.calculateInvoiceTotals(invoiceData.items || []);
            const invoice = await this.create({
                ...invoiceData,
                invoiceNumber: invoiceData.invoiceNumber,
                status: 'draft',
                amounts: {
                    subtotal: totals.subtotal,
                    totalTaxAmount: totals.totalTax,
                    grandTotal: totals.totalAmount,
                    balanceAmount: totals.totalAmount,
                    totalDiscount: 0,
                    taxableAmount: totals.subtotal,
                    roundingAdjustment: 0,
                    advanceReceived: 0
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Invoice created successfully', {
                invoiceId: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                customerId: invoice.customer?.customerId,
                totalAmount: invoice.amounts?.grandTotal,
                createdBy
            });
            return invoice;
        }
        catch (error) {
            logger_1.logger.error('Error creating invoice', { error, invoiceData, createdBy });
            throw error;
        }
    }
    async updateInvoiceStatus(invoiceId, status, updatedBy) {
        try {
            const invoice = await this.findById(invoiceId);
            if (!invoice) {
                throw new errors_1.AppError('Invoice not found', 404);
            }
            this.validateStatusTransition(invoice.status, status);
            const updateData = { status };
            if (status === 'sent') {
                updateData.sentAt = new Date();
            }
            else if (status === 'paid') {
                updateData.paidAt = new Date();
                updateData.outstandingAmount = 0;
            }
            else if (status === 'overdue') {
                updateData.overdueAt = new Date();
            }
            else if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
            }
            const updatedInvoice = await this.update(invoiceId, updateData, updatedBy);
            logger_1.logger.info('Invoice status updated', {
                invoiceId,
                oldStatus: invoice.status,
                newStatus: status,
                updatedBy
            });
            return updatedInvoice;
        }
        catch (error) {
            logger_1.logger.error('Error updating invoice status', { error, invoiceId, status, updatedBy });
            throw error;
        }
    }
    async recordPayment(invoiceId, paymentAmount, paymentMethod, paymentDate, recordedBy) {
        try {
            const invoice = await this.findById(invoiceId);
            if (!invoice) {
                throw new errors_1.AppError('Invoice not found', 404);
            }
            if (paymentAmount <= 0) {
                throw new errors_1.AppError('Payment amount must be greater than 0', 400);
            }
            if (paymentAmount > invoice.outstandingAmount) {
                throw new errors_1.AppError('Payment amount cannot exceed outstanding amount', 400);
            }
            const newOutstandingAmount = invoice.outstandingAmount - paymentAmount;
            const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
            const paymentRecord = {
                amount: paymentAmount,
                method: paymentMethod,
                date: paymentDate || new Date(),
                recordedBy: recordedBy ? new mongoose_1.Types.ObjectId(recordedBy) : undefined,
                recordedAt: new Date()
            };
            const updateData = {
                $push: { payments: paymentRecord },
                paidAmount: newPaidAmount,
                outstandingAmount: newOutstandingAmount
            };
            if (newOutstandingAmount === 0) {
                updateData.status = 'paid';
                updateData.paidAt = new Date();
            }
            else if (invoice.status === 'draft') {
                updateData.status = 'partially_paid';
            }
            const updatedInvoice = await this.update(invoiceId, updateData, recordedBy);
            logger_1.logger.info('Payment recorded for invoice', {
                invoiceId,
                paymentAmount,
                newOutstandingAmount,
                recordedBy
            });
            return updatedInvoice;
        }
        catch (error) {
            logger_1.logger.error('Error recording payment', { error, invoiceId, paymentAmount, recordedBy });
            throw error;
        }
    }
    async getInvoicesByCustomer(customerId, companyId, options = {}) {
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
            logger_1.logger.error('Error getting invoices by customer', { error, customerId, companyId });
            throw error;
        }
    }
    async getOverdueInvoices(companyId) {
        try {
            const today = new Date();
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                status: { $in: ['sent', 'partially_paid'] },
                dueDate: { $lt: today },
                outstandingAmount: { $gt: 0 }
            };
            return await this.findMany(query, { sort: { dueDate: 1 } });
        }
        catch (error) {
            logger_1.logger.error('Error getting overdue invoices', { error, companyId });
            throw error;
        }
    }
    async getInvoiceStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalInvoices, invoicesByStatus, totalRevenue, totalOutstanding, averageInvoiceValue, overdueCount] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$totalAmount' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, status: 'paid' } },
                    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
                ]),
                this.model.aggregate([
                    { $match: { ...matchQuery, outstandingAmount: { $gt: 0 } } },
                    { $group: { _id: null, totalOutstanding: { $sum: '$outstandingAmount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, avgInvoiceValue: { $avg: '$totalAmount' } } }
                ]),
                this.count({
                    companyId: new mongoose_1.Types.ObjectId(companyId),
                    status: { $in: ['sent', 'partially_paid'] },
                    dueDate: { $lt: new Date() },
                    outstandingAmount: { $gt: 0 }
                })
            ]);
            return {
                totalInvoices,
                invoicesByStatus,
                totalRevenue: totalRevenue[0]?.totalRevenue || 0,
                totalOutstanding: totalOutstanding[0]?.totalOutstanding || 0,
                averageInvoiceValue: averageInvoiceValue[0]?.avgInvoiceValue || 0,
                overdueCount
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting invoice statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    calculateInvoiceTotals(items) {
        let subtotal = 0;
        let totalTax = 0;
        items.forEach(item => {
            const itemTotal = item.quantity * item.rate;
            const itemTax = itemTotal * (item.taxBreakup?.[0]?.rate || 0) / 100;
            subtotal += itemTotal;
            totalTax += itemTax;
        });
        const totalAmount = subtotal + totalTax;
        return { subtotal, totalTax, totalAmount };
    }
    async generateInvoiceNumber(companyId, invoiceType = 'sales', financialYear) {
        try {
            const company = await this.model.db.collection('companies').findOne({ _id: new mongoose_1.Types.ObjectId(companyId) });
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            let prefix = 'INV';
            if (company.companyCode === 'DHL' || company.companyName.includes('Dhruval')) {
                prefix = 'DHL';
            }
            else if (company.companyCode === 'JCI' || company.companyName.includes('Jinal')) {
                prefix = 'JCI';
            }
            const currentFY = financialYear || this.getCurrentFinancialYear();
            const [startYear] = currentFY.split('-');
            const startDate = new Date(`${startYear}-04-01`);
            const endDate = new Date(`${parseInt(startYear) + 1}-03-31`);
            const count = await this.count({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
            return `${prefix}/${currentFY}/${(count + 1).toString().padStart(3, '0')}`;
        }
        catch (error) {
            logger_1.logger.error('Error generating invoice number', { error, companyId, invoiceType });
            throw error;
        }
    }
    async calculateInvoiceAmounts(invoiceData) {
        try {
            const items = invoiceData.items || [];
            let subtotal = 0;
            let totalDiscount = 0;
            let totalTax = 0;
            const processedItems = items.map((item) => {
                const itemTotal = item.quantity * item.rate;
                let discountAmount = 0;
                if (item.discount && item.discount.value > 0) {
                    if (item.discount.type === 'percentage') {
                        discountAmount = (itemTotal * item.discount.value) / 100;
                    }
                    else {
                        discountAmount = item.discount.value;
                    }
                }
                const taxableAmount = itemTotal - discountAmount;
                const taxAmount = (taxableAmount * (item.taxRate || 0)) / 100;
                const lineTotal = taxableAmount + taxAmount;
                subtotal += itemTotal;
                totalDiscount += discountAmount;
                totalTax += taxAmount;
                return {
                    ...item,
                    discountAmount,
                    taxableAmount,
                    totalTaxAmount: taxAmount,
                    lineTotal,
                    taxBreakup: [{
                            taxType: 'IGST',
                            rate: item.taxRate || 0,
                            amount: taxAmount
                        }]
                };
            });
            const taxableAmount = subtotal - totalDiscount;
            const grandTotal = taxableAmount + totalTax;
            return {
                ...invoiceData,
                items: processedItems,
                amounts: {
                    subtotal,
                    totalDiscount,
                    taxableAmount,
                    totalTaxAmount: totalTax,
                    roundingAdjustment: 0,
                    grandTotal,
                    advanceReceived: 0,
                    balanceAmount: grandTotal
                },
                taxDetails: {
                    taxBreakup: [{
                            taxType: 'IGST',
                            rate: items[0]?.taxRate || 0,
                            taxableAmount,
                            taxAmount: totalTax
                        }],
                    totalTaxAmount: totalTax,
                    tdsAmount: 0,
                    tcsAmount: 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculating invoice amounts', { error, invoiceData });
            throw error;
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
    async generateInvoiceNumberInternal(companyId) {
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
        return `INV${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'draft': ['sent', 'cancelled'],
            'sent': ['paid', 'partially_paid', 'overdue', 'cancelled'],
            'partially_paid': ['paid', 'overdue', 'cancelled'],
            'paid': [],
            'overdue': ['paid', 'partially_paid', 'cancelled'],
            'cancelled': []
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new errors_1.AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
        }
    }
    validateInvoiceData(invoiceData) {
        if (!invoiceData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!invoiceData.customer?.customerId) {
            throw new errors_1.AppError('Customer ID is required', 400);
        }
        if (!invoiceData.items || invoiceData.items.length === 0) {
            throw new errors_1.AppError('Invoice must have at least one item', 400);
        }
        if (!invoiceData.dueDate) {
            throw new errors_1.AppError('Due date is required', 400);
        }
        invoiceData.items.forEach((item, index) => {
            if (!item.description) {
                throw new errors_1.AppError(`Item ${index + 1}: Description is required`, 400);
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
exports.InvoiceService = InvoiceService;
//# sourceMappingURL=InvoiceService.js.map