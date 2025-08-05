"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BusinessAnalyticsController_1 = require("../../controllers/BusinessAnalyticsController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const businessAnalyticsController = new BusinessAnalyticsController_1.BusinessAnalyticsController();
router.use(auth_1.authenticate);
router.post('/', businessAnalyticsController.createAnalytics.bind(businessAnalyticsController));
router.get('/', businessAnalyticsController.getAnalyticsByCompany.bind(businessAnalyticsController));
router.get('/sales', businessAnalyticsController.generateSalesAnalytics.bind(businessAnalyticsController));
router.get('/inventory', businessAnalyticsController.generateInventoryAnalytics.bind(businessAnalyticsController));
router.get('/:id', businessAnalyticsController.getAnalyticsById.bind(businessAnalyticsController));
exports.default = router;
//# sourceMappingURL=business-analytics.js.map