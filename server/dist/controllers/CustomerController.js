"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const BaseController_1 = require("./BaseController");
const CustomerService_1 = require("../services/CustomerService");
class CustomerController extends BaseController_1.BaseController {
    customerService;
    constructor() {
        const customerService = new CustomerService_1.CustomerService();
        super(customerService, 'Customer');
        this.customerService = customerService;
    }
    async createCustomer(req, res) {
        try {
            const customerData = req.body;
            const createdBy = req.user?.id;
            const customer = await this.customerService.createCustomer(customerData, createdBy);
            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: customer
            });
        }
        catch (error) {
            this.sendError(res, error, 'Operation failed');
        }
    }
    async getCustomerByCode(req, res) {
        try {
            const { customerCode } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const customer = await this.customerService.getCustomerByCode(customerCode, companyId.toString());
            if (!customer) {
                this.sendError(res, new Error('Customer not found'), 'Customer not found', 404);
                return;
            }
            this.sendSuccess(res, customer, 'Customer retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get customer');
        }
    }
    async getCustomersByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, search, status } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (search) {
                options.search = search;
            }
            if (status) {
                options.status = status;
            }
            const customers = await this.customerService.getCustomersByCompany(companyId.toString(), options);
            this.sendSuccess(res, customers, 'Customers retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get customers');
        }
    }
    async updateCustomer(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const customer = await this.customerService.update(id, updateData, updatedBy);
            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Customer updated successfully',
                data: customer
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update customer');
        }
    }
    async updateCreditLimit(req, res) {
        try {
            const { id } = req.params;
            const { creditLimit } = req.body;
            const updatedBy = req.user?.id;
            const customer = await this.customerService.updateCreditLimit(id, creditLimit, updatedBy);
            if (!customer) {
                this.sendError(res, new Error('Customer not found'), 'Customer not found', 404);
                return;
            }
            this.sendSuccess(res, customer, 'Credit limit updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update credit limit');
        }
    }
    async getCustomerStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const stats = await this.customerService.getCustomerStats(companyId.toString());
            this.sendSuccess(res, stats, 'Customer statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get customer statistics');
        }
    }
    async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const customer = await this.customerService.update(id, {
                isActive: false,
                deletedAt: new Date()
            }, deletedBy);
            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Customer deleted successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete customer');
        }
    }
    async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            const customer = await this.customerService.findById(id);
            if (!customer) {
                this.sendError(res, new Error('Customer not found'), 'Customer not found', 404);
                return;
            }
            this.sendSuccess(res, customer, 'Customer retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get customer');
        }
    }
    async searchCustomers(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { q: searchTerm, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!searchTerm) {
                this.sendError(res, new Error('Search term is required'), 'Search term is required', 400);
                return;
            }
            const customers = await this.customerService.findMany({
                companyId,
                $or: [
                    { customerName: { $regex: searchTerm, $options: 'i' } },
                    { customerCode: { $regex: searchTerm, $options: 'i' } },
                    { 'contactInfo.emails.label': { $regex: searchTerm, $options: 'i' } }
                ],
                isActive: true
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, customers, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search customers');
        }
    }
}
exports.CustomerController = CustomerController;
//# sourceMappingURL=CustomerController.js.map