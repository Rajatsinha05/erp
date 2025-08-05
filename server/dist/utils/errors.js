"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.ERROR_MESSAGES = exports.formatErrorResponse = exports.isOperationalError = exports.createBusinessLogicError = exports.createDatabaseError = exports.createConflictError = exports.createAuthzError = exports.createAuthError = exports.createNotFoundError = exports.createValidationError = exports.createError = exports.BusinessLogicError = exports.FileUploadError = exports.RateLimitError = exports.ExternalServiceError = exports.DatabaseError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', details) {
        super(message, 500, details);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends AppError {
    constructor(service, message) {
        super(message || `External service ${service} is unavailable`, 503);
    }
}
exports.ExternalServiceError = ExternalServiceError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
class FileUploadError extends AppError {
    constructor(message = 'File upload failed') {
        super(message, 400);
    }
}
exports.FileUploadError = FileUploadError;
class BusinessLogicError extends AppError {
    constructor(message, details) {
        super(message, 422, details);
    }
}
exports.BusinessLogicError = BusinessLogicError;
const createError = (message, statusCode = 500, details) => {
    return new AppError(message, statusCode, details);
};
exports.createError = createError;
const createValidationError = (message, details) => {
    return new ValidationError(message, details);
};
exports.createValidationError = createValidationError;
const createNotFoundError = (resource) => {
    return new NotFoundError(resource);
};
exports.createNotFoundError = createNotFoundError;
const createAuthError = (message) => {
    return new AuthenticationError(message);
};
exports.createAuthError = createAuthError;
const createAuthzError = (message) => {
    return new AuthorizationError(message);
};
exports.createAuthzError = createAuthzError;
const createConflictError = (message) => {
    return new ConflictError(message);
};
exports.createConflictError = createConflictError;
const createDatabaseError = (message, details) => {
    return new DatabaseError(message, details);
};
exports.createDatabaseError = createDatabaseError;
const createBusinessLogicError = (message, details) => {
    return new BusinessLogicError(message, details);
};
exports.createBusinessLogicError = createBusinessLogicError;
const isOperationalError = (error) => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};
exports.isOperationalError = isOperationalError;
const formatErrorResponse = (error, includeStack = false) => {
    const response = {
        success: false,
        message: error.message,
        statusCode: error instanceof AppError ? error.statusCode : 500,
        timestamp: new Date().toISOString()
    };
    if (error instanceof AppError && error.details) {
        response.details = error.details;
    }
    if (includeStack) {
        response.error = error.stack;
    }
    return response;
};
exports.formatErrorResponse = formatErrorResponse;
exports.ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid username or password',
    TOKEN_EXPIRED: 'Authentication token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    ACCESS_DENIED: 'Access denied: Insufficient permissions',
    ACCOUNT_LOCKED: 'Account is locked. Please contact administrator',
    ACCOUNT_INACTIVE: 'Account is inactive',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PHONE: 'Invalid phone number format',
    INVALID_DATE: 'Invalid date format',
    INVALID_ID: 'Invalid ID format',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    PASSWORD_TOO_WEAK: 'Password must contain uppercase, lowercase, number and special character',
    DUPLICATE_ENTRY: 'Record already exists',
    RECORD_NOT_FOUND: 'Record not found',
    DATABASE_ERROR: 'Database operation failed',
    CONSTRAINT_VIOLATION: 'Database constraint violation',
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    INVALID_QUANTITY: 'Invalid quantity specified',
    ORDER_ALREADY_PROCESSED: 'Order has already been processed',
    CANNOT_DELETE_REFERENCED: 'Cannot delete record as it is referenced by other records',
    OPERATION_NOT_ALLOWED: 'Operation not allowed in current state',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_UPLOAD_FAILED: 'File upload failed',
    EXTERNAL_SERVICE_ERROR: 'External service is temporarily unavailable',
    PAYMENT_GATEWAY_ERROR: 'Payment processing failed',
    EMAIL_SERVICE_ERROR: 'Email service is unavailable',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    MAINTENANCE_MODE: 'System is under maintenance'
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};
exports.default = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    RateLimitError,
    FileUploadError,
    BusinessLogicError,
    createError: exports.createError,
    createValidationError: exports.createValidationError,
    createNotFoundError: exports.createNotFoundError,
    createAuthError: exports.createAuthError,
    createAuthzError: exports.createAuthzError,
    createConflictError: exports.createConflictError,
    createDatabaseError: exports.createDatabaseError,
    createBusinessLogicError: exports.createBusinessLogicError,
    isOperationalError: exports.isOperationalError,
    formatErrorResponse: exports.formatErrorResponse,
    ERROR_MESSAGES: exports.ERROR_MESSAGES,
    HTTP_STATUS: exports.HTTP_STATUS
};
//# sourceMappingURL=errors.js.map