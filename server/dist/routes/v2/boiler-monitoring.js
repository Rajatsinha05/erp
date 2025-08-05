"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BoilerMonitoringController_1 = require("../../controllers/BoilerMonitoringController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const boilerMonitoringController = new BoilerMonitoringController_1.BoilerMonitoringController();
router.use(auth_1.authenticate);
router.post('/', boilerMonitoringController.createMonitoringEntry.bind(boilerMonitoringController));
router.get('/', boilerMonitoringController.getMonitoringByCompany.bind(boilerMonitoringController));
router.get('/alerts', boilerMonitoringController.getTemperatureAlerts.bind(boilerMonitoringController));
router.get('/stats', boilerMonitoringController.getBoilerStats.bind(boilerMonitoringController));
router.get('/:id', boilerMonitoringController.getMonitoringById.bind(boilerMonitoringController));
exports.default = router;
//# sourceMappingURL=boiler-monitoring.js.map