"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHealth = exports.logBusiness = exports.logError = exports.logDatabaseQuery = exports.logPerformance = exports.logAudit = exports.logSecurity = exports.logRequest = exports.performanceLogger = exports.auditLogger = exports.securityLogger = exports.default = exports.businessLogger = exports.apiLogger = exports.dbLogger = exports.performanceMonitor = exports.errorLoggerMiddleware = exports.requestLoggerMiddleware = exports.morganMiddleware = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const express_winston_1 = __importDefault(require("express-winston"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const environment_1 = __importDefault(require("@/config/environment"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};
winston_1.default.addColors(colors);
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack ? `\n${info.stack}` : ''} ${Object.keys(info).length > 3 ?
    `\n${JSON.stringify(Object.fromEntries(Object.entries(info).filter(([key]) => !['timestamp', 'level', 'message', 'stack'].includes(key))), null, 2)}` : ''}`));
const transports = [];
const shouldCreateLogFiles = environment_1.default.LOG_FILE && environment_1.default.LOG_FILE.trim() !== '';
if (environment_1.default.NODE_ENV === 'development') {
    transports.push(new winston_1.default.transports.Console({
        level: 'debug',
        format: consoleFormat
    }));
}
else {
    transports.push(new winston_1.default.transports.Console({
        level: 'info',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json())
    }));
}
if (shouldCreateLogFiles) {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'application-%DATE%.log'),
        datePattern: environment_1.default.LOG_DATE_PATTERN,
        maxSize: environment_1.default.LOG_MAX_SIZE,
        maxFiles: environment_1.default.LOG_MAX_FILES,
        level: environment_1.default.LOG_LEVEL,
        format: logFormat,
        auditFile: path_1.default.join('logs', 'audit.json'),
        zippedArchive: true
    }));
}
if (shouldCreateLogFiles) {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'error-%DATE%.log'),
        datePattern: environment_1.default.LOG_DATE_PATTERN,
        maxSize: environment_1.default.LOG_MAX_SIZE,
        maxFiles: environment_1.default.LOG_MAX_FILES,
        level: 'error',
        format: logFormat,
        auditFile: path_1.default.join('logs', 'error-audit.json'),
        zippedArchive: true
    }));
}
if (shouldCreateLogFiles) {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'access-%DATE%.log'),
        datePattern: environment_1.default.LOG_DATE_PATTERN,
        maxSize: environment_1.default.LOG_MAX_SIZE,
        maxFiles: environment_1.default.LOG_MAX_FILES,
        level: 'http',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
        auditFile: path_1.default.join('logs', 'access-audit.json'),
        zippedArchive: true
    }));
}
if (shouldCreateLogFiles) {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'security-%DATE%.log'),
        datePattern: environment_1.default.LOG_DATE_PATTERN,
        maxSize: environment_1.default.LOG_MAX_SIZE,
        maxFiles: environment_1.default.LOG_MAX_FILES,
        level: 'warn',
        format: logFormat,
        auditFile: path_1.default.join('logs', 'security-audit.json'),
        zippedArchive: true
    }));
}
exports.logger = winston_1.default.createLogger({
    level: environment_1.default.LOG_LEVEL,
    levels,
    format: logFormat,
    transports,
    exitOnError: false,
    ...(shouldCreateLogFiles ? {
        exceptionHandlers: [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join('logs', 'exceptions-%DATE%.log'),
                datePattern: environment_1.default.LOG_DATE_PATTERN,
                maxSize: environment_1.default.LOG_MAX_SIZE,
                maxFiles: environment_1.default.LOG_MAX_FILES,
                format: logFormat,
                zippedArchive: true
            })
        ],
        rejectionHandlers: [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join('logs', 'rejections-%DATE%.log'),
                datePattern: environment_1.default.LOG_DATE_PATTERN,
                maxSize: environment_1.default.LOG_MAX_SIZE,
                maxFiles: environment_1.default.LOG_MAX_FILES,
                format: logFormat,
                zippedArchive: true
            })
        ]
    } : {})
});
exports.default = exports.logger;
const securityLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.label({ label: 'SECURITY' }), winston_1.default.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'security-%DATE%.log'),
            datePattern: environment_1.default.LOG_DATE_PATTERN,
            maxSize: environment_1.default.LOG_MAX_SIZE,
            maxFiles: environment_1.default.LOG_MAX_FILES,
            zippedArchive: true
        })
    ]
});
exports.securityLogger = securityLogger;
const auditLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.label({ label: 'AUDIT' }), winston_1.default.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'audit-%DATE%.log'),
            datePattern: environment_1.default.LOG_DATE_PATTERN,
            maxSize: environment_1.default.LOG_MAX_SIZE,
            maxFiles: environment_1.default.LOG_MAX_FILES,
            zippedArchive: true
        })
    ]
});
exports.auditLogger = auditLogger;
const performanceLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.label({ label: 'PERFORMANCE' }), winston_1.default.format.json()),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'performance-%DATE%.log'),
            datePattern: environment_1.default.LOG_DATE_PATTERN,
            maxSize: environment_1.default.LOG_MAX_SIZE,
            maxFiles: environment_1.default.LOG_MAX_FILES,
            zippedArchive: true
        })
    ]
});
exports.performanceLogger = performanceLogger;
const logRequest = (req, res, duration) => {
    exports.logger.http('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        companyId: req.headers['x-company-id'],
        requestId: req.requestId
    });
};
exports.logRequest = logRequest;
const logSecurity = (event, details) => {
    securityLogger.warn(event, {
        ...details,
        timestamp: new Date().toISOString()
    });
};
exports.logSecurity = logSecurity;
const logAudit = (action, details) => {
    auditLogger.info(action, {
        ...details,
        timestamp: new Date().toISOString()
    });
};
exports.logAudit = logAudit;
const logPerformance = (operation, duration, details) => {
    performanceLogger.info(operation, {
        duration,
        ...details,
        timestamp: new Date().toISOString()
    });
};
exports.logPerformance = logPerformance;
const logDatabaseQuery = (query, duration, collection) => {
    if (environment_1.default.NODE_ENV === 'development') {
        exports.logger.debug('Database Query', {
            query,
            duration,
            collection,
            timestamp: new Date().toISOString()
        });
    }
};
exports.logDatabaseQuery = logDatabaseQuery;
const logError = (error, context) => {
    exports.logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        timestamp: new Date().toISOString()
    });
};
exports.logError = logError;
const logBusiness = (event, details) => {
    exports.logger.info(`Business Event: ${event}`, {
        ...details,
        timestamp: new Date().toISOString()
    });
};
exports.logBusiness = logBusiness;
const logHealth = (component, status, details) => {
    const level = status === 'healthy' ? 'info' : 'error';
    exports.logger.log(level, `Health Check: ${component}`, {
        status,
        ...details,
        timestamp: new Date().toISOString()
    });
};
exports.logHealth = logHealth;
morgan_1.default.token('id', (req) => req.requestId);
morgan_1.default.token('user-id', (req) => req.user?.id || 'anonymous');
morgan_1.default.token('company-id', (req) => req.headers['x-company-id'] || 'none');
morgan_1.default.token('real-ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);
morgan_1.default.token('user-agent', (req) => req.headers['user-agent']);
morgan_1.default.token('response-time-ms', (req, res) => `${res.responseTime}ms`);
const morganFormat = ':id :method :url :status :res[content-length] - :response-time ms - :real-ip - :user-id - :company-id - ":user-agent"';
const morganStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    }
};
exports.morganMiddleware = {
    dev: (0, morgan_1.default)('dev', {
        stream: morganStream,
        skip: (req) => req.url === '/health' || req.url === '/metrics'
    }),
    combined: (0, morgan_1.default)(morganFormat, {
        stream: morganStream,
        skip: (req) => req.url === '/health' || req.url === '/metrics'
    }),
    error: (0, morgan_1.default)(morganFormat, {
        stream: morganStream,
        skip: (req, res) => res.statusCode < 400
    }),
    api: (0, morgan_1.default)(':id :method :url :status :res[content-length] - :response-time ms - :user-id', {
        stream: morganStream,
        skip: (req) => !req.url.startsWith('/api')
    })
};
exports.requestLoggerMiddleware = express_winston_1.default.logger({
    winstonInstance: exports.logger,
    level: 'http',
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: false,
    colorize: environment_1.default.NODE_ENV === 'development',
    ignoreRoute: (req) => {
        return req.url === '/health' || req.url === '/metrics' || req.url === '/favicon.ico';
    },
    requestWhitelist: [
        'url', 'method', 'httpVersion', 'originalUrl', 'query', 'body'
    ],
    responseWhitelist: [
        'statusCode', 'responseTime'
    ],
    bodyWhitelist: ['username', 'email', 'companyCode'],
    bodyBlacklist: ['password', 'token', 'secret'],
    dynamicMeta: (req, res) => ({
        requestId: req.requestId,
        userId: req.user?.id,
        companyId: req.headers['x-company-id'],
        userAgent: req.headers['user-agent'],
        realIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        sessionId: req.sessionID,
        correlationId: req.headers['x-correlation-id']
    })
});
exports.errorLoggerMiddleware = express_winston_1.default.errorLogger({
    winstonInstance: exports.logger,
    level: 'error',
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{err.status}} {{err.message}}',
    dynamicMeta: (req, res, err) => ({
        requestId: req.requestId,
        userId: req.user?.id,
        companyId: req.headers['x-company-id'],
        userAgent: req.headers['user-agent'],
        realIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        errorStack: err.stack,
        errorCode: err.code,
        errorName: err.name
    })
});
exports.performanceMonitor = {
    start: (operation) => {
        const startTime = process.hrtime.bigint();
        return {
            end: (metadata) => {
                const endTime = process.hrtime.bigint();
                const duration = Number(endTime - startTime) / 1000000;
                performanceLogger.info(`Performance: ${operation}`, {
                    operation,
                    duration,
                    ...metadata,
                    timestamp: new Date().toISOString()
                });
                return duration;
            }
        };
    }
};
exports.dbLogger = {
    query: (collection, operation, query, duration) => {
        exports.logger.debug('Database Query', {
            collection,
            operation,
            query: JSON.stringify(query),
            duration,
            timestamp: new Date().toISOString()
        });
    },
    error: (collection, operation, error, query) => {
        exports.logger.error('Database Error', {
            collection,
            operation,
            error: error.message,
            stack: error.stack,
            query: query ? JSON.stringify(query) : undefined,
            timestamp: new Date().toISOString()
        });
    }
};
exports.apiLogger = {
    request: (req, metadata) => {
        exports.logger.info('API Request', {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            userId: req.user?.id,
            companyId: req.headers['x-company-id'],
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            ...metadata,
            timestamp: new Date().toISOString()
        });
    },
    response: (req, res, metadata) => {
        exports.logger.info('API Response', {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: res.responseTime,
            userId: req.user?.id,
            companyId: req.headers['x-company-id'],
            ...metadata,
            timestamp: new Date().toISOString()
        });
    }
};
exports.businessLogger = {
    userAction: (userId, action, resource, metadata) => {
        auditLogger.info('User Action', {
            userId,
            action,
            resource,
            ...metadata,
            timestamp: new Date().toISOString()
        });
    },
    systemEvent: (event, severity, metadata) => {
        exports.logger.log(severity, `System Event: ${event}`, {
            event,
            severity,
            ...metadata,
            timestamp: new Date().toISOString()
        });
    },
    securityEvent: (event, risk, metadata) => {
        securityLogger.warn(`Security Event: ${event}`, {
            event,
            risk,
            ...metadata,
            timestamp: new Date().toISOString()
        });
    }
};
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (shouldCreateLogFiles && !fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
//# sourceMappingURL=logger.js.map