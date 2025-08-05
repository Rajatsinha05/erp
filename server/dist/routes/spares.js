"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const SpareController_1 = require("../controllers/SpareController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const spareController = new SpareController_1.SpareController();
router.use(auth_1.authenticate);
const createSpareValidation = [
    (0, express_validator_1.body)('spareCode')
        .notEmpty()
        .withMessage('Spare code is required')
        .isLength({ max: 100 })
        .withMessage('Spare code must be less than 100 characters'),
    (0, express_validator_1.body)('spareName')
        .notEmpty()
        .withMessage('Spare name is required')
        .isLength({ max: 255 })
        .withMessage('Spare name must be less than 255 characters'),
    (0, express_validator_1.body)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['mechanical', 'electrical', 'electronic', 'hydraulic', 'pneumatic', 'consumable', 'tool', 'safety', 'other'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('partNumber')
        .notEmpty()
        .withMessage('Part number is required')
        .isLength({ max: 100 })
        .withMessage('Part number must be less than 100 characters'),
    (0, express_validator_1.body)('manufacturer')
        .notEmpty()
        .withMessage('Manufacturer is required')
        .isLength({ max: 100 })
        .withMessage('Manufacturer must be less than 100 characters'),
    (0, express_validator_1.body)('stock.unit')
        .notEmpty()
        .withMessage('Stock unit is required'),
    (0, express_validator_1.body)('stock.reorderLevel')
        .isNumeric()
        .withMessage('Reorder level must be a number')
        .isFloat({ min: 0 })
        .withMessage('Reorder level must be non-negative'),
    (0, express_validator_1.body)('stock.minStockLevel')
        .isNumeric()
        .withMessage('Minimum stock level must be a number')
        .isFloat({ min: 0 })
        .withMessage('Minimum stock level must be non-negative'),
    (0, express_validator_1.body)('stock.maxStockLevel')
        .isNumeric()
        .withMessage('Maximum stock level must be a number')
        .isFloat({ min: 0 })
        .withMessage('Maximum stock level must be non-negative'),
    (0, express_validator_1.body)('maintenance.criticality')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid criticality level')
];
const updateSpareValidation = [
    (0, express_validator_1.body)('spareCode')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Spare code must be less than 100 characters'),
    (0, express_validator_1.body)('spareName')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Spare name must be less than 255 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['mechanical', 'electrical', 'electronic', 'hydraulic', 'pneumatic', 'consumable', 'tool', 'safety', 'other'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('partNumber')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Part number must be less than 100 characters'),
    (0, express_validator_1.body)('manufacturer')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Manufacturer must be less than 100 characters'),
    (0, express_validator_1.body)('maintenance.criticality')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid criticality level')
];
const stockUpdateValidation = [
    (0, express_validator_1.body)('quantity')
        .isNumeric()
        .withMessage('Quantity must be a number')
        .isFloat({ min: 0 })
        .withMessage('Quantity must be non-negative'),
    (0, express_validator_1.body)('type')
        .isIn(['inward', 'outward', 'adjustment'])
        .withMessage('Invalid stock update type'),
    (0, express_validator_1.body)('reason')
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters')
];
const idValidation = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid spare ID')
];
const spareCodeValidation = [
    (0, express_validator_1.param)('spareCode')
        .notEmpty()
        .withMessage('Spare code is required')
];
const categoryValidation = [
    (0, express_validator_1.param)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['mechanical', 'electrical', 'electronic', 'hydraulic', 'pneumatic', 'consumable', 'tool', 'safety', 'other'])
        .withMessage('Invalid category')
];
router.post('/', createSpareValidation, spareController.createSpare.bind(spareController));
router.get('/', spareController.getSparesByCompany.bind(spareController));
router.get('/stats', spareController.getSpareStats.bind(spareController));
router.get('/low-stock', spareController.getLowStockSpares.bind(spareController));
router.get('/category/:category', categoryValidation, spareController.getSparesByCategory.bind(spareController));
router.get('/check-code/:spareCode', spareCodeValidation, spareController.checkSpareCodeUnique.bind(spareController));
router.get('/:id', idValidation, spareController.getSpareById.bind(spareController));
router.put('/:id', [...idValidation, ...updateSpareValidation], spareController.updateSpare.bind(spareController));
router.post('/:spareId/stock', [
    (0, express_validator_1.param)('spareId').isMongoId().withMessage('Invalid spare ID'),
    ...stockUpdateValidation
], spareController.updateStock.bind(spareController));
router.delete('/:id', idValidation, spareController.deleteSpare.bind(spareController));
exports.default = router;
//# sourceMappingURL=spares.js.map