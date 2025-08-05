import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { logger } from '@/utils/logger';

// Import route modules
import authRoutes from '../auth';
import companyRoutes from './companies';
import userRoutes from './users';
import visitorRoutes from './visitors';
import visitorSimpleRoutes from './visitorsSimple';

// Business route modules
import customerRoutes from './customers';
import supplierRoutes from './suppliers';
import inventoryRoutes from './inventory';
import productionRoutes from './production';
import customerOrderRoutes from './customer-orders';
import invoiceRoutes from './invoices';
import purchaseOrderRoutes from './purchase-orders';
import quotationRoutes from './quotations';
import roleRoutes from './roles';
import vehicleRoutes from './vehicles';
import warehouseRoutes from './warehouses';
import stockMovementRoutes from './stock-movements';
import financialTransactionRoutes from './financial-transactions';
import auditLogRoutes from './audit-logs';
import securityLogRoutes from './security-logs';
import businessAnalyticsRoutes from './business-analytics';
import boilerMonitoringRoutes from './boiler-monitoring';
import electricityMonitoringRoutes from './electricity-monitoring';
import hospitalityRoutes from './hospitality';
// import customerVisitRoutes from './customerVisits';
import dispatchRoutes from './dispatch';
import reportRoutes from './reports';
import spareRoutes from './spares';

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
    data: {
      name: 'Factory ERP API',
      version: '2.0.0',
      description: 'Complete Factory ERP System with 24 Models',
      features: [
        'Multi-tenant Company Management',
        'Advanced User Management with Dynamic Roles',
        'Comprehensive Visitor Management',
        'Complete Inventory Management',
        'Production Order Management',
        'Sales & Purchase Management',
        'Financial Transaction Management',
        'Security & Audit Logging',
        'Business Analytics & Reporting',
        'Industrial Monitoring Systems',
        'Hospitality Management',
        'Advanced Logistics & Dispatch',
        'Dynamic Report Generation'
      ],
      endpoints: {
        auth: '/api/v2/auth',
        companies: '/api/v2/companies',
        users: '/api/v2/users',
        visitors: '/api/v2/visitors',
        customers: '/api/v2/customers',
        suppliers: '/api/v2/suppliers',
        inventory: '/api/v2/inventory',
        production: '/api/v2/production',
        customerOrders: '/api/v2/customer-orders',
        invoices: '/api/v2/invoices',
        purchaseOrders: '/api/v2/purchase-orders',
        quotations: '/api/v2/quotations',
        roles: '/api/v2/roles',
        vehicles: '/api/v2/vehicles',
        warehouses: '/api/v2/warehouses',
        stockMovements: '/api/v2/stock-movements',
        financialTransactions: '/api/v2/financial-transactions',
        auditLogs: '/api/v2/audit-logs',
        securityLogs: '/api/v2/security-logs',
        businessAnalytics: '/api/v2/business-analytics',
        boilerMonitoring: '/api/v2/boiler-monitoring',
        electricityMonitoring: '/api/v2/electricity-monitoring',
        hospitality: '/api/v2/hospitality',
        dispatch: '/api/v2/dispatch',
        reports: '/api/v2/reports',
        spares: '/api/v2/spares'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/users', userRoutes);
router.use('/visitors', visitorRoutes);
router.use('/visitors-simple', visitorSimpleRoutes);

// Business route modules
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/production', productionRoutes);
router.use('/customer-orders', customerOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/quotations', quotationRoutes);
router.use('/roles', roleRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/financial-transactions', financialTransactionRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/security-logs', securityLogRoutes);
router.use('/business-analytics', businessAnalyticsRoutes);
router.use('/boiler-monitoring', boilerMonitoringRoutes);
router.use('/electricity-monitoring', electricityMonitoringRoutes);
router.use('/hospitality', hospitalityRoutes);
// router.use('/customer-visits', customerVisitRoutes);
router.use('/dispatch', dispatchRoutes);
router.use('/reports', reportRoutes);
router.use('/spares', spareRoutes);

// Protected route example
router.get('/protected', authenticate, (req, res) => {
  const user = (req as any).user;
  res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    user: {
      id: user.userId || user._id,
      username: user.username,
      email: user.email,
      companyId: user.companyId,
      isSuperAdmin: user.isSuperAdmin
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined routes
router.use('*', (req, res) => {
  logger.warn('API v2 route not found', { 
    method: req.method, 
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: {
      health: 'GET /api/v2/health',
      info: 'GET /api/v2/info',
      auth: {
        login: 'POST /api/v2/auth/login',
        register: 'POST /api/v2/auth/register',
        refresh: 'POST /api/v2/auth/refresh',
        logout: 'POST /api/v2/auth/logout',
        profile: 'GET /api/v2/auth/profile'
      },
      companies: {
        list: 'GET /api/v2/companies',
        create: 'POST /api/v2/companies',
        get: 'GET /api/v2/companies/:id',
        update: 'PUT /api/v2/companies/:id',
        delete: 'DELETE /api/v2/companies/:id'
      },
      users: {
        list: 'GET /api/v2/users',
        create: 'POST /api/v2/users',
        profile: 'GET /api/v2/users/profile',
        get: 'GET /api/v2/users/:id',
        update: 'PUT /api/v2/users/:id',
        delete: 'DELETE /api/v2/users/:id'
      },
      visitors: {
        list: 'GET /api/v2/visitors',
        create: 'POST /api/v2/visitors',
        get: 'GET /api/v2/visitors/:id',
        checkin: 'POST /api/v2/visitors/:id/checkin',
        checkout: 'POST /api/v2/visitors/:id/checkout',
        approve: 'POST /api/v2/visitors/:id/approve',
        reject: 'POST /api/v2/visitors/:id/reject'
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
