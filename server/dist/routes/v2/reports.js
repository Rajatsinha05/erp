"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = require("../../controllers/ReportController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const reportController = new ReportController_1.ReportController();
router.use(auth_1.authenticate);
router.post('/', reportController.createReport.bind(reportController));
router.get('/', reportController.getReportsByCompany.bind(reportController));
router.get('/stats', reportController.getReportStats.bind(reportController));
router.get('/generate/sales', reportController.generateSalesReport.bind(reportController));
router.get('/generate/inventory', reportController.generateInventoryReport.bind(reportController));
router.get('/generate/production', reportController.generateProductionReport.bind(reportController));
router.get('/:id', reportController.getReportById.bind(reportController));
exports.default = router;
//# sourceMappingURL=reports.js.map