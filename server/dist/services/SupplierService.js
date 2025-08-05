"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class SupplierService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Supplier);
    }
    async createSupplier(supplierData, createdBy) {
        try {
            this.validateSupplierData(supplierData);
            if (supplierData.supplierCode) {
                const existingSupplier = await this.findOne({
                    supplierCode: supplierData.supplierCode.toUpperCase(),
                    companyId: supplierData.companyId
                });
                if (existingSupplier) {
                    throw new errors_1.AppError('Supplier code already exists', 400);
                }
            }
            if (supplierData.contactInfo?.primaryEmail) {
                const existingEmail = await this.findOne({
                    'contactInfo.primaryEmail': supplierData.contactInfo.primaryEmail,
                    companyId: supplierData.companyId
                });
                if (existingEmail) {
                    throw new errors_1.AppError('Supplier with this email already exists', 400);
                }
            }
            if (!supplierData.supplierCode) {
                supplierData.supplierCode = await this.generateSupplierCode(supplierData.companyId.toString());
            }
            const supplier = await this.create({
                ...supplierData,
                supplierCode: supplierData.supplierCode.toUpperCase(),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Supplier created successfully', {
                supplierId: supplier._id,
                supplierCode: supplier.supplierCode,
                companyId: supplierData.companyId,
                createdBy
            });
            return supplier;
        }
        catch (error) {
            logger_1.logger.error('Error creating supplier', { error, supplierData, createdBy });
            throw error;
        }
    }
    async getSupplierByCode(supplierCode, companyId) {
        try {
            return await this.findOne({
                supplierCode: supplierCode.toUpperCase(),
                companyId: new mongoose_1.Types.ObjectId(companyId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting supplier by code', { error, supplierCode, companyId });
            throw error;
        }
    }
    async getSuppliersByCompany(companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true
            };
            return await this.findMany(query, options);
        }
        catch (error) {
            logger_1.logger.error('Error getting suppliers by company', { error, companyId });
            throw error;
        }
    }
    async getSuppliersByCategory(companyId, category) {
        try {
            return await this.findMany({
                companyId: new mongoose_1.Types.ObjectId(companyId),
                'businessInfo.supplierCategory': category,
                isActive: true
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting suppliers by category', { error, companyId, category });
            throw error;
        }
    }
    async updateSupplierRating(supplierId, rating, ratedBy) {
        try {
            const supplier = await this.findById(supplierId);
            if (!supplier) {
                throw new errors_1.AppError('Supplier not found', 404);
            }
            if (rating < 1 || rating > 5) {
                throw new errors_1.AppError('Rating must be between 1 and 5', 400);
            }
            const updatedSupplier = await this.update(supplierId, {
                'performanceMetrics.overallRating': rating,
                'performanceMetrics.lastRatingUpdate': new Date()
            }, ratedBy);
            logger_1.logger.info('Supplier rating updated', {
                supplierId,
                rating,
                ratedBy
            });
            return updatedSupplier;
        }
        catch (error) {
            logger_1.logger.error('Error updating supplier rating', { error, supplierId, rating, ratedBy });
            throw error;
        }
    }
    async getSupplierStats(companyId) {
        try {
            const [totalSuppliers, activeSuppliers, inactiveSuppliers, suppliersByCategory, averageRating] = await Promise.all([
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) }),
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true }),
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), isActive: false }),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: '$businessInfo.supplierCategory', count: { $sum: 1 } } }
                ]),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: null, avgRating: { $avg: '$performanceMetrics.overallRating' } } }
                ])
            ]);
            return {
                totalSuppliers,
                activeSuppliers,
                inactiveSuppliers,
                suppliersByCategory,
                averageRating: averageRating[0]?.avgRating || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting supplier statistics', { error, companyId });
            throw error;
        }
    }
    async generateSupplierCode(companyId) {
        const count = await this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) });
        return `SUPP${(count + 1).toString().padStart(6, '0')}`;
    }
    validateSupplierData(supplierData) {
        if (!supplierData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!supplierData.supplierName) {
            throw new errors_1.AppError('Supplier name is required', 400);
        }
        if (!supplierData.contactInfo?.primaryEmail) {
            throw new errors_1.AppError('Primary email is required', 400);
        }
        if (!supplierData.contactInfo?.primaryPhone) {
            throw new errors_1.AppError('Primary phone number is required', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(supplierData.contactInfo.primaryEmail)) {
            throw new errors_1.AppError('Invalid email format', 400);
        }
    }
}
exports.SupplierService = SupplierService;
//# sourceMappingURL=SupplierService.js.map