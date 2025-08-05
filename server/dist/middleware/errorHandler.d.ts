import { Request, Response, NextFunction } from 'express';
export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    details?: any;
    stack?: string;
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
}
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const handleValidationErrors: (errors: any[]) => never;
export declare const handleDatabaseError: (error: any) => never;
export declare const handleFileUploadError: (error: any) => never;
export declare const handleAuthError: (error: any) => never;
export declare const handlePermissionError: (resource: string, action: string) => never;
export declare const handleRateLimitError: (req: Request, res: Response) => void;
export declare const handleCorsError: (req: Request, res: Response) => void;
export declare const gracefulShutdown: (server: any) => void;
declare const _default: {
    errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
    notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
    asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
    handleValidationErrors: (errors: any[]) => never;
    handleDatabaseError: (error: any) => never;
    handleFileUploadError: (error: any) => never;
    handleAuthError: (error: any) => never;
    handlePermissionError: (resource: string, action: string) => never;
    handleRateLimitError: (req: Request, res: Response) => void;
    handleCorsError: (req: Request, res: Response) => void;
    gracefulShutdown: (server: any) => void;
};
export default _default;
//# sourceMappingURL=errorHandler.d.ts.map