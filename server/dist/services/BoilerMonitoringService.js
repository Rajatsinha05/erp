"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoilerMonitoringService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const BoilerMonitoring_1 = __importDefault(require("../models/BoilerMonitoring"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class BoilerMonitoringService extends BaseService_1.BaseService {
    constructor() {
        super(BoilerMonitoring_1.default);
    }
    async createBoilerMonitoring(monitoringData, createdBy) {
        try {
            this.validateMonitoringData(monitoringData);
            const monitoring = await this.create({
                ...monitoringData,
                boilerId: `BM-${Date.now()}`,
                readings: [],
                alerts: [],
                maintenanceRecords: [],
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Boiler monitoring system created successfully', {
                boilerId: monitoring.boilerId,
                boilerName: monitoring.boilerName,
                boilerNumber: monitoring.boilerNumber,
                createdBy
            });
            return monitoring;
        }
        catch (error) {
            logger_1.logger.error('Error creating boiler monitoring system', { error, monitoringData, createdBy });
            throw error;
        }
    }
    async getMonitoringByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.boilerId) {
                query.boilerId = options.boilerId;
            }
            if (options.dateRange) {
                query.timestamp = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { timestamp: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting monitoring data by company', { error, companyId, options });
            throw error;
        }
    }
    async getBoilerAlerts(companyId, dateRange) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                'alerts.0': { $exists: true }
            };
            if (dateRange) {
                query.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { createdAt: -1 }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting boiler alerts', { error, companyId, dateRange });
            throw error;
        }
    }
    async getBoilerStats(companyId, boilerId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (boilerId) {
                matchQuery.boilerId = boilerId;
            }
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalBoilers, activeBoilers, alertCount, performanceStats, readingsStats] = await Promise.all([
                this.count(matchQuery),
                this.count({
                    ...matchQuery,
                    'currentStatus.operationalStatus': 'running'
                }),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $project: { alertCount: { $size: '$alerts' } } },
                    { $group: { _id: null, totalAlerts: { $sum: '$alertCount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: null,
                            avgEfficiency: { $avg: '$performance.efficiency' },
                            avgFuelConsumption: { $avg: '$performance.fuelConsumption' },
                            avgMaintenanceCost: { $avg: '$performance.maintenanceCost' }
                        } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $project: { readingCount: { $size: '$readings' } } },
                    { $group: {
                            _id: null,
                            totalReadings: { $sum: '$readingCount' },
                            avgReadingsPerBoiler: { $avg: '$readingCount' }
                        } }
                ])
            ]);
            return {
                totalBoilers,
                activeBoilers,
                totalAlerts: alertCount[0]?.totalAlerts || 0,
                totalReadings: readingsStats[0]?.totalReadings || 0,
                averageReadingsPerBoiler: readingsStats[0]?.avgReadingsPerBoiler || 0,
                performance: {
                    averageEfficiency: performanceStats[0]?.avgEfficiency || 0,
                    averageFuelConsumption: performanceStats[0]?.avgFuelConsumption || 0,
                    averageMaintenanceCost: performanceStats[0]?.avgMaintenanceCost || 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting boiler statistics', { error, companyId, boilerId, dateRange });
            throw error;
        }
    }
    validateMonitoringData(monitoringData) {
        if (!monitoringData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!monitoringData.boilerName) {
            throw new errors_1.AppError('Boiler name is required', 400);
        }
        if (!monitoringData.boilerNumber) {
            throw new errors_1.AppError('Boiler number is required', 400);
        }
    }
}
exports.BoilerMonitoringService = BoilerMonitoringService;
//# sourceMappingURL=BoilerMonitoringService.js.map