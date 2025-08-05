export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;
    constructor(message: string, statusCode?: number, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class ExternalServiceError extends AppError {
    constructor(service: string, message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class FileUploadError extends AppError {
    constructor(message?: string);
}
export declare class BusinessLogicError extends AppError {
    constructor(message: string, details?: any);
}
export declare const createError: (message: string, statusCode?: number, details?: any) => AppError;
export declare const createValidationError: (message: string, details?: any) => ValidationError;
export declare const createNotFoundError: (resource: string) => NotFoundError;
export declare const createAuthError: (message?: string) => AuthenticationError;
export declare const createAuthzError: (message?: string) => AuthorizationError;
export declare const createConflictError: (message: string) => ConflictError;
export declare const createDatabaseError: (message?: string, details?: any) => DatabaseError;
export declare const createBusinessLogicError: (message: string, details?: any) => BusinessLogicError;
export declare const isOperationalError: (error: Error) => boolean;
export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    details?: any;
    statusCode: number;
    timestamp: string;
}
export declare const formatErrorResponse: (error: AppError | Error, includeStack?: boolean) => ErrorResponse;
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid username or password";
    readonly TOKEN_EXPIRED: "Authentication token has expired";
    readonly TOKEN_INVALID: "Invalid authentication token";
    readonly ACCESS_DENIED: "Access denied: Insufficient permissions";
    readonly ACCOUNT_LOCKED: "Account is locked. Please contact administrator";
    readonly ACCOUNT_INACTIVE: "Account is inactive";
    readonly REQUIRED_FIELD: "This field is required";
    readonly INVALID_EMAIL: "Invalid email format";
    readonly INVALID_PHONE: "Invalid phone number format";
    readonly INVALID_DATE: "Invalid date format";
    readonly INVALID_ID: "Invalid ID format";
    readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters long";
    readonly PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, number and special character";
    readonly DUPLICATE_ENTRY: "Record already exists";
    readonly RECORD_NOT_FOUND: "Record not found";
    readonly DATABASE_ERROR: "Database operation failed";
    readonly CONSTRAINT_VIOLATION: "Database constraint violation";
    readonly INSUFFICIENT_STOCK: "Insufficient stock available";
    readonly INVALID_QUANTITY: "Invalid quantity specified";
    readonly ORDER_ALREADY_PROCESSED: "Order has already been processed";
    readonly CANNOT_DELETE_REFERENCED: "Cannot delete record as it is referenced by other records";
    readonly OPERATION_NOT_ALLOWED: "Operation not allowed in current state";
    readonly FILE_TOO_LARGE: "File size exceeds maximum limit";
    readonly INVALID_FILE_TYPE: "Invalid file type";
    readonly FILE_UPLOAD_FAILED: "File upload failed";
    readonly EXTERNAL_SERVICE_ERROR: "External service is temporarily unavailable";
    readonly PAYMENT_GATEWAY_ERROR: "Payment processing failed";
    readonly EMAIL_SERVICE_ERROR: "Email service is unavailable";
    readonly RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later";
    readonly INTERNAL_SERVER_ERROR: "Internal server error";
    readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable";
    readonly MAINTENANCE_MODE: "System is under maintenance";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
declare const _default: {
    AppError: typeof AppError;
    ValidationError: typeof ValidationError;
    AuthenticationError: typeof AuthenticationError;
    AuthorizationError: typeof AuthorizationError;
    NotFoundError: typeof NotFoundError;
    ConflictError: typeof ConflictError;
    DatabaseError: typeof DatabaseError;
    ExternalServiceError: typeof ExternalServiceError;
    RateLimitError: typeof RateLimitError;
    FileUploadError: typeof FileUploadError;
    BusinessLogicError: typeof BusinessLogicError;
    createError: (message: string, statusCode?: number, details?: any) => AppError;
    createValidationError: (message: string, details?: any) => ValidationError;
    createNotFoundError: (resource: string) => NotFoundError;
    createAuthError: (message?: string) => AuthenticationError;
    createAuthzError: (message?: string) => AuthorizationError;
    createConflictError: (message: string) => ConflictError;
    createDatabaseError: (message?: string, details?: any) => DatabaseError;
    createBusinessLogicError: (message: string, details?: any) => BusinessLogicError;
    isOperationalError: (error: Error) => boolean;
    formatErrorResponse: (error: AppError | Error, includeStack?: boolean) => ErrorResponse;
    ERROR_MESSAGES: {
        readonly INVALID_CREDENTIALS: "Invalid username or password";
        readonly TOKEN_EXPIRED: "Authentication token has expired";
        readonly TOKEN_INVALID: "Invalid authentication token";
        readonly ACCESS_DENIED: "Access denied: Insufficient permissions";
        readonly ACCOUNT_LOCKED: "Account is locked. Please contact administrator";
        readonly ACCOUNT_INACTIVE: "Account is inactive";
        readonly REQUIRED_FIELD: "This field is required";
        readonly INVALID_EMAIL: "Invalid email format";
        readonly INVALID_PHONE: "Invalid phone number format";
        readonly INVALID_DATE: "Invalid date format";
        readonly INVALID_ID: "Invalid ID format";
        readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters long";
        readonly PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, number and special character";
        readonly DUPLICATE_ENTRY: "Record already exists";
        readonly RECORD_NOT_FOUND: "Record not found";
        readonly DATABASE_ERROR: "Database operation failed";
        readonly CONSTRAINT_VIOLATION: "Database constraint violation";
        readonly INSUFFICIENT_STOCK: "Insufficient stock available";
        readonly INVALID_QUANTITY: "Invalid quantity specified";
        readonly ORDER_ALREADY_PROCESSED: "Order has already been processed";
        readonly CANNOT_DELETE_REFERENCED: "Cannot delete record as it is referenced by other records";
        readonly OPERATION_NOT_ALLOWED: "Operation not allowed in current state";
        readonly FILE_TOO_LARGE: "File size exceeds maximum limit";
        readonly INVALID_FILE_TYPE: "Invalid file type";
        readonly FILE_UPLOAD_FAILED: "File upload failed";
        readonly EXTERNAL_SERVICE_ERROR: "External service is temporarily unavailable";
        readonly PAYMENT_GATEWAY_ERROR: "Payment processing failed";
        readonly EMAIL_SERVICE_ERROR: "Email service is unavailable";
        readonly RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later";
        readonly INTERNAL_SERVER_ERROR: "Internal server error";
        readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable";
        readonly MAINTENANCE_MODE: "System is under maintenance";
    };
    HTTP_STATUS: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly NO_CONTENT: 204;
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly METHOD_NOT_ALLOWED: 405;
        readonly CONFLICT: 409;
        readonly UNPROCESSABLE_ENTITY: 422;
        readonly TOO_MANY_REQUESTS: 429;
        readonly INTERNAL_SERVER_ERROR: 500;
        readonly BAD_GATEWAY: 502;
        readonly SERVICE_UNAVAILABLE: 503;
        readonly GATEWAY_TIMEOUT: 504;
    };
};
export default _default;
//# sourceMappingURL=errors.d.ts.map