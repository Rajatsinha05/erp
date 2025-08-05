import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v2 is healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Factory ERP API v2 - Complete Business Management System',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    description: 'Comprehensive Factory ERP API with all business modules',
    endpoints: {
      // Core endpoints
      health: '/api/v2/health',
      info: '/api/v2/info',

      // Authentication
      auth: '/api/v2/auth/*',

      // Master Data
      companies: '/api/v2/companies/*',
      users: '/api/v2/users/*',

      // Business Operations
      customers: '/api/v2/customers/*',
      suppliers: '/api/v2/suppliers/*',
      inventory: '/api/v2/inventory/*',
      production: '/api/v2/production/*',

      // Transactions
      'purchase-orders': '/api/v2/purchase-orders/*',
      invoices: '/api/v2/invoices/*',

      // Visitor Management
      visitors: '/api/v2/visitors/*'
    },
    features: [
      'Complete Authentication & Authorization',
      'Company & User Management',
      'Customer & Supplier Management',
      'Inventory Management',
      'Production Planning & Control',
      'Purchase Order Management',
      'Invoice & Billing',
      'Visitor Management System',
      'Real-time Performance Monitoring',
      'Advanced Caching & Optimization'
    ]
  });
});

// Import only essential routes first (gradually add more)
console.log('🔄 Loading V2 routes safely...');

try {
  // Import auth routes (already working)
  console.log('📝 Loading auth routes...');
  const authRoutes = require('../auth').default;
  router.use('/auth', authRoutes);
  console.log('✅ Auth routes loaded');

  // Import company routes
  console.log('📝 Loading company routes...');
  const companyRoutes = require('./companies').default;
  router.use('/companies', authenticate, companyRoutes);
  console.log('✅ Company routes loaded');

  // Import user routes
  console.log('📝 Loading user routes...');
  const userRoutes = require('./users').default;
  router.use('/users', authenticate, userRoutes);
  console.log('✅ User routes loaded');

  // Import visitor routes
  console.log('📝 Loading visitor routes...');
  const visitorRoutes = require('./visitors').default;
  router.use('/visitors', authenticate, visitorRoutes);
  console.log('✅ Visitor routes loaded');

  console.log('🎉 Essential V2 routes loaded successfully!');

} catch (error) {
  console.error('❌ Error loading V2 routes:', error);
  logger.error('Error loading V2 routes', { error });
}

// Load all business routes
try {
  console.log('📝 Loading business routes...');

  // Customer routes
  const customerRoutes = require('./customers').default;
  router.use('/customers', authenticate, customerRoutes);
  console.log('✅ Customer routes loaded');

  // Supplier routes
  const supplierRoutes = require('./suppliers').default;
  router.use('/suppliers', authenticate, supplierRoutes);
  console.log('✅ Supplier routes loaded');

  // Inventory routes
  const inventoryRoutes = require('./inventory').default;
  router.use('/inventory', authenticate, inventoryRoutes);
  console.log('✅ Inventory routes loaded');

  // Production routes
  const productionRoutes = require('./production').default;
  router.use('/production', authenticate, productionRoutes);
  console.log('✅ Production routes loaded');

  // Purchase Order routes
  const purchaseOrderRoutes = require('./purchase-orders').default;
  router.use('/purchase-orders', authenticate, purchaseOrderRoutes);
  console.log('✅ Purchase Order routes loaded');

  // Invoice routes
  const invoiceRoutes = require('./invoices').default;
  router.use('/invoices', authenticate, invoiceRoutes);
  console.log('✅ Invoice routes loaded');

  // Additional business routes
  const customerOrderRoutes = require('./customer-orders').default;
  router.use('/customer-orders', authenticate, customerOrderRoutes);
  console.log('✅ Customer Order routes loaded');

  const quotationRoutes = require('./quotations').default;
  router.use('/quotations', authenticate, quotationRoutes);
  console.log('✅ Quotation routes loaded');

  const warehouseRoutes = require('./warehouses').default;
  router.use('/warehouses', authenticate, warehouseRoutes);
  console.log('✅ Warehouse routes loaded');

  const stockMovementRoutes = require('./stock-movements').default;
  router.use('/stock-movements', authenticate, stockMovementRoutes);
  console.log('✅ Stock Movement routes loaded');

  console.log('✅ All business routes loaded successfully!');

} catch (error) {
  console.error('❌ Error loading business routes:', error);
  logger.error('Error loading business routes', { error });
}

// Catch-all route for V2 API
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API v2 endpoint not found',
    path: req.originalUrl,
    suggestion: 'Check /api/v2/info for all available endpoints',
    availableEndpoints: [
      '/api/v2/health',
      '/api/v2/info',
      '/api/v2/auth/*',
      '/api/v2/companies/*',
      '/api/v2/users/*',
      '/api/v2/customers/*',
      '/api/v2/suppliers/*',
      '/api/v2/inventory/*',
      '/api/v2/production/*',
      '/api/v2/purchase-orders/*',
      '/api/v2/invoices/*',
      '/api/v2/visitors/*'
    ]
  });
});

export default router;
