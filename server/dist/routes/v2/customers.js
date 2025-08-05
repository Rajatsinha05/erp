"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerController_1 = require("../../controllers/CustomerController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const customerController = new CustomerController_1.CustomerController();
router.use(auth_1.authenticate);
router.post('/', customerController.createCustomer.bind(customerController));
router.get('/', customerController.getCustomersByCompany.bind(customerController));
router.get('/search', customerController.searchCustomers.bind(customerController));
router.get('/stats', customerController.getCustomerStats.bind(customerController));
router.get('/code/:customerCode', customerController.getCustomerByCode.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.put('/:id/credit-limit', customerController.updateCreditLimit.bind(customerController));
router.delete('/:id', customerController.deleteCustomer.bind(customerController));
exports.default = router;
//# sourceMappingURL=customers.js.map