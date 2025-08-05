import { Router } from 'express';
import { InvoiceController } from '../../controllers/InvoiceController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const invoiceController = new InvoiceController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v2/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
router.post('/', invoiceController.createInvoice.bind(invoiceController));

/**
 * @route   POST /api/v2/invoices/generate-number
 * @desc    Generate next invoice number for a company
 * @access  Private
 */
router.post('/generate-number', invoiceController.generateInvoiceNumber.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices
 * @desc    Get invoices by company with pagination and filters
 * @access  Private
 */
router.get('/', invoiceController.getInvoicesByCompany.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private
 */
router.get('/stats', invoiceController.getInvoiceStats.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices/overdue
 * @desc    Get overdue invoices
 * @access  Private
 */
router.get('/overdue', invoiceController.getOverdueInvoices.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices/customer/:customerId
 * @desc    Get invoices by customer
 * @access  Private
 */
router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/:id', invoiceController.getInvoiceById.bind(invoiceController));

/**
 * @route   PUT /api/v2/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.put('/:id', invoiceController.updateInvoice.bind(invoiceController));

/**
 * @route   PUT /api/v2/invoices/:invoiceId/status
 * @desc    Update invoice status
 * @access  Private
 */
router.put('/:invoiceId/status', invoiceController.updateInvoiceStatus.bind(invoiceController));

/**
 * @route   POST /api/v2/invoices/:invoiceId/payment
 * @desc    Record payment for invoice
 * @access  Private
 */
router.post('/:invoiceId/payment', invoiceController.recordPayment.bind(invoiceController));

/**
 * @route   DELETE /api/v2/invoices/:id
 * @desc    Cancel invoice
 * @access  Private
 */
router.delete('/:id', invoiceController.deleteInvoice.bind(invoiceController));

/**
 * @route   GET /api/v2/invoices/:id/pdf
 * @desc    Generate PDF for invoice
 * @access  Private
 */
router.get('/:id/pdf', invoiceController.generateInvoicePDF.bind(invoiceController));

/**
 * @route   POST /api/v2/invoices/preview
 * @desc    Preview invoice before saving
 * @access  Private
 */
router.post('/preview', invoiceController.previewInvoice.bind(invoiceController));

export default router;
