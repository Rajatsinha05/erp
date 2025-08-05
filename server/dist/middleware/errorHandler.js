"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.handleCorsError = exports.handleRateLimitError = exports.handlePermissionError = exports.handleAuthError = exports.handleFileUploadError = exports.handleDatabaseError = exports.handleValidationErrors = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = require("jsonwebtoken");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const environment_1 = __importDefault(require("@/config/environment"));
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;
    logger_1.logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    if (error instanceof errors_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error instanceof mongoose_1.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation Error';
        details = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));
    }
    else if (error instanceof mongoose_1.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${error.path}: ${error.value}`;
    }
    else if (error.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        details = {
            field,
            value,
            message: `${field} '${value}' already exists`
        };
    }
    else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        statusCode = 401;
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            message = 'Token expired';
        }
        else {
            message = 'Invalid token';
        }
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
    }
    else if (error.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON format';
    }
    else if (error.type === 'entity.too.large') {
        statusCode = 413;
        message = 'Request entity too large';
    }
    else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        message = 'File too large';
    }
    else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file field';
    }
    else if (error.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Service temporarily unavailable';
    }
    else if (error.name === 'TimeoutError') {
        statusCode = 408;
        message = 'Request timeout';
    }
    else if (error.name === 'RateLimitError') {
        statusCode = 429;
        message = 'Too many requests';
    }
    const errorResponse = {
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };
    if (details) {
        errorResponse.details = details;
    }
    if (environment_1.default.NODE_ENV === 'development') {
        errorResponse.error = error.message;
        errorResponse.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const handleValidationErrors = (errors) => {
    const details = errors.map(error => ({
        field: error.param || error.path,
        message: error.msg || error.message,
        value: error.value,
        location: error.location
    }));
    throw new errors_1.AppError('Validation failed', 400, details);
};
exports.handleValidationErrors = handleValidationErrors;
const handleDatabaseError = (error) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        throw new errors_1.AppError(`Duplicate value for ${field}: ${value}`, 400);
    }
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message
        }));
        throw new errors_1.AppError('Validation failed', 400, errors);
    }
    if (error.name === 'CastError') {
        throw new errors_1.AppError(`Invalid ${error.path}: ${error.value}`, 400);
    }
    throw new errors_1.AppError('Database operation failed', 500);
};
exports.handleDatabaseError = handleDatabaseError;
const handleFileUploadError = (error) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        throw new errors_1.AppError('File size too large', 413);
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
        throw new errors_1.AppError('Too many files', 400);
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        throw new errors_1.AppError('Unexpected file field', 400);
    }
    if (error.code === 'LIMIT_FIELD_KEY') {
        throw new errors_1.AppError('Field name too long', 400);
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
        throw new errors_1.AppError('Field value too long', 400);
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
        throw new errors_1.AppError('Too many fields', 400);
    }
    if (error.code === 'LIMIT_PART_COUNT') {
        throw new errors_1.AppError('Too many parts', 400);
    }
    throw new errors_1.AppError('File upload failed', 500);
};
exports.handleFileUploadError = handleFileUploadError;
const handleAuthError = (error) => {
    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw new errors_1.AppError('Token expired', 401);
        }
        throw new errors_1.AppError('Invalid token', 401);
    }
    if (error.name === 'UnauthorizedError') {
        throw new errors_1.AppError('Unauthorized access', 401);
    }
    throw new errors_1.AppError('Authentication failed', 401);
};
exports.handleAuthError = handleAuthError;
const handlePermissionError = (resource, action) => {
    throw new errors_1.AppError(`Insufficient permissions for ${action} on ${resource}`, 403);
};
exports.handlePermissionError = handlePermissionError;
const handleRateLimitError = (req, res) => {
    logger_1.logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
    });
    res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
};
exports.handleRateLimitError = handleRateLimitError;
const handleCorsError = (req, res) => {
    logger_1.logger.warn('CORS error', {
        origin: req.get('Origin'),
        path: req.path,
        method: req.method
    });
    res.status(403).json({
        success: false,
        message: 'CORS policy violation',
        statusCode: 403,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
};
exports.handleCorsError = handleCorsError;
const gracefulShutdown = (server) => {
    const shutdown = (signal) => {
        logger_1.logger.info(`Received ${signal}, shutting down gracefully`);
        server.close(() => {
            logger_1.logger.info('Process terminated gracefully');
            process.exit(0);
        });
        setTimeout(() => {
            logger_1.logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 30000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};
exports.gracefulShutdown = gracefulShutdown;
exports.default = {
    errorHandler: exports.errorHandler,
    notFoundHandler: exports.notFoundHandler,
    asyncHandler: exports.asyncHandler,
    handleValidationErrors: exports.handleValidationErrors,
    handleDatabaseError: exports.handleDatabaseError,
    handleFileUploadError: exports.handleFileUploadError,
    handleAuthError: exports.handleAuthError,
    handlePermissionError: exports.handlePermissionError,
    handleRateLimitError: exports.handleRateLimitError,
    handleCorsError: exports.handleCorsError,
    gracefulShutdown: exports.gracefulShutdown
};
//# sourceMappingURL=errorHandler.js.map