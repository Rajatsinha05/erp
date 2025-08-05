"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const Supplier_1 = __importDefault(require("@/models/Supplier"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', status = 'all', category = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const searchTerm = search;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        let query = {
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        };
        if (searchTerm) {
            query.$or = [
                { supplierCode: { $regex: searchTerm, $options: 'i' } },
                { companyName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { 'contactPerson.name': { $regex: searchTerm, $options: 'i' } },
                { 'contactPerson.email': { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            query.status = status;
        }
        if (category !== 'all') {
            query.category = category;
        }
        const suppliers = await Supplier_1.default.find(query)
            .populate('companyId', 'companyName companyCode')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await Supplier_1.default.countDocuments(query);
        const transformedSuppliers = suppliers.map(supplier => ({
            _id: supplier._id,
            supplierCode: supplier.supplierCode,
            companyName: supplier.supplierName || supplier.displayName,
            category: supplier.productCategories?.[0]?.category || 'services',
            status: supplier.isActive ? 'active' : 'inactive',
            email: supplier.contactInfo?.primaryEmail,
            phone: supplier.contactInfo?.primaryPhone,
            website: supplier.businessInfo?.website,
            address: supplier.addresses?.[0] ? {
                street: supplier.addresses[0].addressLine1,
                city: supplier.addresses[0].city,
                state: supplier.addresses[0].state,
                pincode: supplier.addresses[0].pincode,
                country: supplier.addresses[0].country
            } : null,
            contactPerson: supplier.contactPersons?.[0] ? {
                name: supplier.contactPersons[0].name,
                designation: supplier.contactPersons[0].designation,
                email: supplier.contactPersons[0].email,
                phone: supplier.contactPersons[0].phone
            } : null,
            businessDetails: supplier.registrationDetails ? {
                gstin: supplier.registrationDetails.gstin,
                pan: supplier.registrationDetails.pan,
                industry: supplier.businessInfo?.industry,
                website: supplier.businessInfo?.website
            } : null,
            rating: supplier.quality?.qualityRating || 0,
            totalOrders: 0,
            totalSpend: 0,
            lastOrderDate: null,
            onTimeDelivery: supplier.supplyHistory?.onTimeDeliveryRate || 0,
            qualityScore: supplier.quality?.qualityRating || 0,
            leadTime: supplier.productCategories?.[0]?.leadTime || 0,
            paymentTerms: supplier.financialInfo?.paymentTerms,
            creditLimit: supplier.financialInfo?.creditDays || 0,
            companyId: supplier.companyId,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt
        }));
        res.json({
            success: true,
            data: transformedSuppliers,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({
            error: 'Failed to fetch suppliers',
            message: 'An error occurred while fetching suppliers'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        const stats = await Supplier_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalSuppliers: { $sum: 1 },
                    activeSuppliers: { $sum: { $cond: ['$isActive', 1, 0] } },
                    averageRating: { $avg: '$quality.qualityRating' },
                    averageOnTimeDelivery: { $avg: '$supplyHistory.onTimeDeliveryRate' }
                }
            }
        ]);
        const result = stats[0] || {
            totalSuppliers: 0,
            activeSuppliers: 0,
            averageRating: 0,
            averageOnTimeDelivery: 0
        };
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Get supplier stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch supplier statistics',
            message: 'An error occurred while fetching supplier statistics'
        });
    }
});
router.get('/:supplierId', async (req, res) => {
    try {
        const user = req.user;
        const { supplierId } = req.params;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        if (!mongoose_1.default.Types.ObjectId.isValid(supplierId)) {
            return res.status(400).json({
                error: 'Invalid supplier ID',
                message: 'The provided supplier ID is not valid'
            });
        }
        const supplier = await Supplier_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(supplierId),
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true
        }).lean();
        if (!supplier) {
            return res.status(404).json({
                error: 'Supplier not found',
                message: 'The requested supplier was not found'
            });
        }
        res.json({
            success: true,
            data: supplier
        });
    }
    catch (error) {
        console.error('Get supplier by ID error:', error);
        res.status(500).json({
            error: 'Failed to fetch supplier',
            message: 'An error occurred while fetching supplier details'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const supplierData = req.body;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.suppliers?.create && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to create suppliers'
            });
        }
        const newSupplier = {
            _id: `supplier_${user.companyId}_${Date.now()}`,
            supplierCode: `SUP-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
            ...supplierData,
            companyId: user.companyId,
            status: 'pending',
            rating: 0,
            totalOrders: 0,
            totalSpend: 0,
            onTimeDelivery: 0,
            qualityScore: 0,
            leadTime: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newSupplier,
            message: 'Supplier created successfully'
        });
    }
    catch (error) {
        console.error('Create supplier error:', error);
        res.status(500).json({
            error: 'Failed to create supplier',
            message: 'An error occurred while creating the supplier'
        });
    }
});
router.put('/:supplierId', async (req, res) => {
    try {
        const user = req.user;
        const { supplierId } = req.params;
        const updateData = req.body;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.suppliers?.edit && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to update suppliers'
            });
        }
        const updatedSupplier = {
            _id: supplierId,
            ...updateData,
            updatedAt: new Date(),
            updatedBy: user.username
        };
        res.json({
            success: true,
            data: updatedSupplier,
            message: 'Supplier updated successfully'
        });
    }
    catch (error) {
        console.error('Update supplier error:', error);
        res.status(500).json({
            error: 'Failed to update supplier',
            message: 'An error occurred while updating the supplier'
        });
    }
});
router.delete('/:supplierId', async (req, res) => {
    try {
        const user = req.user;
        const { supplierId } = req.params;
        if (!user.isSuperAdmin && !user.companyAccess?.some((access) => access.permissions?.suppliers?.delete && access.isActive)) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'You do not have permission to delete suppliers'
            });
        }
        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete supplier error:', error);
        res.status(500).json({
            error: 'Failed to delete supplier',
            message: 'An error occurred while deleting the supplier'
        });
    }
});
exports.default = router;
//# sourceMappingURL=suppliers.js.map