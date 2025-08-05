import winston from 'winston';
export declare const logger: winston.Logger;
declare const securityLogger: winston.Logger;
declare const auditLogger: winston.Logger;
declare const performanceLogger: winston.Logger;
declare const logRequest: (req: any, res: any, duration: number) => void;
declare const logSecurity: (event: string, details: any) => void;
declare const logAudit: (action: string, details: any) => void;
declare const logPerformance: (operation: string, duration: number, details?: any) => void;
declare const logDatabaseQuery: (query: string, duration: number, collection?: string) => void;
declare const logError: (error: Error, context?: any) => void;
declare const logBusiness: (event: string, details: any) => void;
declare const logHealth: (component: string, status: "healthy" | "unhealthy", details?: any) => void;
export declare const morganMiddleware: any;
export declare const requestLoggerMiddleware: import("express").Handler;
export declare const errorLoggerMiddleware: any;
export declare const performanceMonitor: {
    start: (operation: string) => {
        end: (metadata?: any) => number;
    };
};
export declare const dbLogger: {
    query: (collection: string, operation: string, query: any, duration: number) => void;
    error: (collection: string, operation: string, error: Error, query?: any) => void;
};
export declare const apiLogger: {
    request: (req: any, metadata?: any) => void;
    response: (req: any, res: any, metadata?: any) => void;
};
export declare const businessLogger: {
    userAction: (userId: string, action: string, resource: string, metadata?: any) => void;
    systemEvent: (event: string, severity: "info" | "warn" | "error", metadata?: any) => void;
    securityEvent: (event: string, risk: "low" | "medium" | "high", metadata?: any) => void;
};
export { logger as default, securityLogger, auditLogger, performanceLogger, logRequest, logSecurity, logAudit, logPerformance, logDatabaseQuery, logError, logBusiness, logHealth };
//# sourceMappingURL=logger.d.ts.map