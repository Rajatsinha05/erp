"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const Customer_1 = __importDefault(require("@/models/Customer"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, search = '', status = 'all', type = 'all' } = req.query;
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
                { customerCode: { $regex: searchTerm, $options: 'i' } },
                { name: { $regex: searchTerm, $options: 'i' } },
                { companyName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { 'contactPersons.name': { $regex: searchTerm, $options: 'i' } },
                { 'contactPersons.email': { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            query.status = status;
        }
        if (type !== 'all') {
            query.customerType = type;
        }
        const customers = await Customer_1.default.find(query)
            .populate('companyId', 'companyName companyCode')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await Customer_1.default.countDocuments(query);
        const transformedCustomers = customers.map(customer => ({
            _id: customer._id,
            customerCode: customer.customerCode,
            name: customer.customerName,
            companyName: customer.legalName || customer.displayName,
            type: customer.relationship?.customerType || 'prospect',
            status: customer.compliance?.kycStatus || 'pending',
            email: customer.contactInfo?.primaryEmail,
            phone: customer.contactInfo?.primaryPhone,
            address: customer.addresses?.[0] ? {
                street: customer.addresses[0].addressLine1,
                city: customer.addresses[0].city,
                state: customer.addresses[0].state,
                pincode: customer.addresses[0].pincode,
                country: customer.addresses[0].country
            } : null,
            contactPerson: customer.contactPersons?.[0] ? {
                name: customer.contactPersons[0].name,
                designation: customer.contactPersons[0].designation,
                email: customer.contactPersons[0].email,
                phone: customer.contactPersons[0].phone
            } : null,
            totalOrders: customer.purchaseHistory?.totalOrders || 0,
            totalRevenue: customer.purchaseHistory?.totalOrderValue || 0,
            creditLimit: customer.financialInfo?.creditLimit || 0,
            paymentTerms: customer.financialInfo?.paymentTerms || 'Net 30',
            companyId: customer.companyId,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        }));
        res.json({
            success: true,
            data: transformedCustomers,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            error: 'Failed to fetch customers',
            message: 'An error occurred while fetching customers'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const user = req.user;
        const companyId = user.isSuperAdmin ? req.query.companyId || user.companyId : user.companyId;
        const stats = await Customer_1.default.aggregate([
            {
                $match: {
                    companyId: new mongoose_1.default.Types.ObjectId(companyId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    activeCustomers: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    inactiveCustomers: {
                        $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
                    },
                    pendingCustomers: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    corporateCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'corporate'] }, 1, 0] }
                    },
                    individualCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'individual'] }, 1, 0] }
                    },
                    governmentCustomers: {
                        $sum: { $cond: [{ $eq: ['$customerType', 'government'] }, 1, 0] }
                    },
                    totalCreditLimit: { $sum: '$creditLimit' }
                }
            }
        ]);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const newCustomersThisMonth = await Customer_1.default.countDocuments({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true,
            createdAt: { $gte: thisMonth }
        });
        const result = stats[0] || {
            totalCustomers: 0,
            activeCustomers: 0,
            inactiveCustomers: 0,
            pendingCustomers: 0,
            corporateCustomers: 0,
            individualCustomers: 0,
            governmentCustomers: 0,
            totalCreditLimit: 0
        };
        res.json({
            success: true,
            data: {
                ...result,
                newCustomersThisMonth,
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0
            }
        });
    }
    catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch customer statistics',
            message: 'An error occurred while fetching customer statistics'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        const customerData = req.body;
        const newCustomer = new Customer_1.default({
            ...customerData,
            companyId: user.companyId,
            createdBy: user.userId,
            isActive: true
        });
        await newCustomer.save();
        res.status(201).json({
            success: true,
            data: newCustomer,
            message: 'Customer created successfully'
        });
    }
    catch (error) {
        console.error('Create customer error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Duplicate customer',
                message: 'A customer with this code already exists'
            });
        }
        res.status(500).json({
            error: 'Failed to create customer',
            message: 'An error occurred while creating the customer'
        });
    }
});
router.put('/:customerId', async (req, res) => {
    try {
        const user = req.user;
        const { customerId } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                error: 'Invalid customer ID',
                message: 'The provided customer ID is not valid'
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(customerId),
            isActive: true
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const updatedCustomer = await Customer_1.default.findOneAndUpdate(query, {
            ...updateData,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true, runValidators: true });
        if (!updatedCustomer) {
            return res.status(404).json({
                error: 'Customer not found',
                message: 'The requested customer was not found or you do not have access to it'
            });
        }
        res.json({
            success: true,
            data: updatedCustomer,
            message: 'Customer updated successfully'
        });
    }
    catch (error) {
        console.error('Update customer error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Failed to update customer',
            message: 'An error occurred while updating the customer'
        });
    }
});
router.delete('/:customerId', async (req, res) => {
    try {
        const user = req.user;
        const { customerId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                error: 'Invalid customer ID',
                message: 'The provided customer ID is not valid'
            });
        }
        let query = {
            _id: new mongoose_1.default.Types.ObjectId(customerId),
            isActive: true
        };
        if (!user.isSuperAdmin) {
            query.companyId = new mongoose_1.default.Types.ObjectId(user.companyId);
        }
        const deletedCustomer = await Customer_1.default.findOneAndUpdate(query, {
            isActive: false,
            updatedBy: user.userId,
            updatedAt: new Date()
        }, { new: true });
        if (!deletedCustomer) {
            return res.status(404).json({
                error: 'Customer not found',
                message: 'The requested customer was not found or you do not have access to it'
            });
        }
        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({
            error: 'Failed to delete customer',
            message: 'An error occurred while deleting the customer'
        });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map