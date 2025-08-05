"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectricityMonitoringService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const ElectricityMonitoring_1 = __importDefault(require("../models/ElectricityMonitoring"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class ElectricityMonitoringService extends BaseService_1.BaseService {
    constructor() {
        super(ElectricityMonitoring_1.default);
    }
    async createMonitoringSystem(monitoringData, createdBy) {
        try {
            this.validateMonitoringData(monitoringData);
            const monitoring = await this.create({
                ...monitoringData,
                monitoringId: `EM-${Date.now()}`,
                readings: [],
                powerQuality: [],
                energyConsumption: [],
                alerts: [],
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Electricity monitoring system created successfully', {
                monitoringId: monitoring.monitoringId,
                monitoringName: monitoring.monitoringName,
                location: monitoring.location,
                createdBy
            });
            return monitoring;
        }
        catch (error) {
            logger_1.logger.error('Error creating electricity monitoring system', { error, monitoringData, createdBy });
            throw error;
        }
    }
    async getMonitoringByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.meterNumber) {
                query.meterNumber = options.meterNumber;
            }
            if (options.sourceType) {
                query.sourceType = options.sourceType;
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
    async getConsumptionStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalSystems, activeSystems, consumptionStats, alertCount, performanceStats] = await Promise.all([
                this.count(matchQuery),
                this.count({
                    ...matchQuery,
                    'currentStatus.operationalStatus': 'active'
                }),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$energyConsumption' },
                    { $group: {
                            _id: null,
                            totalConsumption: { $sum: '$energyConsumption.totalConsumption' },
                            avgConsumption: { $avg: '$energyConsumption.totalConsumption' },
                            maxConsumption: { $max: '$energyConsumption.totalConsumption' }
                        } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $project: { alertCount: { $size: '$alerts' } } },
                    { $group: { _id: null, totalAlerts: { $sum: '$alertCount' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: null,
                            avgPowerFactor: { $avg: '$performance.powerFactor' },
                            avgEfficiency: { $avg: '$performance.efficiency' },
                            avgCostPerUnit: { $avg: '$performance.costPerUnit' }
                        } }
                ])
            ]);
            return {
                totalSystems,
                activeSystems,
                totalAlerts: alertCount[0]?.totalAlerts || 0,
                consumption: {
                    total: consumptionStats[0]?.totalConsumption || 0,
                    average: consumptionStats[0]?.avgConsumption || 0,
                    peak: consumptionStats[0]?.maxConsumption || 0
                },
                performance: {
                    averagePowerFactor: performanceStats[0]?.avgPowerFactor || 0,
                    averageEfficiency: performanceStats[0]?.avgEfficiency || 0,
                    averageCostPerUnit: performanceStats[0]?.avgCostPerUnit || 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting consumption statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async getEnergySourceComparison(companyId, dateRange) {
        try {
            const matchQuery = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                }
            };
            const [renewableData, gridData, totalConsumption] = await Promise.all([
                this.model.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$energyConsumption' },
                    { $match: { 'energyConsumption.source': { $in: ['solar', 'wind', 'renewable'] } } },
                    { $group: {
                            _id: '$energyConsumption.source',
                            totalConsumption: { $sum: '$energyConsumption.totalConsumption' },
                            totalCost: { $sum: '$energyConsumption.cost' }
                        } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$energyConsumption' },
                    { $match: { 'energyConsumption.source': { $in: ['grid', 'utility'] } } },
                    { $group: {
                            _id: '$energyConsumption.source',
                            totalConsumption: { $sum: '$energyConsumption.totalConsumption' },
                            totalCost: { $sum: '$energyConsumption.cost' }
                        } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $unwind: '$energyConsumption' },
                    { $group: {
                            _id: null,
                            totalConsumption: { $sum: '$energyConsumption.totalConsumption' },
                            totalCost: { $sum: '$energyConsumption.cost' }
                        } }
                ])
            ]);
            const renewable = renewableData.reduce((acc, curr) => ({
                totalConsumption: acc.totalConsumption + curr.totalConsumption,
                totalCost: acc.totalCost + curr.totalCost
            }), { totalConsumption: 0, totalCost: 0 });
            const grid = gridData.reduce((acc, curr) => ({
                totalConsumption: acc.totalConsumption + curr.totalConsumption,
                totalCost: acc.totalCost + curr.totalCost
            }), { totalConsumption: 0, totalCost: 0 });
            const total = totalConsumption[0] || { totalConsumption: 0, totalCost: 0 };
            return {
                renewable: {
                    ...renewable,
                    percentage: total.totalConsumption > 0 ? (renewable.totalConsumption / total.totalConsumption) * 100 : 0
                },
                grid: {
                    ...grid,
                    percentage: total.totalConsumption > 0 ? (grid.totalConsumption / total.totalConsumption) * 100 : 0
                },
                total,
                savings: {
                    consumption: renewable.totalConsumption,
                    cost: grid.totalCost > 0 ? grid.totalCost - renewable.totalCost : 0,
                    percentage: grid.totalCost > 0 ? ((grid.totalCost - renewable.totalCost) / grid.totalCost) * 100 : 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting energy source comparison', { error, companyId, dateRange });
            throw error;
        }
    }
    validateMonitoringData(monitoringData) {
        if (!monitoringData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!monitoringData.monitoringName) {
            throw new errors_1.AppError('Monitoring name is required', 400);
        }
        if (!monitoringData.location) {
            throw new errors_1.AppError('Location is required', 400);
        }
    }
}
exports.ElectricityMonitoringService = ElectricityMonitoringService;
//# sourceMappingURL=ElectricityMonitoringService.js.map