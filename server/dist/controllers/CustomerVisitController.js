"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerVisitController = void 0;
const CustomerVisitService_1 = require("../services/CustomerVisitService");
class CustomerVisitController {
    customerVisitService;
    constructor() {
        this.customerVisitService = new CustomerVisitService_1.CustomerVisitService();
    }
    sendSuccess(res, data, message, statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }
    sendError(res, error, message, statusCode = 500) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error.message || error
        });
    }
    async createCustomerVisit(req, res) {
        try {
            const visitData = req.body;
            const createdBy = req.user?.id;
            const visit = await this.customerVisitService.createCustomerVisit(visitData, createdBy);
            this.sendSuccess(res, visit, 'Customer visit created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create customer visit');
        }
    }
    async getAllCustomerVisits(req, res) {
        try {
            const { page = 1, limit = 10, search, purpose, travelType, approvalStatus, dateFrom, dateTo, sortBy = 'visitDate', sortOrder = 'desc' } = req.query;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
                return;
            }
            const query = { companyId };
            if (search) {
                query.$or = [
                    { partyName: { $regex: search, $options: 'i' } },
                    { contactPerson: { $regex: search, $options: 'i' } },
                    { purposeDescription: { $regex: search, $options: 'i' } }
                ];
            }
            if (purpose)
                query.purpose = purpose;
            if (travelType)
                query.travelType = travelType;
            if (approvalStatus)
                query.approvalStatus = approvalStatus;
            if (dateFrom || dateTo) {
                query.visitDate = {};
                if (dateFrom)
                    query.visitDate.$gte = new Date(dateFrom);
                if (dateTo)
                    query.visitDate.$lte = new Date(dateTo);
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
                populate: [
                    { path: 'createdBy', select: 'firstName lastName email' },
                    { path: 'approvedBy', select: 'firstName lastName email' },
                    { path: 'companyId', select: 'companyName companyCode address phone email' }
                ]
            };
            const result = await this.customerVisitService.findManyWithPagination(query, options);
            res.status(200).json(result);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to retrieve customer visits');
        }
    }
    async getCustomerVisitById(req, res) {
        try {
            const { id } = req.params;
            const visit = await this.customerVisitService.findById(id);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Customer visit retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to retrieve customer visit');
        }
    }
    async updateCustomerVisit(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const visit = await this.customerVisitService.update(id, updateData, updatedBy);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Customer visit updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update customer visit');
        }
    }
    async deleteCustomerVisit(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.customerVisitService.delete(id);
            if (!deleted) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Customer visit deleted successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete customer visit');
        }
    }
    async approveVisit(req, res) {
        try {
            const { id } = req.params;
            const { reimbursementAmount } = req.body;
            const approvedBy = req.user?.id;
            const visit = await this.customerVisitService.approveVisit(id, approvedBy, reimbursementAmount);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Customer visit approved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to approve customer visit');
        }
    }
    async rejectVisit(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const rejectedBy = req.user?.id;
            const visit = await this.customerVisitService.rejectVisit(id, rejectedBy, reason);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Customer visit rejected successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to reject customer visit');
        }
    }
    async markAsReimbursed(req, res) {
        try {
            const { id } = req.params;
            const reimbursedBy = req.user?.id;
            const visit = await this.customerVisitService.markAsReimbursed(id, reimbursedBy);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Customer visit marked as reimbursed successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to mark customer visit as reimbursed');
        }
    }
    async addFoodExpense(req, res) {
        try {
            const { id } = req.params;
            const expenseData = req.body;
            const updatedBy = req.user?.id;
            const visit = await this.customerVisitService.addFoodExpense(id, expenseData, updatedBy);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Food expense added successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to add food expense');
        }
    }
    async addGift(req, res) {
        try {
            const { id } = req.params;
            const giftData = req.body;
            const updatedBy = req.user?.id;
            const visit = await this.customerVisitService.addGift(id, giftData, updatedBy);
            if (!visit) {
                this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
                return;
            }
            this.sendSuccess(res, visit, 'Gift/sample added successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to add gift/sample');
        }
    }
    async getExpenseStats(req, res) {
        try {
            const { dateFrom, dateTo } = req.query;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
                return;
            }
            const startDate = dateFrom ? new Date(dateFrom) : undefined;
            const endDate = dateTo ? new Date(dateTo) : undefined;
            const stats = await this.customerVisitService.getExpenseStats(companyId.toString(), startDate, endDate);
            this.sendSuccess(res, stats, 'Expense statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to retrieve expense statistics');
        }
    }
    async getPendingApprovals(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
                return;
            }
            const visits = await this.customerVisitService.getPendingApprovals(companyId.toString());
            this.sendSuccess(res, visits, 'Pending approvals retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to retrieve pending approvals');
        }
    }
}
exports.CustomerVisitController = CustomerVisitController;
//# sourceMappingURL=CustomerVisitController.js.map