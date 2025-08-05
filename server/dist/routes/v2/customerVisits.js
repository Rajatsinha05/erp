"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerVisitController_1 = require("../../controllers/CustomerVisitController");
const auth_1 = require("../../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const customerVisitController = new CustomerVisitController_1.CustomerVisitController();
const createCustomerVisitValidation = [
    (0, express_validator_1.body)('partyName').notEmpty().withMessage('Party name is required'),
    (0, express_validator_1.body)('contactPerson').notEmpty().withMessage('Contact person is required'),
    (0, express_validator_1.body)('contactPhone').notEmpty().withMessage('Contact phone is required'),
    (0, express_validator_1.body)('visitDate').isISO8601().withMessage('Valid visit date is required'),
    (0, express_validator_1.body)('purpose').isIn(['business_meeting', 'product_demo', 'negotiation', 'follow_up', 'site_visit', 'other']).withMessage('Valid purpose is required'),
    (0, express_validator_1.body)('purposeDescription').notEmpty().withMessage('Purpose description is required'),
    (0, express_validator_1.body)('travelType').isIn(['local', 'outstation', 'international']).withMessage('Valid travel type is required'),
    (0, express_validator_1.body)('companyId').notEmpty().withMessage('Company ID is required')
];
const updateCustomerVisitValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required')
];
const approveRejectValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required')
];
const addExpenseValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required')
];
router.use(auth_1.authenticate);
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('purpose').optional().isIn(['business_meeting', 'product_demo', 'negotiation', 'follow_up', 'site_visit', 'other']),
    (0, express_validator_1.query)('travelType').optional().isIn(['local', 'outstation', 'international']),
    (0, express_validator_1.query)('approvalStatus').optional().isIn(['pending', 'approved', 'rejected', 'reimbursed']),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Valid from date is required'),
    (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Valid to date is required'),
    validateRequest
], customerVisitController.getAllCustomerVisits.bind(customerVisitController));
router.get('/stats', [
    (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Valid from date is required'),
    (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Valid to date is required'),
    validateRequest
], customerVisitController.getExpenseStats.bind(customerVisitController));
router.get('/pending-approvals', customerVisitController.getPendingApprovals.bind(customerVisitController));
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required'),
    validateRequest
], customerVisitController.getCustomerVisitById.bind(customerVisitController));
router.post('/', [
    ...createCustomerVisitValidation,
    validateRequest
], customerVisitController.createCustomerVisit.bind(customerVisitController));
router.put('/:id', [
    ...updateCustomerVisitValidation,
    validateRequest
], customerVisitController.updateCustomerVisit.bind(customerVisitController));
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required'),
    validateRequest
], customerVisitController.deleteCustomerVisit.bind(customerVisitController));
router.patch('/:id/approve', [
    ...approveRejectValidation,
    (0, express_validator_1.body)('reimbursementAmount').optional().isNumeric().withMessage('Reimbursement amount must be a number'),
    validateRequest
], customerVisitController.approveVisit.bind(customerVisitController));
router.patch('/:id/reject', [
    ...approveRejectValidation,
    (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string'),
    validateRequest
], customerVisitController.rejectVisit.bind(customerVisitController));
router.patch('/:id/reimburse', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid customer visit ID is required'),
    validateRequest
], customerVisitController.markAsReimbursed.bind(customerVisitController));
router.post('/:id/food-expense', [
    ...addExpenseValidation,
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages']).withMessage('Valid meal type is required'),
    (0, express_validator_1.body)('restaurant').notEmpty().withMessage('Restaurant name is required'),
    (0, express_validator_1.body)('location').notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('numberOfPeople').isInt({ min: 1 }).withMessage('Number of people must be at least 1'),
    (0, express_validator_1.body)('costPerPerson').isNumeric().withMessage('Cost per person must be a number'),
    validateRequest
], customerVisitController.addFoodExpense.bind(customerVisitController));
router.post('/:id/gift', [
    ...addExpenseValidation,
    (0, express_validator_1.body)('itemName').notEmpty().withMessage('Item name is required'),
    (0, express_validator_1.body)('itemType').isIn(['gift', 'sample', 'brochure', 'promotional_material']).withMessage('Valid item type is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('unitCost').isNumeric().withMessage('Unit cost must be a number'),
    validateRequest
], customerVisitController.addGift.bind(customerVisitController));
exports.default = router;
//# sourceMappingURL=customerVisits.js.map