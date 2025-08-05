import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { CustomerVisitService } from '../services/CustomerVisitService';

// Simplified CustomerVisit interface for controller
interface ICustomerVisit {
  _id: string;
  partyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  visitDate: Date;
  purpose: 'business_meeting' | 'product_demo' | 'negotiation' | 'follow_up' | 'site_visit' | 'other';
  purposeDescription: string;
  travelType: 'local' | 'outstation' | 'international';
  travelDetails: any;
  accommodation?: any;
  foodExpenses: any[];
  giftsGiven: any[];
  transportationExpenses: any[];
  otherExpenses: any[];
  visitOutcome: any;
  totalExpenses: {
    accommodation: number;
    food: number;
    transportation: number;
    gifts: number;
    other: number;
    total: number;
  };
  attachments?: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: any;
  approvedAt?: Date;
  reimbursementAmount?: number;
  reimbursedAt?: Date;
  companyId: any;
  createdBy: any;
  lastModifiedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerVisitController {
  private customerVisitService: CustomerVisitService;

  constructor() {
    this.customerVisitService = new CustomerVisitService();
  }

  // Helper methods for responses
  private sendSuccess(res: Response, data: any, message: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  private sendError(res: Response, error: any, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: error.message || error
    });
  }

  /**
   * Create a new customer visit
   */
  async createCustomerVisit(req: Request, res: Response): Promise<void> {
    try {
      const visitData = req.body;
      const createdBy = req.user?.id;

      const visit = await this.customerVisitService.createCustomerVisit(visitData, createdBy);
      this.sendSuccess(res, visit, 'Customer visit created successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to create customer visit');
    }
  }

  /**
   * Get all customer visits with pagination and filters
   */
  async getAllCustomerVisits(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        purpose,
        travelType,
        approvalStatus,
        dateFrom,
        dateTo,
        sortBy = 'visitDate',
        sortOrder = 'desc'
      } = req.query;

      const companyId = req.user?.companyId;
      if (!companyId) {
        this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
        return;
      }

      // Build query
      const query: any = { companyId };

      if (search) {
        query.$or = [
          { partyName: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { purposeDescription: { $regex: search, $options: 'i' } }
        ];
      }

      if (purpose) query.purpose = purpose;
      if (travelType) query.travelType = travelType;
      if (approvalStatus) query.approvalStatus = approvalStatus;

      if (dateFrom || dateTo) {
        query.visitDate = {};
        if (dateFrom) query.visitDate.$gte = new Date(dateFrom as string);
        if (dateTo) query.visitDate.$lte = new Date(dateTo as string);
      }

      // Build options
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 },
        populate: [
          { path: 'createdBy', select: 'firstName lastName email' },
          { path: 'approvedBy', select: 'firstName lastName email' },
          { path: 'companyId', select: 'companyName companyCode address phone email' }
        ]
      };

      const result = await this.customerVisitService.findManyWithPagination(query, options);
      res.status(200).json(result);
    } catch (error) {
      this.sendError(res, error, 'Failed to retrieve customer visits');
    }
  }

  /**
   * Get customer visit by ID
   */
  async getCustomerVisitById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const visit = await this.customerVisitService.findById(id);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Customer visit retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to retrieve customer visit');
    }
  }

  /**
   * Update customer visit
   */
  async updateCustomerVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      const visit = await this.customerVisitService.update(id, updateData, updatedBy);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Customer visit updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update customer visit');
    }
  }

  /**
   * Delete customer visit
   */
  async deleteCustomerVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.customerVisitService.delete(id);

      if (!deleted) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, null, 'Customer visit deleted successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to delete customer visit');
    }
  }

  /**
   * Approve customer visit
   */
  async approveVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reimbursementAmount } = req.body;
      const approvedBy = req.user?.id;

      const visit = await this.customerVisitService.approveVisit(id, approvedBy, reimbursementAmount);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Customer visit approved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to approve customer visit');
    }
  }

  /**
   * Reject customer visit
   */
  async rejectVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const rejectedBy = req.user?.id;

      const visit = await this.customerVisitService.rejectVisit(id, rejectedBy, reason);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Customer visit rejected successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to reject customer visit');
    }
  }

  /**
   * Mark visit as reimbursed
   */
  async markAsReimbursed(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reimbursedBy = req.user?.id;

      const visit = await this.customerVisitService.markAsReimbursed(id, reimbursedBy);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Customer visit marked as reimbursed successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to mark customer visit as reimbursed');
    }
  }

  /**
   * Add food expense
   */
  async addFoodExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const expenseData = req.body;
      const updatedBy = req.user?.id;

      const visit = await this.customerVisitService.addFoodExpense(id, expenseData, updatedBy);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Food expense added successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to add food expense');
    }
  }

  /**
   * Add gift/sample
   */
  async addGift(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const giftData = req.body;
      const updatedBy = req.user?.id;

      const visit = await this.customerVisitService.addGift(id, giftData, updatedBy);

      if (!visit) {
        this.sendError(res, new Error('Customer visit not found'), 'Customer visit not found', 404);
        return;
      }

      this.sendSuccess(res, visit, 'Gift/sample added successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to add gift/sample');
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query;
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
        return;
      }

      const startDate = dateFrom ? new Date(dateFrom as string) : undefined;
      const endDate = dateTo ? new Date(dateTo as string) : undefined;

      const stats = await this.customerVisitService.getExpenseStats(companyId.toString(), startDate, endDate);
      this.sendSuccess(res, stats, 'Expense statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to retrieve expense statistics');
    }
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
        return;
      }

      const visits = await this.customerVisitService.getPendingApprovals(companyId.toString());
      this.sendSuccess(res, visits, 'Pending approvals retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to retrieve pending approvals');
    }
  }
}
