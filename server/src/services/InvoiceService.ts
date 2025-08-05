import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { Invoice } from '../models';
import { IInvoice } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class InvoiceService extends BaseService<IInvoice> {
  constructor() {
    super(Invoice);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: Partial<IInvoice>, createdBy?: string): Promise<IInvoice> {
    try {
      // Validate invoice data
      this.validateInvoiceData(invoiceData);

      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = await this.generateInvoiceNumberInternal(invoiceData.companyId!.toString());
      }

      // Calculate totals
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

      logger.info('Invoice created successfully', { 
        invoiceId: invoice._id, 
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customer?.customerId,
        totalAmount: invoice.amounts?.grandTotal,
        createdBy 
      });

      return invoice;
    } catch (error) {
      logger.error('Error creating invoice', { error, invoiceData, createdBy });
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId: string, status: string, updatedBy?: string): Promise<IInvoice | null> {
    try {
      const invoice = await this.findById(invoiceId);
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      // Validate status transition
      this.validateStatusTransition(invoice.status, status);

      const updateData: any = { status };

      // Set specific dates based on status
      if (status === 'sent') {
        updateData.sentAt = new Date();
      } else if (status === 'paid') {
        updateData.paidAt = new Date();
        updateData.outstandingAmount = 0;
      } else if (status === 'overdue') {
        updateData.overdueAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      const updatedInvoice = await this.update(invoiceId, updateData, updatedBy);

      logger.info('Invoice status updated', { 
        invoiceId, 
        oldStatus: invoice.status,
        newStatus: status,
        updatedBy 
      });

      return updatedInvoice;
    } catch (error) {
      logger.error('Error updating invoice status', { error, invoiceId, status, updatedBy });
      throw error;
    }
  }

  /**
   * Record payment
   */
  async recordPayment(
    invoiceId: string, 
    paymentAmount: number, 
    paymentMethod: string,
    paymentDate?: Date,
    recordedBy?: string
  ): Promise<IInvoice | null> {
    try {
      const invoice = await this.findById(invoiceId);
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      if (paymentAmount <= 0) {
        throw new AppError('Payment amount must be greater than 0', 400);
      }

      if (paymentAmount > invoice.outstandingAmount) {
        throw new AppError('Payment amount cannot exceed outstanding amount', 400);
      }

      const newOutstandingAmount = invoice.outstandingAmount - paymentAmount;
      const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;

      const paymentRecord = {
        amount: paymentAmount,
        method: paymentMethod,
        date: paymentDate || new Date(),
        recordedBy: recordedBy ? new Types.ObjectId(recordedBy) : undefined,
        recordedAt: new Date()
      };

      const updateData: any = {
        $push: { payments: paymentRecord },
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount
      };

      // Update status based on payment
      if (newOutstandingAmount === 0) {
        updateData.status = 'paid';
        updateData.paidAt = new Date();
      } else if (invoice.status === 'draft') {
        updateData.status = 'partially_paid';
      }

      const updatedInvoice = await this.update(invoiceId, updateData, recordedBy);

      logger.info('Payment recorded for invoice', { 
        invoiceId, 
        paymentAmount,
        newOutstandingAmount,
        recordedBy 
      });

      return updatedInvoice;
    } catch (error) {
      logger.error('Error recording payment', { error, invoiceId, paymentAmount, recordedBy });
      throw error;
    }
  }

  /**
   * Get invoices by customer
   */
  async getInvoicesByCustomer(customerId: string, companyId: string, options: any = {}): Promise<IInvoice[]> {
    try {
      const query = { 
        customerId: new Types.ObjectId(customerId),
        companyId: new Types.ObjectId(companyId)
      };

      return await this.findMany(query, { 
        sort: { createdAt: -1 },
        ...options 
      });
    } catch (error) {
      logger.error('Error getting invoices by customer', { error, customerId, companyId });
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(companyId: string): Promise<IInvoice[]> {
    try {
      const today = new Date();
      const query = { 
        companyId: new Types.ObjectId(companyId),
        status: { $in: ['sent', 'partially_paid'] },
        dueDate: { $lt: today },
        outstandingAmount: { $gt: 0 }
      };

      return await this.findMany(query, { sort: { dueDate: 1 } });
    } catch (error) {
      logger.error('Error getting overdue invoices', { error, companyId });
      throw error;
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(companyId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const matchQuery: any = { companyId: new Types.ObjectId(companyId) };
      
      if (dateRange) {
        matchQuery.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const [
        totalInvoices,
        invoicesByStatus,
        totalRevenue,
        totalOutstanding,
        averageInvoiceValue,
        overdueCount
      ] = await Promise.all([
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
          companyId: new Types.ObjectId(companyId),
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
    } catch (error) {
      logger.error('Error getting invoice statistics', { error, companyId, dateRange });
      throw error;
    }
  }

  /**
   * Calculate invoice totals
   */
  private calculateInvoiceTotals(items: any[]): { subtotal: number; totalTax: number; totalAmount: number } {
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

  /**
   * Generate invoice number (public method for API)
   */
  async generateInvoiceNumber(companyId: string, invoiceType: string = 'sales', financialYear?: string): Promise<string> {
    try {
      // Get company details to determine prefix
      const company = await this.model.db.collection('companies').findOne({ _id: new Types.ObjectId(companyId) });
      if (!company) {
        throw new AppError('Company not found', 404);
      }

      // Determine prefix based on company
      let prefix = 'INV';
      if (company.companyCode === 'DHL' || company.companyName.includes('Dhruval')) {
        prefix = 'DHL';
      } else if (company.companyCode === 'JCI' || company.companyName.includes('Jinal')) {
        prefix = 'JCI';
      }

      // Get current financial year if not provided
      const currentFY = financialYear || this.getCurrentFinancialYear();
      const [startYear] = currentFY.split('-');

      // Count invoices for this company in current financial year
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${parseInt(startYear) + 1}-03-31`);

      const count = await this.count({
        companyId: new Types.ObjectId(companyId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      return `${prefix}/${currentFY}/${(count + 1).toString().padStart(3, '0')}`;
    } catch (error) {
      logger.error('Error generating invoice number', { error, companyId, invoiceType });
      throw error;
    }
  }

  /**
   * Calculate invoice amounts for preview
   */
  async calculateInvoiceAmounts(invoiceData: any): Promise<any> {
    try {
      const items = invoiceData.items || [];

      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const processedItems = items.map((item: any) => {
        const itemTotal = item.quantity * item.rate;

        // Calculate discount
        let discountAmount = 0;
        if (item.discount && item.discount.value > 0) {
          if (item.discount.type === 'percentage') {
            discountAmount = (itemTotal * item.discount.value) / 100;
          } else {
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
    } catch (error) {
      logger.error('Error calculating invoice amounts', { error, invoiceData });
      throw error;
    }
  }

  /**
   * Get current financial year
   */
  private getCurrentFinancialYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Financial year starts from April (month 4)
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  /**
   * Generate invoice number (private method for internal use)
   */
  private async generateInvoiceNumberInternal(companyId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.count({
      companyId: new Types.ObjectId(companyId),
      createdAt: {
        $gte: new Date(year, today.getMonth(), 1),
        $lt: new Date(year, today.getMonth() + 1, 1)
      }
    });

    return `INV${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: { [key: string]: string[] } = {
      'draft': ['sent', 'cancelled'],
      'sent': ['paid', 'partially_paid', 'overdue', 'cancelled'],
      'partially_paid': ['paid', 'overdue', 'cancelled'],
      'paid': [],
      'overdue': ['paid', 'partially_paid', 'cancelled'],
      'cancelled': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
    }
  }

  /**
   * Validate invoice data
   */
  private validateInvoiceData(invoiceData: Partial<IInvoice>): void {
    if (!invoiceData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!invoiceData.customer?.customerId) {
      throw new AppError('Customer ID is required', 400);
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      throw new AppError('Invoice must have at least one item', 400);
    }

    if (!invoiceData.dueDate) {
      throw new AppError('Due date is required', 400);
    }

    // Validate each item
    invoiceData.items.forEach((item, index) => {
      if (!item.description) {
        throw new AppError(`Item ${index + 1}: Description is required`, 400);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new AppError(`Item ${index + 1}: Quantity must be greater than 0`, 400);
      }
      if (!item.rate || item.rate < 0) {
        throw new AppError(`Item ${index + 1}: Rate must be non-negative`, 400);
      }
    });
  }
}
