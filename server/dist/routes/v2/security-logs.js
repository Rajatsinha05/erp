"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SecurityLogController_1 = require("../../controllers/SecurityLogController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const securityLogController = new SecurityLogController_1.SecurityLogController();
router.use(auth_1.authenticate);
router.post('/', securityLogController.createSecurityLog.bind(securityLogController));
router.get('/', securityLogController.getSecurityLogsByCompany.bind(securityLogController));
router.get('/search', securityLogController.searchSecurityLogs.bind(securityLogController));
router.get('/stats', securityLogController.getSecurityStats.bind(securityLogController));
router.get('/:id', securityLogController.getSecurityLogById.bind(securityLogController));
router.put('/:id', securityLogController.updateSecurityLog.bind(securityLogController));
exports.default = router;
//# sourceMappingURL=security-logs.js.map