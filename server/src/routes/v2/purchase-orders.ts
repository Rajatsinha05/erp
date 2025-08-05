import { Router } from 'express';
import { PurchaseOrderController } from '../../controllers/PurchaseOrderController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v2/purchase-orders
 * @desc    Create a new purchase order
 * @access  Private
 */
router.post('/', purchaseOrderController.createPurchaseOrder.bind(purchaseOrderController));

/**
 * @route   GET /api/v2/purchase-orders
 * @desc    Get purchase orders by company with pagination and filters
 * @access  Private
 */
router.get('/', purchaseOrderController.getOrdersByCompany.bind(purchaseOrderController));

/**
 * @route   GET /api/v2/purchase-orders/stats
 * @desc    Get purchase order statistics
 * @access  Private
 */
router.get('/stats', purchaseOrderController.getOrderStats.bind(purchaseOrderController));

/**
 * @route   GET /api/v2/purchase-orders/status/:status
 * @desc    Get purchase orders by status
 * @access  Private
 */
router.get('/status/:status', purchaseOrderController.getOrdersByStatus.bind(purchaseOrderController));

/**
 * @route   GET /api/v2/purchase-orders/supplier/:supplierId
 * @desc    Get orders by supplier
 * @access  Private
 */
router.get('/supplier/:supplierId', purchaseOrderController.getOrdersBySupplier.bind(purchaseOrderController));

/**
 * @route   GET /api/v2/purchase-orders/:id
 * @desc    Get purchase order by ID
 * @access  Private
 */
router.get('/:id', purchaseOrderController.getPurchaseOrderById.bind(purchaseOrderController));

/**
 * @route   PUT /api/v2/purchase-orders/:id
 * @desc    Update purchase order
 * @access  Private
 */
router.put('/:id', purchaseOrderController.updatePurchaseOrder.bind(purchaseOrderController));

/**
 * @route   PUT /api/v2/purchase-orders/:orderId/status
 * @desc    Update order status
 * @access  Private
 */
router.put('/:orderId/status', purchaseOrderController.updateOrderStatus.bind(purchaseOrderController));

/**
 * @route   POST /api/v2/purchase-orders/:orderId/receive
 * @desc    Receive items for purchase order
 * @access  Private
 */
router.post('/:orderId/receive', purchaseOrderController.receiveItems.bind(purchaseOrderController));

/**
 * @route   DELETE /api/v2/purchase-orders/:id
 * @desc    Cancel purchase order
 * @access  Private
 */
router.delete('/:id', purchaseOrderController.deletePurchaseOrder.bind(purchaseOrderController));

export default router;
