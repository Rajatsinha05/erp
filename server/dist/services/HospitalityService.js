"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalityService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const Hospitality_1 = __importDefault(require("../models/Hospitality"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class HospitalityService extends BaseService_1.BaseService {
    constructor() {
        super(Hospitality_1.default);
    }
    async createHospitalityFacility(hospitalityData, createdBy) {
        try {
            this.validateHospitalityData(hospitalityData);
            const hospitality = await this.create({
                ...hospitalityData,
                facilityId: `HSP-${Date.now()}`,
                totalBookings: 0,
                activeBookings: 0,
                totalGuests: 0,
                vipGuests: 0,
                repeatGuests: 0,
                createdBy: createdBy ? new mongoose_1.Types.ObjectId(createdBy) : undefined
            }, createdBy);
            logger_1.logger.info('Hospitality facility created successfully', {
                facilityId: hospitality.facilityId,
                facilityName: hospitality.facilityName,
                facilityType: hospitality.facilityType,
                createdBy
            });
            return hospitality;
        }
        catch (error) {
            logger_1.logger.error('Error creating hospitality facility', { error, hospitalityData, createdBy });
            throw error;
        }
    }
    async getHospitalityByCompany(companyId, options = {}) {
        try {
            let query = {
                companyId: new mongoose_1.Types.ObjectId(companyId)
            };
            if (options.facilityName) {
                query.facilityName = { $regex: options.facilityName, $options: 'i' };
            }
            if (options.facilityType) {
                query.facilityType = options.facilityType;
            }
            if (options.dateRange) {
                query.createdAt = {
                    $gte: options.dateRange.start,
                    $lte: options.dateRange.end
                };
            }
            return await this.findMany(query, {
                sort: { createdAt: -1 },
                page: options.page,
                limit: options.limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting hospitality facilities by company', { error, companyId, options });
            throw error;
        }
    }
    async getHospitalityStats(companyId, dateRange) {
        try {
            const matchQuery = { companyId: new mongoose_1.Types.ObjectId(companyId) };
            if (dateRange) {
                matchQuery.createdAt = {
                    $gte: dateRange.start,
                    $lte: dateRange.end
                };
            }
            const [totalFacilities, facilitiesByType, totalBookings, totalGuests, avgOccupancy] = await Promise.all([
                this.count(matchQuery),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: '$facilityType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalBookings: { $sum: '$totalBookings' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, totalGuests: { $sum: '$totalGuests' } } }
                ]),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: { _id: null, avgOccupancy: { $avg: '$occupancy.currentOccupancy' } } }
                ])
            ]);
            return {
                totalFacilities,
                facilitiesByType,
                totalBookings: totalBookings[0]?.totalBookings || 0,
                totalGuests: totalGuests[0]?.totalGuests || 0,
                averageOccupancy: avgOccupancy[0]?.avgOccupancy || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting hospitality statistics', { error, companyId, dateRange });
            throw error;
        }
    }
    async getMonthlyReport(companyId, year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const matchQuery = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            };
            const [monthlyEntries, dailyBreakdown] = await Promise.all([
                this.findMany(matchQuery, { sort: { createdAt: -1 } }),
                this.model.aggregate([
                    { $match: matchQuery },
                    { $group: {
                            _id: { $dayOfMonth: '$createdAt' },
                            totalBookings: { $sum: '$totalBookings' },
                            facilityCount: { $sum: 1 }
                        } },
                    { $sort: { '_id': 1 } }
                ])
            ]);
            return {
                monthlyEntries,
                dailyBreakdown,
                summary: {
                    totalFacilities: monthlyEntries.length,
                    totalBookings: monthlyEntries.reduce((sum, entry) => sum + (entry.totalBookings || 0), 0)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting monthly hospitality report', { error, companyId, year, month });
            throw error;
        }
    }
    validateHospitalityData(hospitalityData) {
        if (!hospitalityData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!hospitalityData.facilityName) {
            throw new errors_1.AppError('Facility name is required', 400);
        }
        if (!hospitalityData.facilityType) {
            throw new errors_1.AppError('Facility type is required', 400);
        }
    }
}
exports.HospitalityService = HospitalityService;
//# sourceMappingURL=HospitalityService.js.map