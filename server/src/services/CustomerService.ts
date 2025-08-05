import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { Customer } from '../models';
import { ICustomer } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import QueryOptimizer from '../utils/query-optimizer';

export class CustomerService extends BaseService<ICustomer> {
  constructor() {
    super(Customer);
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: Partial<ICustomer>, createdBy?: string): Promise<ICustomer> {
    try {
      // Validate customer data
      this.validateCustomerData(customerData);

      // Check if customer code already exists
      if (customerData.customerCode) {
        const existingCustomer = await this.findOne({ 
          customerCode: customerData.customerCode.toUpperCase(),
          companyId: customerData.companyId 
        });

        if (existingCustomer) {
          throw new AppError('Customer code already exists', 400);
        }
      }

      // Check if primary email already exists
      if (customerData.contactInfo?.primaryEmail) {
        const existingEmail = await this.findOne({
          'contactInfo.primaryEmail': customerData.contactInfo.primaryEmail,
          companyId: customerData.companyId
        });

        if (existingEmail) {
          throw new AppError('Customer with this email already exists', 400);
        }
      }

      // Generate customer code if not provided
      if (!customerData.customerCode) {
        customerData.customerCode = await this.generateCustomerCode(customerData.companyId!.toString());
      }

      const customer = await this.create({
        ...customerData,
        customerCode: customerData.customerCode.toUpperCase(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, createdBy);

      logger.info('Customer created successfully', { 
        customerId: customer._id, 
        customerCode: customer.customerCode,
        companyId: customerData.companyId,
        createdBy 
      });

      return customer;
    } catch (error) {
      logger.error('Error creating customer', { error, customerData, createdBy });
      throw error;
    }
  }

  /**
   * Get customer by code
   */
  async getCustomerByCode(customerCode: string, companyId: string): Promise<ICustomer | null> {
    try {
      return await this.findOne({ 
        customerCode: customerCode.toUpperCase(),
        companyId: new Types.ObjectId(companyId)
      });
    } catch (error) {
      logger.error('Error getting customer by code', { error, customerCode, companyId });
      throw error;
    }
  }

  /**
   * Get customers by company with optimization
   */
  async getCustomersByCompany(companyId: string, options: any = {}): Promise<ICustomer[]> {
    try {
      const startTime = Date.now();

      // Build optimized filter
      const filter = QueryOptimizer.createCompanyFilter(companyId, {
        isActive: true,
        ...QueryOptimizer.sanitizeFilter(options.filter || {})
      });

      // Optimize query options
      const queryOptions = QueryOptimizer.optimizeFindOptions({
        ...options,
        lean: true, // Use lean queries for better performance
        sort: options.sort || { customerName: 1 }
      });

      // Use lean query for better performance
      const customers = await this.findManyLean(filter, queryOptions);

      QueryOptimizer.logQueryPerformance('getCustomersByCompany', startTime, customers.length, { companyId });

      return customers;
    } catch (error) {
      logger.error('Error getting customers by company', { error, companyId });
      throw error;
    }
  }

  /**
   * Update customer credit limit
   */
  async updateCreditLimit(customerId: string, creditLimit: number, updatedBy?: string): Promise<ICustomer | null> {
    try {
      const customer = await this.findById(customerId);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const updatedCustomer = await this.update(customerId, {
        'creditInfo.creditLimit': creditLimit,
        'creditInfo.lastCreditReview': new Date()
      }, updatedBy);

      logger.info('Customer credit limit updated', { 
        customerId, 
        creditLimit,
        updatedBy 
      });

      return updatedCustomer;
    } catch (error) {
      logger.error('Error updating customer credit limit', { error, customerId, creditLimit, updatedBy });
      throw error;
    }
  }

  /**
   * Get customer statistics with optimization
   */
  async getCustomerStats(companyId: string): Promise<any> {
    try {
      const startTime = Date.now();

      // Use single optimized aggregation pipeline for better performance
      const pipeline = QueryOptimizer.optimizeAggregationPipeline([
        {
          $match: QueryOptimizer.createCompanyFilter(companyId)
        },
        {
          $facet: {
            totalStats: [
              {
                $group: {
                  _id: null,
                  totalCustomers: { $sum: 1 },
                  activeCustomers: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                  },
                  inactiveCustomers: {
                    $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
                  }
                }
              }
            ],
            financialStats: [
              { $match: { isActive: true } },
              {
                $group: {
                  _id: null,
                  totalCreditLimit: { $sum: '$financialInfo.creditLimit' },
                  totalOutstanding: { $sum: '$financialInfo.outstandingAmount' },
                  avgCreditLimit: { $avg: '$financialInfo.creditLimit' },
                  avgOutstanding: { $avg: '$financialInfo.outstandingAmount' }
                }
              }
            ]
          }
        }
      ]);

      const [result] = await this.aggregate(pipeline);
      const totalStats = result.totalStats[0] || {};
      const financialStats = result.financialStats[0] || {};

      QueryOptimizer.logQueryPerformance('getCustomerStats', startTime, 1, { companyId });

      return {
        totalCustomers: totalStats.totalCustomers || 0,
        activeCustomers: totalStats.activeCustomers || 0,
        inactiveCustomers: totalStats.inactiveCustomers || 0,
        totalCreditLimit: financialStats.totalCreditLimit || 0,
        totalOutstanding: financialStats.totalOutstanding || 0,
        averageCreditLimit: financialStats.avgCreditLimit || 0,
        averageOutstanding: financialStats.avgOutstanding || 0
      };
    } catch (error) {
      logger.error('Error getting customer statistics', { error, companyId });
      throw error;
    }
  }

  /**
   * Generate customer code
   */
  private async generateCustomerCode(companyId: string): Promise<string> {
    const count = await this.count({ companyId: new Types.ObjectId(companyId) });
    return `CUST${(count + 1).toString().padStart(6, '0')}`;
  }

  /**
   * Validate customer data
   */
  private validateCustomerData(customerData: Partial<ICustomer>): void {
    if (!customerData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!customerData.customerName) {
      throw new AppError('Customer name is required', 400);
    }

    if (!customerData.contactInfo?.primaryEmail) {
      throw new AppError('Primary email is required', 400);
    }

    if (!customerData.contactInfo?.primaryPhone) {
      throw new AppError('Primary phone number is required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.contactInfo.primaryEmail)) {
      throw new AppError('Invalid email format', 400);
    }

    if (customerData.financialInfo?.creditLimit && customerData.financialInfo.creditLimit < 0) {
      throw new AppError('Credit limit cannot be negative', 400);
    }
  }
}
