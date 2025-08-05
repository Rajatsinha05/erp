"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const BaseController_1 = require("./BaseController");
const SupplierService_1 = require("../services/SupplierService");
class SupplierController extends BaseController_1.BaseController {
    supplierService;
    constructor() {
        const supplierService = new SupplierService_1.SupplierService();
        super(supplierService, 'Supplier');
        this.supplierService = supplierService;
    }
    async createSupplier(req, res) {
        try {
            const supplierData = req.body;
            const createdBy = req.user?.id;
            const supplier = await this.supplierService.createSupplier(supplierData, createdBy);
            res.status(201).json({
                success: true,
                message: 'Supplier created successfully',
                data: supplier
            });
        }
        catch (error) {
            this.sendError(res, error, 'Operation failed');
        }
    }
    async getSupplierByCode(req, res) {
        try {
            const { supplierCode } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const supplier = await this.supplierService.getSupplierByCode(supplierCode, companyId.toString());
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }
            res.json({
                success: true,
                data: supplier
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get supplier');
        }
    }
    async getSuppliersByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, search, category } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (search) {
                options.search = search;
            }
            if (category) {
                options.category = category;
            }
            const suppliers = await this.supplierService.getSuppliersByCompany(companyId.toString(), options);
            this.sendSuccess(res, suppliers, 'Suppliers retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get suppliers');
        }
    }
    async getSuppliersByCategory(req, res) {
        try {
            const { category } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const suppliers = await this.supplierService.getSuppliersByCategory(companyId.toString(), category);
            res.json({
                success: true,
                data: suppliers
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async updateSupplier(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const supplier = await this.supplierService.update(id, updateData, updatedBy);
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Supplier updated successfully',
                data: supplier
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async updateSupplierRating(req, res) {
        try {
            const { id } = req.params;
            const { rating } = req.body;
            const ratedBy = req.user?.id;
            const supplier = await this.supplierService.updateSupplierRating(id, rating, ratedBy);
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Supplier rating updated successfully',
                data: supplier
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getSupplierStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            const stats = await this.supplierService.getSupplierStats(companyId.toString());
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async deleteSupplier(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const supplier = await this.supplierService.update(id, {
                isActive: false,
                deletedAt: new Date()
            }, deletedBy);
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Supplier deleted successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async getSupplierById(req, res) {
        try {
            const { id } = req.params;
            const supplier = await this.supplierService.findById(id);
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
                return;
            }
            res.json({
                success: true,
                data: supplier
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
    async searchSuppliers(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { q: searchTerm, limit = 10 } = req.query;
            if (!companyId) {
                res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
                return;
            }
            if (!searchTerm) {
                res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
                return;
            }
            const suppliers = await this.supplierService.findMany({
                companyId,
                $or: [
                    { supplierName: { $regex: searchTerm, $options: 'i' } },
                    { supplierCode: { $regex: searchTerm, $options: 'i' } },
                    { 'contactInfo.emails.label': { $regex: searchTerm, $options: 'i' } }
                ],
                isActive: true
            }, { limit: parseInt(limit) });
            res.json({
                success: true,
                data: suppliers
            });
        }
        catch (error) {
            this.sendError(res, error, "Operation failed");
        }
    }
}
exports.SupplierController = SupplierController;
//# sourceMappingURL=SupplierController.js.map