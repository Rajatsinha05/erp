"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HospitalityController_1 = require("../../controllers/HospitalityController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const hospitalityController = new HospitalityController_1.HospitalityController();
router.use(auth_1.authenticate);
router.post('/', hospitalityController.createHospitalityEntry.bind(hospitalityController));
router.get('/', hospitalityController.getHospitalityByCompany.bind(hospitalityController));
router.get('/stats', hospitalityController.getHospitalityStats.bind(hospitalityController));
router.get('/monthly-report', hospitalityController.getMonthlyReport.bind(hospitalityController));
router.get('/:id', hospitalityController.getHospitalityById.bind(hospitalityController));
router.put('/:id', hospitalityController.updateHospitality.bind(hospitalityController));
exports.default = router;
//# sourceMappingURL=hospitality.js.map