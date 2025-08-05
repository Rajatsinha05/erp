"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditLogController_1 = require("../../controllers/AuditLogController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const auditLogController = new AuditLogController_1.AuditLogController();
router.use(auth_1.authenticate);
router.post('/', auditLogController.createAuditLog.bind(auditLogController));
router.post('/user-action', auditLogController.logUserAction.bind(auditLogController));
router.get('/', auditLogController.getAuditLogsByCompany.bind(auditLogController));
router.get('/search', auditLogController.searchAuditLogs.bind(auditLogController));
router.get('/stats', auditLogController.getAuditStats.bind(auditLogController));
router.get('/user/:userId', auditLogController.getAuditLogsByUser.bind(auditLogController));
router.get('/resource/:resourceType/:resourceId', auditLogController.getAuditLogsByResource.bind(auditLogController));
router.get('/:id', auditLogController.getAuditLogById.bind(auditLogController));
exports.default = router;
//# sourceMappingURL=audit-logs.js.map