import { Router } from 'express';
import { QuotationController } from '../../controllers/QuotationController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const quotationController = new QuotationController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v2/quotations
 * @desc    Create a new quotation
 * @access  Private
 */
router.post('/', quotationController.createQuotation.bind(quotationController));

/**
 * @route   GET /api/v2/quotations
 * @desc    Get quotations by company with pagination and filters
 * @access  Private
 */
router.get('/', quotationController.getQuotationsByCompany.bind(quotationController));

/**
 * @route   GET /api/v2/quotations/stats
 * @desc    Get quotation statistics
 * @access  Private
 */
router.get('/stats', quotationController.getQuotationStats.bind(quotationController));

/**
 * @route   GET /api/v2/quotations/expired
 * @desc    Get expired quotations
 * @access  Private
 */
router.get('/expired', quotationController.getExpiredQuotations.bind(quotationController));

/**
 * @route   GET /api/v2/quotations/customer/:customerId
 * @desc    Get quotations by customer
 * @access  Private
 */
router.get('/customer/:customerId', quotationController.getQuotationsByCustomer.bind(quotationController));

/**
 * @route   GET /api/v2/quotations/:id
 * @desc    Get quotation by ID
 * @access  Private
 */
router.get('/:id', quotationController.getQuotationById.bind(quotationController));

/**
 * @route   PUT /api/v2/quotations/:id
 * @desc    Update quotation
 * @access  Private
 */
router.put('/:id', quotationController.updateQuotation.bind(quotationController));

/**
 * @route   PUT /api/v2/quotations/:quotationId/status
 * @desc    Update quotation status
 * @access  Private
 */
router.put('/:quotationId/status', quotationController.updateQuotationStatus.bind(quotationController));

/**
 * @route   POST /api/v2/quotations/:quotationId/convert
 * @desc    Convert quotation to order
 * @access  Private
 */
router.post('/:quotationId/convert', quotationController.convertToOrder.bind(quotationController));

/**
 * @route   DELETE /api/v2/quotations/:id
 * @desc    Cancel quotation
 * @access  Private
 */
router.delete('/:id', quotationController.deleteQuotation.bind(quotationController));

export default router;
