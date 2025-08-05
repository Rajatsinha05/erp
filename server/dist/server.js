"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const environment_1 = __importDefault(require("@/config/environment"));
const database_1 = __importDefault(require("@/config/database"));
const logger_1 = __importStar(require("@/utils/logger"));
mongoose_1.default.set('debug', false);
console.log('✅ Basic imports loaded');
console.log('✅ About to import middleware...');
const security_1 = require("@/middleware/security");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
console.log('✅ Middleware imported');
console.log('✅ About to import routes...');
const auth_2 = __importDefault(require("@/routes/auth"));
console.log('✅ Auth routes imported');
const dashboard_1 = __importDefault(require("@/routes/dashboard"));
console.log('✅ Dashboard routes imported');
console.log('✅ Reports routes imported');
const companies_1 = __importDefault(require("@/routes/companies"));
console.log('✅ Companies routes imported');
const users_1 = __importDefault(require("@/routes/users"));
console.log('✅ Users routes imported');
const orders_1 = __importDefault(require("@/routes/orders"));
console.log('✅ Orders routes imported');
const twoFactor_1 = __importDefault(require("@/routes/twoFactor"));
const adminTwoFactor_1 = __importDefault(require("@/routes/adminTwoFactor"));
const adminUsers_1 = __importDefault(require("@/routes/adminUsers"));
const adminCompanies_1 = __importDefault(require("@/routes/adminCompanies"));
const userManagement_1 = __importDefault(require("@/routes/userManagement"));
console.log('✅ 2FA and admin routes imported');
const inventory_1 = __importDefault(require("@/routes/inventory"));
console.log('✅ Inventory routes imported');
const customers_1 = __importDefault(require("@/routes/customers"));
console.log('✅ Customers routes imported');
const suppliers_1 = __importDefault(require("@/routes/suppliers"));
console.log('✅ Suppliers routes imported');
const roles_1 = __importDefault(require("@/routes/roles"));
console.log('✅ Roles routes imported');
const setup_1 = __importDefault(require("@/routes/setup"));
console.log('✅ Setup routes imported');
console.log('✅ Visitor routes imported');
const spares_1 = __importDefault(require("@/routes/spares"));
console.log('✅ Spares routes imported');
const customerVisits_1 = __importDefault(require("@/routes/customerVisits"));
console.log('✅ Customer visits routes imported');
const vehicles_1 = __importDefault(require("@/routes/vehicles"));
console.log('✅ Vehicles routes imported');
const enhancedInventory_1 = __importDefault(require("@/routes/enhancedInventory"));
console.log('✅ Enhanced inventory routes imported');
console.log('📝 Loading complete V2 routes...');
console.log('✅ V2 routes imported with all 24 models');
console.log('✅ V2 Simple routes imported');
console.log('✅ All routes imported successfully!');
console.log('🚀 About to create Express app...');
console.log('🚀 Creating Express app...');
const app = (0, express_1.default)();
exports.app = app;
console.log('✅ Express app created');
if (environment_1.default.TRUST_PROXY) {
    app.set('trust proxy', 1);
}
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use((0, cookie_parser_1.default)(environment_1.default.COOKIE_SECRET));
app.use((0, express_session_1.default)({
    name: environment_1.default.SESSION_NAME,
    secret: environment_1.default.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: environment_1.default.COOKIE_SECURE,
        httpOnly: environment_1.default.COOKIE_HTTP_ONLY,
        maxAge: environment_1.default.SESSION_MAX_AGE,
        sameSite: environment_1.default.COOKIE_SAME_SITE,
        domain: environment_1.default.NODE_ENV === 'production' ? environment_1.default.COOKIE_DOMAIN : undefined
    },
    store: connect_mongo_1.default.create({
        mongoUrl: environment_1.default.MONGODB_URI,
        touchAfter: 24 * 3600,
        ttl: environment_1.default.SESSION_MAX_AGE / 1000,
        autoRemove: 'native',
        crypto: {
            secret: environment_1.default.SESSION_SECRET
        }
    })
}));
app.use(security_1.securityMiddleware);
if (environment_1.default.NODE_ENV === 'development') {
    app.use(logger_1.morganMiddleware.dev);
}
else {
    app.use(logger_1.morganMiddleware.combined);
}
app.use(logger_1.requestLoggerMiddleware);
app.use(security_1.requestLogger);
app.get('/health', async (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        environment: environment_1.default.NODE_ENV,
        version: environment_1.default.APP_VERSION,
        checks: {
            database: false,
            memory: false,
            disk: false
        }
    };
    try {
        healthCheck.checks.database = await database_1.default.healthCheck();
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };
        healthCheck.checks.memory = memUsageMB.heapUsed < 1000;
        healthCheck.memory = memUsageMB;
        const isHealthy = Object.values(healthCheck.checks).every(check => check === true);
        if (isHealthy) {
            (0, logger_1.logHealth)('application', 'healthy', healthCheck);
            res.status(200).json(healthCheck);
        }
        else {
            (0, logger_1.logHealth)('application', 'unhealthy', healthCheck);
            res.status(503).json(healthCheck);
        }
    }
    catch (error) {
        (0, logger_1.logHealth)('application', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(503).json({
            ...healthCheck,
            message: 'Service Unavailable',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/ready', async (req, res) => {
    try {
        const dbHealthy = await database_1.default.healthCheck();
        if (dbHealthy) {
            res.status(200).json({ status: 'ready' });
        }
        else {
            res.status(503).json({ status: 'not ready', reason: 'database not available' });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            reason: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', auth_2.default);
apiRouter.use('/setup', setup_1.default);
apiRouter.use(auth_1.authenticate);
apiRouter.use('/auth/2fa', twoFactor_1.default);
apiRouter.use('/admin', adminTwoFactor_1.default);
apiRouter.use('/admin', adminUsers_1.default);
apiRouter.use('/admin', adminCompanies_1.default);
apiRouter.use('/admin/users', userManagement_1.default);
apiRouter.use(auth_1.requireCompany);
apiRouter.use('/dashboard', dashboard_1.default);
apiRouter.use('/companies', companies_1.default);
apiRouter.use('/users', users_1.default);
apiRouter.use('/orders', orders_1.default);
apiRouter.use('/inventory', inventory_1.default);
apiRouter.use('/inventory-enhanced', enhancedInventory_1.default);
apiRouter.use('/customers', customers_1.default);
apiRouter.use('/suppliers', suppliers_1.default);
apiRouter.use('/roles', roles_1.default);
apiRouter.use('/spares', spares_1.default);
apiRouter.use('/customer-visits', customerVisits_1.default);
apiRouter.use('/vehicles', vehicles_1.default);
app.use(environment_1.default.API_PREFIX, apiRouter);
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
let io = null;
exports.io = io;
if (environment_1.default.ENABLE_WEBSOCKETS) {
    exports.io = io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: environment_1.default.CORS_ORIGIN,
            credentials: environment_1.default.CORS_CREDENTIALS
        },
        transports: ['websocket', 'polling']
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            next();
        }
        catch (error) {
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.default.info('WebSocket client connected', {
            socketId: socket.id,
            userId: socket.userId,
            ip: socket.handshake.address
        });
        socket.on('disconnect', (reason) => {
            logger_1.default.info('WebSocket client disconnected', {
                socketId: socket.id,
                reason,
                userId: socket.userId
            });
        });
        socket.on('join-company', (companyId) => {
            socket.join(`company:${companyId}`);
            logger_1.default.info('Client joined company room', {
                socketId: socket.id,
                companyId,
                userId: socket.userId
            });
        });
        socket.on('leave-company', (companyId) => {
            socket.leave(`company:${companyId}`);
            logger_1.default.info('Client left company room', {
                socketId: socket.id,
                companyId,
                userId: socket.userId
            });
        });
    });
}
app.use(security_1.securityErrorHandler);
app.use(logger_1.errorLoggerMiddleware);
app.use('*', (req, res) => {
    logger_1.default.warn('Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const gracefulShutdown = async (signal) => {
    logger_1.default.info(`Received ${signal}. Starting graceful shutdown...`);
    httpServer.close(() => {
        logger_1.default.info('HTTP server closed');
    });
    if (io) {
        io.close(() => {
            logger_1.default.info('WebSocket server closed');
        });
    }
    try {
        await database_1.default.disconnect();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error closing database connection', { error });
    }
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});
const startServer = async () => {
    try {
        logger_1.default.info('🚀 Starting Factory ERP Server...');
        logger_1.default.info('📊 Attempting database connection...');
        await database_1.default.connect();
        logger_1.default.info('✅ Database connected successfully!');
        httpServer.listen(environment_1.default.PORT, () => {
            logger_1.default.info(`🚀 Factory ERP Server started successfully`, {
                port: environment_1.default.PORT,
                environment: environment_1.default.NODE_ENV,
                version: environment_1.default.APP_VERSION,
                database: database_1.default.getConnectionStatus(),
                websockets: environment_1.default.ENABLE_WEBSOCKETS,
                cors: environment_1.default.CORS_ORIGIN,
                apiPrefix: environment_1.default.API_PREFIX
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map