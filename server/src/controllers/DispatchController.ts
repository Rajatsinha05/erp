import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DispatchService } from '../services/DispatchService';
import { IDispatch } from '../types/models';

export class DispatchController extends BaseController<IDispatch> {
  private dispatchService: DispatchService;

  constructor() {
    const dispatchService = new DispatchService();
    super(dispatchService, 'Dispatch');
    this.dispatchService = dispatchService;
  }

  /**
   * Create a new dispatch entry
   */
  async createDispatch(req: Request, res: Response): Promise<void> {
    try {
      const dispatchData = req.body;
      const createdBy = req.user?.id;

      const dispatch = await this.dispatchService.createDispatch(dispatchData, createdBy);

      this.sendSuccess(res, dispatch, 'Dispatch entry created successfully', 201);
    } catch (error) {
      this.sendError(res, error, 'Failed to create dispatch entry');
    }
  }

  /**
   * Update dispatch status
   */
  async updateDispatchStatus(req: Request, res: Response): Promise<void> {
    try {
      const { dispatchId } = req.params;
      const { status } = req.body;
      const updatedBy = req.user?.id;

      const dispatch = await this.dispatchService.updateDispatchStatus(dispatchId, status, updatedBy);

      this.sendSuccess(res, dispatch, 'Dispatch status updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update dispatch status');
    }
  }

  /**
   * Get dispatches by company
   */
  async getDispatchesByCompany(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { page = 1, limit = 10, status, customerName, startDate, endDate } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      const options: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (status) {
        options.status = status;
      }

      if (customerName) {
        options.customerName = customerName;
      }

      if (startDate && endDate) {
        options.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const dispatches = await this.dispatchService.getDispatchesByCompany(companyId.toString(), options);

      this.sendSuccess(res, dispatches, 'Dispatches retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get dispatches');
    }
  }

  /**
   * Get dispatch statistics
   */
  async getDispatchStats(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
        return;
      }

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const stats = await this.dispatchService.getDispatchStats(companyId.toString(), dateRange);

      this.sendSuccess(res, stats, 'Dispatch statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get dispatch statistics');
    }
  }

  /**
   * Get dispatch by ID
   */
  async getDispatchById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dispatch = await this.dispatchService.findById(id);

      if (!dispatch) {
        this.sendError(res, new Error('Dispatch not found'), 'Dispatch not found', 404);
        return;
      }

      this.sendSuccess(res, dispatch, 'Dispatch retrieved successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to get dispatch');
    }
  }

  /**
   * Update dispatch
   */
  async updateDispatch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      const dispatch = await this.dispatchService.update(id, updateData, updatedBy);

      if (!dispatch) {
        this.sendError(res, new Error('Dispatch not found'), 'Dispatch not found', 404);
        return;
      }

      this.sendSuccess(res, dispatch, 'Dispatch updated successfully');
    } catch (error) {
      this.sendError(res, error, 'Failed to update dispatch');
    }
  }
}
