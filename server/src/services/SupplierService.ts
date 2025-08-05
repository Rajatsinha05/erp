import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { Supplier } from '../models';
import { ISupplier } from '../types/models';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class SupplierService extends BaseService<ISupplier> {
  constructor() {
    super(Supplier);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: Partial<ISupplier>, createdBy?: string): Promise<ISupplier> {
    try {
      // Validate supplier data
      this.validateSupplierData(supplierData);

      // Check if supplier code already exists
      if (supplierData.supplierCode) {
        const existingSupplier = await this.findOne({ 
          supplierCode: supplierData.supplierCode.toUpperCase(),
          companyId: supplierData.companyId 
        });

        if (existingSupplier) {
          throw new AppError('Supplier code already exists', 400);
        }
      }

      // Check if primary email already exists
      if (supplierData.contactInfo?.primaryEmail) {
        const existingEmail = await this.findOne({
          'contactInfo.primaryEmail': supplierData.contactInfo.primaryEmail,
          companyId: supplierData.companyId
        });

        if (existingEmail) {
          throw new AppError('Supplier with this email already exists', 400);
        }
      }

      // Generate supplier code if not provided
      if (!supplierData.supplierCode) {
        supplierData.supplierCode = await this.generateSupplierCode(supplierData.companyId!.toString());
      }

      const supplier = await this.create({
        ...supplierData,
        supplierCode: supplierData.supplierCode.toUpperCase(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, createdBy);

      logger.info('Supplier created successfully', { 
        supplierId: supplier._id, 
        supplierCode: supplier.supplierCode,
        companyId: supplierData.companyId,
        createdBy 
      });

      return supplier;
    } catch (error) {
      logger.error('Error creating supplier', { error, supplierData, createdBy });
      throw error;
    }
  }

  /**
   * Get supplier by code
   */
  async getSupplierByCode(supplierCode: string, companyId: string): Promise<ISupplier | null> {
    try {
      return await this.findOne({ 
        supplierCode: supplierCode.toUpperCase(),
        companyId: new Types.ObjectId(companyId)
      });
    } catch (error) {
      logger.error('Error getting supplier by code', { error, supplierCode, companyId });
      throw error;
    }
  }

  /**
   * Get suppliers by company
   */
  async getSuppliersByCompany(companyId: string, options: any = {}): Promise<ISupplier[]> {
    try {
      const query = { 
        companyId: new Types.ObjectId(companyId),
        isActive: true
      };

      return await this.findMany(query, options);
    } catch (error) {
      logger.error('Error getting suppliers by company', { error, companyId });
      throw error;
    }
  }

  /**
   * Get suppliers by category
   */
  async getSuppliersByCategory(companyId: string, category: string): Promise<ISupplier[]> {
    try {
      return await this.findMany({ 
        companyId: new Types.ObjectId(companyId),
        'businessInfo.supplierCategory': category,
        isActive: true
      });
    } catch (error) {
      logger.error('Error getting suppliers by category', { error, companyId, category });
      throw error;
    }
  }

  /**
   * Update supplier rating
   */
  async updateSupplierRating(supplierId: string, rating: number, ratedBy?: string): Promise<ISupplier | null> {
    try {
      const supplier = await this.findById(supplierId);
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }

      if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      const updatedSupplier = await this.update(supplierId, {
        'performanceMetrics.overallRating': rating,
        'performanceMetrics.lastRatingUpdate': new Date()
      }, ratedBy);

      logger.info('Supplier rating updated', { 
        supplierId, 
        rating,
        ratedBy 
      });

      return updatedSupplier;
    } catch (error) {
      logger.error('Error updating supplier rating', { error, supplierId, rating, ratedBy });
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(companyId: string): Promise<any> {
    try {
      const [
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        suppliersByCategory,
        averageRating
      ] = await Promise.all([
        this.count({ companyId: new Types.ObjectId(companyId) }),
        this.count({ companyId: new Types.ObjectId(companyId), isActive: true }),
        this.count({ companyId: new Types.ObjectId(companyId), isActive: false }),
        this.model.aggregate([
          { $match: { companyId: new Types.ObjectId(companyId), isActive: true } },
          { $group: { _id: '$businessInfo.supplierCategory', count: { $sum: 1 } } }
        ]),
        this.model.aggregate([
          { $match: { companyId: new Types.ObjectId(companyId), isActive: true } },
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
    } catch (error) {
      logger.error('Error getting supplier statistics', { error, companyId });
      throw error;
    }
  }

  /**
   * Generate supplier code
   */
  private async generateSupplierCode(companyId: string): Promise<string> {
    const count = await this.count({ companyId: new Types.ObjectId(companyId) });
    return `SUPP${(count + 1).toString().padStart(6, '0')}`;
  }

  /**
   * Validate supplier data
   */
  private validateSupplierData(supplierData: Partial<ISupplier>): void {
    if (!supplierData.companyId) {
      throw new AppError('Company ID is required', 400);
    }

    if (!supplierData.supplierName) {
      throw new AppError('Supplier name is required', 400);
    }

    if (!supplierData.contactInfo?.primaryEmail) {
      throw new AppError('Primary email is required', 400);
    }

    if (!supplierData.contactInfo?.primaryPhone) {
      throw new AppError('Primary phone number is required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplierData.contactInfo.primaryEmail)) {
      throw new AppError('Invalid email format', 400);
    }
  }
}
