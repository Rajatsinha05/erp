"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const query_optimizer_1 = __importDefault(require("../utils/query-optimizer"));
class CustomerService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Customer);
    }
    async createCustomer(customerData, createdBy) {
        try {
            this.validateCustomerData(customerData);
            if (customerData.customerCode) {
                const existingCustomer = await this.findOne({
                    customerCode: customerData.customerCode.toUpperCase(),
                    companyId: customerData.companyId
                });
                if (existingCustomer) {
                    throw new errors_1.AppError('Customer code already exists', 400);
                }
            }
            if (customerData.contactInfo?.primaryEmail) {
                const existingEmail = await this.findOne({
                    'contactInfo.primaryEmail': customerData.contactInfo.primaryEmail,
                    companyId: customerData.companyId
                });
                if (existingEmail) {
                    throw new errors_1.AppError('Customer with this email already exists', 400);
                }
            }
            if (!customerData.customerCode) {
                customerData.customerCode = await this.generateCustomerCode(customerData.companyId.toString());
            }
            const customer = await this.create({
                ...customerData,
                customerCode: customerData.customerCode.toUpperCase(),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Customer created successfully', {
                customerId: customer._id,
                customerCode: customer.customerCode,
                companyId: customerData.companyId,
                createdBy
            });
            return customer;
        }
        catch (error) {
            logger_1.logger.error('Error creating customer', { error, customerData, createdBy });
            throw error;
        }
    }
    async getCustomerByCode(customerCode, companyId) {
        try {
            return await this.findOne({
                customerCode: customerCode.toUpperCase(),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting customer by code', { error, customerCode, companyId });
            throw error;
        }
    }
    async getCustomersByCompany(companyId, options = {}) {
        try {
            const startTime = Date.now();
            const filter = query_optimizer_1.default.createCompanyFilter(companyId, {
                isActive: true,
                ...query_optimizer_1.default.sanitizeFilter(options.filter || {})
            });
            const queryOptions = query_optimizer_1.default.optimizeFindOptions({
                ...options,
                lean: true,
                sort: options.sort || { customerName: 1 }
            });
            const customers = await this.findManyLean(filter, queryOptions);
            query_optimizer_1.default.logQueryPerformance('getCustomersByCompany', startTime, customers.length, { companyId });
            return customers;
        }
        catch (error) {
            logger_1.logger.error('Error getting customers by company', { error, companyId });
            throw error;
        }
    }
    async updateCreditLimit(customerId, creditLimit, updatedBy) {
        try {
            const customer = await this.findById(customerId);
            if (!customer) {
                throw new errors_1.AppError('Customer not found', 404);
            }
            const updatedCustomer = await this.update(customerId, {
                'creditInfo.creditLimit': creditLimit,
                'creditInfo.lastCreditReview': new Date()
            }, updatedBy);
            logger_1.logger.info('Customer credit limit updated', {
                customerId,
                creditLimit,
                updatedBy
            });
            return updatedCustomer;
        }
        catch (error) {
            logger_1.logger.error('Error updating customer credit limit', { error, customerId, creditLimit, updatedBy });
            throw error;
        }
    }
    async getCustomerStats(companyId) {
        try {
            const startTime = Date.now();
            const pipeline = query_optimizer_1.default.optimizeAggregationPipeline([
                {
                    $match: query_optimizer_1.default.createCompanyFilter(companyId)
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
            query_optimizer_1.default.logQueryPerformance('getCustomerStats', startTime, 1, { companyId });
            return {
                totalCustomers: totalStats.totalCustomers || 0,
                activeCustomers: totalStats.activeCustomers || 0,
                inactiveCustomers: totalStats.inactiveCustomers || 0,
                totalCreditLimit: financialStats.totalCreditLimit || 0,
                totalOutstanding: financialStats.totalOutstanding || 0,
                averageCreditLimit: financialStats.avgCreditLimit || 0,
                averageOutstanding: financialStats.avgOutstanding || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting customer statistics', { error, companyId });
            throw error;
        }
    }
    async generateCustomerCode(companyId) {
        const count = await this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) });
        return `CUST${(count + 1).toString().padStart(6, '0')}`;
    }
    validateCustomerData(customerData) {
        if (!customerData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!customerData.customerName) {
            throw new errors_1.AppError('Customer name is required', 400);
        }
        if (!customerData.contactInfo?.primaryEmail) {
            throw new errors_1.AppError('Primary email is required', 400);
        }
        if (!customerData.contactInfo?.primaryPhone) {
            throw new errors_1.AppError('Primary phone number is required', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.contactInfo.primaryEmail)) {
            throw new errors_1.AppError('Invalid email format', 400);
        }
        if (customerData.financialInfo?.creditLimit && customerData.financialInfo.creditLimit < 0) {
            throw new errors_1.AppError('Credit limit cannot be negative', 400);
        }
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=CustomerService.js.map