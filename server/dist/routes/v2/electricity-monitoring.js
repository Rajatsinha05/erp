"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ElectricityMonitoringController_1 = require("../../controllers/ElectricityMonitoringController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const electricityMonitoringController = new ElectricityMonitoringController_1.ElectricityMonitoringController();
router.use(auth_1.authenticate);
router.post('/', electricityMonitoringController.createMonitoringEntry.bind(electricityMonitoringController));
router.get('/', electricityMonitoringController.getMonitoringByCompany.bind(electricityMonitoringController));
router.get('/stats', electricityMonitoringController.getConsumptionStats.bind(electricityMonitoringController));
router.get('/solar-vs-pgvcl', electricityMonitoringController.getSolarVsPGVCLComparison.bind(electricityMonitoringController));
router.get('/:id', electricityMonitoringController.getMonitoringById.bind(electricityMonitoringController));
exports.default = router;
//# sourceMappingURL=electricity-monitoring.js.map