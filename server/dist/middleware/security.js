"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = exports.ipWhitelist = exports.securityErrorHandler = exports.requestLogger = exports.securityMiddleware = exports.speedLimiter = exports.uploadRateLimit = exports.authRateLimit = exports.generalRateLimit = exports.createRateLimit = exports.helmetOptions = exports.corsOptions = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const compression_1 = __importDefault(require("compression"));
const environment_1 = __importDefault(require("@/config/environment"));
const logger_1 = __importDefault(require("@/utils/logger"));
exports.corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (environment_1.default.CORS_ORIGIN.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_1.default.warn('CORS blocked request', { origin, allowedOrigins: environment_1.default.CORS_ORIGIN });
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: environment_1.default.CORS_CREDENTIALS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Company-ID',
        'X-API-Key',
        'X-Request-ID',
        'X-User-Agent',
        'X-Forwarded-For'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset'
    ],
    maxAge: 86400
};
exports.helmetOptions = {
    contentSecurityPolicy: environment_1.default.ENABLE_CONTENT_SECURITY_POLICY ? {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            connectSrc: ["'self'", "https://api.factoryerp.com"],
            workerSrc: ["'self'", "blob:"]
        }
    } : false,
    crossOriginEmbedderPolicy: false,
    hsts: environment_1.default.ENABLE_HSTS ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    } : false,
    noSniff: environment_1.default.ENABLE_NOSNIFF,
    xssFilter: environment_1.default.ENABLE_XSS_FILTER,
    referrerPolicy: {
        policy: "same-origin"
    }
};
const createRateLimit = (windowMs, max, message) => {
    const isDev = process.env.NODE_ENV === 'development';
    const adjustedMax = isDev ? max * 10 : max;
    return (0, express_rate_limit_1.default)({
        windowMs,
        max: adjustedMax,
        message: message || {
            error: 'Too many requests',
            message: `Too many requests from this IP, please try again later. (${adjustedMax} requests per ${windowMs / 1000}s)`,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            return req.path === '/health' || req.path === '/metrics';
        },
        keyGenerator: (req) => {
            const userId = req.user?.id;
            return userId ? `${req.ip}-${userId}` : req.ip;
        },
        handler: (req, res) => {
            logger_1.default.warn('Rate limit exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                userId: req.user?.id
            });
            res.status(429).json({
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.round(environment_1.default.RATE_LIMIT_WINDOW_MS / 1000)
            });
        }
    });
};
exports.createRateLimit = createRateLimit;
exports.generalRateLimit = (0, exports.createRateLimit)(environment_1.default.RATE_LIMIT_WINDOW_MS, environment_1.default.RATE_LIMIT_MAX_REQUESTS, 'Too many API requests');
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 5, 'Too many authentication attempts');
exports.uploadRateLimit = (0, exports.createRateLimit)(60 * 1000, 10, 'Too many file uploads');
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 500,
    maxDelayMs: 20000,
    skip: (req) => {
        return req.path === '/health' || req.path === '/metrics';
    },
    validate: { delayMs: false }
});
exports.securityMiddleware = [
    (req, res, next) => {
        if (environment_1.default.TRUST_PROXY) {
            req.app.set('trust proxy', true);
        }
        next();
    },
    (req, res, next) => {
        if (environment_1.default.DISABLE_X_POWERED_BY) {
            res.removeHeader('X-Powered-By');
        }
        next();
    },
    (0, helmet_1.default)(exports.helmetOptions),
    (0, cors_1.default)(exports.corsOptions),
    (0, compression_1.default)({
        filter: (req, res) => {
            if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
                return false;
            }
            return compression_1.default.filter(req, res);
        },
        level: 6,
        threshold: 1024
    }),
    (0, hpp_1.default)({
        whitelist: ['tags', 'categories', 'colors', 'sizes']
    }),
    (0, express_mongo_sanitize_1.default)({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            logger_1.default.warn('MongoDB injection attempt detected', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                sanitizedKey: key
            });
        }
    }),
    (0, xss_clean_1.default)(),
    exports.generalRateLimit,
    exports.speedLimiter
];
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    logger_1.default.info('Incoming request', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        referer: req.get('Referer'),
        userId: req.user?.id,
        companyId: req.headers['x-company-id']
    });
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        logger_1.default.info('Outgoing response', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length'),
            userId: req.user?.id
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
const securityErrorHandler = (err, req, res, next) => {
    const requestId = req.requestId;
    if (err.type === 'entity.too.large') {
        logger_1.default.warn('Request entity too large', {
            requestId,
            ip: req.ip,
            path: req.path,
            method: req.method,
            contentLength: req.get('Content-Length')
        });
        return res.status(413).json({
            error: 'Request entity too large',
            message: 'The request payload is too large',
            requestId
        });
    }
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS error',
            message: 'Origin not allowed by CORS policy',
            requestId
        });
    }
    if (err.code === 'EBADCSRFTOKEN') {
        logger_1.default.warn('CSRF token mismatch', {
            requestId,
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        return res.status(403).json({
            error: 'CSRF token mismatch',
            message: 'Invalid CSRF token',
            requestId
        });
    }
    next(err);
};
exports.securityErrorHandler = securityErrorHandler;
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip;
        if (!allowedIPs.includes(clientIP)) {
            logger_1.default.warn('IP not whitelisted', {
                ip: clientIP,
                path: req.path,
                method: req.method,
                userAgent: req.get('User-Agent')
            });
            return res.status(403).json({
                error: 'Access denied',
                message: 'Your IP address is not authorized to access this resource'
            });
        }
        next();
    };
};
exports.ipWhitelist = ipWhitelist;
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'X-API-Key header is required'
        });
    }
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    if (!validApiKeys.includes(apiKey)) {
        logger_1.default.warn('Invalid API key', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            apiKey: apiKey.substring(0, 8) + '...'
        });
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }
    next();
};
exports.validateApiKey = validateApiKey;
//# sourceMappingURL=security.js.map