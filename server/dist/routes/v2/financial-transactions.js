"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinancialTransactionController_1 = require("../../controllers/FinancialTransactionController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const financialTransactionController = new FinancialTransactionController_1.FinancialTransactionController();
router.use(auth_1.authenticate);
router.post('/', financialTransactionController.createTransaction.bind(financialTransactionController));
router.get('/', financialTransactionController.getTransactionsByCompany.bind(financialTransactionController));
router.get('/search', financialTransactionController.searchTransactions.bind(financialTransactionController));
router.get('/stats', financialTransactionController.getTransactionStats.bind(financialTransactionController));
router.get('/type/:transactionType', financialTransactionController.getTransactionsByType.bind(financialTransactionController));
router.get('/:id', financialTransactionController.getTransactionById.bind(financialTransactionController));
router.put('/:id', financialTransactionController.updateTransaction.bind(financialTransactionController));
router.put('/:transactionId/status', financialTransactionController.updateTransactionStatus.bind(financialTransactionController));
router.delete('/:id', financialTransactionController.deleteTransaction.bind(financialTransactionController));
exports.default = router;
//# sourceMappingURL=financial-transactions.js.map