"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const auth_2 = __importDefault(require("../auth"));
const companies_1 = __importDefault(require("./companies"));
const users_1 = __importDefault(require("./users"));
const visitors_1 = __importDefault(require("./visitors"));
const visitorsSimple_1 = __importDefault(require("./visitorsSimple"));
const customers_1 = __importDefault(require("./customers"));
const suppliers_1 = __importDefault(require("./suppliers"));
const inventory_1 = __importDefault(require("./inventory"));
const production_1 = __importDefault(require("./production"));
const customer_orders_1 = __importDefault(require("./customer-orders"));
const invoices_1 = __importDefault(require("./invoices"));
const purchase_orders_1 = __importDefault(require("./purchase-orders"));
const quotations_1 = __importDefault(require("./quotations"));
const roles_1 = __importDefault(require("./roles"));
const vehicles_1 = __importDefault(require("./vehicles"));
const warehouses_1 = __importDefault(require("./warehouses"));
const stock_movements_1 = __importDefault(require("./stock-movements"));
const financial_transactions_1 = __importDefault(require("./financial-transactions"));
const audit_logs_1 = __importDefault(require("./audit-logs"));
const security_logs_1 = __importDefault(require("./security-logs"));
const business_analytics_1 = __importDefault(require("./business-analytics"));
const boiler_monitoring_1 = __importDefault(require("./boiler-monitoring"));
const electricity_monitoring_1 = __importDefault(require("./electricity-monitoring"));
const hospitality_1 = __importDefault(require("./hospitality"));
const dispatch_1 = __importDefault(require("./dispatch"));
const reports_1 = __importDefault(require("./reports"));
const spares_1 = __importDefault(require("./spares"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API v2 is healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});
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
router.use('/auth', auth_2.default);
router.use('/companies', companies_1.default);
router.use('/users', users_1.default);
router.use('/visitors', visitors_1.default);
router.use('/visitors-simple', visitorsSimple_1.default);
router.use('/customers', customers_1.default);
router.use('/suppliers', suppliers_1.default);
router.use('/inventory', inventory_1.default);
router.use('/production', production_1.default);
router.use('/customer-orders', customer_orders_1.default);
router.use('/invoices', invoices_1.default);
router.use('/purchase-orders', purchase_orders_1.default);
router.use('/quotations', quotations_1.default);
router.use('/roles', roles_1.default);
router.use('/vehicles', vehicles_1.default);
router.use('/warehouses', warehouses_1.default);
router.use('/stock-movements', stock_movements_1.default);
router.use('/financial-transactions', financial_transactions_1.default);
router.use('/audit-logs', audit_logs_1.default);
router.use('/security-logs', security_logs_1.default);
router.use('/business-analytics', business_analytics_1.default);
router.use('/boiler-monitoring', boiler_monitoring_1.default);
router.use('/electricity-monitoring', electricity_monitoring_1.default);
router.use('/hospitality', hospitality_1.default);
router.use('/dispatch', dispatch_1.default);
router.use('/reports', reports_1.default);
router.use('/spares', spares_1.default);
router.get('/protected', auth_1.authenticate, (req, res) => {
    const user = req.user;
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
router.use('*', (req, res) => {
    logger_1.logger.warn('API v2 route not found', {
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
exports.default = router;
//# sourceMappingURL=index.js.map