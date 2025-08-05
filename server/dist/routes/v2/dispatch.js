"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DispatchController_1 = require("../../controllers/DispatchController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const dispatchController = new DispatchController_1.DispatchController();
router.use(auth_1.authenticate);
router.post('/', dispatchController.createDispatch.bind(dispatchController));
router.get('/', dispatchController.getDispatchesByCompany.bind(dispatchController));
router.get('/stats', dispatchController.getDispatchStats.bind(dispatchController));
router.put('/:dispatchId/status', dispatchController.updateDispatchStatus.bind(dispatchController));
router.get('/:id', dispatchController.getDispatchById.bind(dispatchController));
router.put('/:id', dispatchController.updateDispatch.bind(dispatchController));
exports.default = router;
//# sourceMappingURL=dispatch.js.map