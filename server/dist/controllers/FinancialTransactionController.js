"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialTransactionController = void 0;
const BaseController_1 = require("./BaseController");
const FinancialTransactionService_1 = require("../services/FinancialTransactionService");
class FinancialTransactionController extends BaseController_1.BaseController {
    financialTransactionService;
    constructor() {
        const financialTransactionService = new FinancialTransactionService_1.FinancialTransactionService();
        super(financialTransactionService, 'FinancialTransaction');
        this.financialTransactionService = financialTransactionService;
    }
    async createTransaction(req, res) {
        try {
            const transactionData = req.body;
            const createdBy = req.user?.id;
            const transaction = await this.financialTransactionService.createTransaction(transactionData, createdBy);
            this.sendSuccess(res, transaction, 'Financial transaction created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create financial transaction');
        }
    }
    async updateTransactionStatus(req, res) {
        try {
            const { transactionId } = req.params;
            const { status } = req.body;
            const updatedBy = req.user?.id;
            const transaction = await this.financialTransactionService.updateTransactionStatus(transactionId, status, updatedBy);
            this.sendSuccess(res, transaction, 'Transaction status updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update transaction status');
        }
    }
    async getTransactionsByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, transactionType, status, search, startDate, endDate } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (transactionType) {
                options.transactionType = transactionType;
            }
            if (status) {
                options.status = status;
            }
            if (search) {
                options.search = search;
            }
            if (startDate && endDate) {
                options.dateRange = {
                    start: new Date(startDate),
                    end: new Date(endDate)
                };
            }
            const transactions = await this.financialTransactionService.getTransactionsByCompany(companyId.toString(), options);
            this.sendSuccess(res, transactions, 'Transactions retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get transactions');
        }
    }
    async getTransactionsByType(req, res) {
        try {
            const { transactionType } = req.params;
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
            const transactions = await this.financialTransactionService.getTransactionsByType(companyId.toString(), transactionType, options);
            this.sendSuccess(res, transactions, 'Transactions retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get transactions');
        }
    }
    async getTransactionStats(req, res) {
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
            const stats = await this.financialTransactionService.getTransactionStats(companyId.toString(), dateRange);
            this.sendSuccess(res, stats, 'Transaction statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get transaction statistics');
        }
    }
    async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await this.financialTransactionService.findById(id);
            if (!transaction) {
                this.sendError(res, new Error('Transaction not found'), 'Transaction not found', 404);
                return;
            }
            this.sendSuccess(res, transaction, 'Transaction retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get transaction');
        }
    }
    async updateTransaction(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const transaction = await this.financialTransactionService.update(id, updateData, updatedBy);
            if (!transaction) {
                this.sendError(res, new Error('Transaction not found'), 'Transaction not found', 404);
                return;
            }
            this.sendSuccess(res, transaction, 'Transaction updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update transaction');
        }
    }
    async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const transaction = await this.financialTransactionService.update(id, {
                'paymentDetails.paymentStatus': 'cancelled',
                deletedAt: new Date(),
                deletedBy
            }, deletedBy);
            if (!transaction) {
                this.sendError(res, new Error('Transaction not found'), 'Transaction not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Transaction cancelled successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to cancel transaction');
        }
    }
    async searchTransactions(req, res) {
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
            const transactions = await this.financialTransactionService.findMany({
                companyId,
                $or: [
                    { transactionNumber: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { 'partyDetails.partyName': { $regex: searchTerm, $options: 'i' } }
                ]
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, transactions, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search transactions');
        }
    }
}
exports.FinancialTransactionController = FinancialTransactionController;
//# sourceMappingURL=FinancialTransactionController.js.map