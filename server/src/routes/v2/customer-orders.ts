import { Router } from 'express';
import { CustomerOrderController } from '../../controllers/CustomerOrderController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const customerOrderController = new CustomerOrderController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v2/customer-orders
 * @desc    Create a new customer order
 * @access  Private
 */
router.post('/', customerOrderController.createCustomerOrder.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders
 * @desc    Get customer orders by company with pagination and filters
 * @access  Private
 */
router.get('/', customerOrderController.getOrdersByCompany.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders/stats
 * @desc    Get customer order statistics
 * @access  Private
 */
router.get('/stats', customerOrderController.getOrderStats.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders/status/:status
 * @desc    Get customer orders by status
 * @access  Private
 */
router.get('/status/:status', customerOrderController.getOrdersByStatus.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders/customer/:customerId
 * @desc    Get orders by customer
 * @access  Private
 */
router.get('/customer/:customerId', customerOrderController.getOrdersByCustomer.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders/order/:orderNumber
 * @desc    Get customer order by number
 * @access  Private
 */
router.get('/order/:orderNumber', customerOrderController.getOrderByNumber.bind(customerOrderController));

/**
 * @route   GET /api/v2/customer-orders/:id
 * @desc    Get customer order by ID
 * @access  Private
 */
router.get('/:id', customerOrderController.getCustomerOrderById.bind(customerOrderController));

/**
 * @route   PUT /api/v2/customer-orders/:id
 * @desc    Update customer order
 * @access  Private
 */
router.put('/:id', customerOrderController.updateCustomerOrder.bind(customerOrderController));

/**
 * @route   PUT /api/v2/customer-orders/:orderId/status
 * @desc    Update order status
 * @access  Private
 */
router.put('/:orderId/status', customerOrderController.updateOrderStatus.bind(customerOrderController));

/**
 * @route   DELETE /api/v2/customer-orders/:id
 * @desc    Cancel customer order
 * @access  Private
 */
router.delete('/:id', customerOrderController.deleteCustomerOrder.bind(customerOrderController));

export default router;
