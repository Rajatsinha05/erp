import { Request, Response, NextFunction } from 'express';
export declare const corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
export declare const helmetOptions: {
    contentSecurityPolicy: boolean | {
        directives: {
            defaultSrc: string[];
            styleSrc: string[];
            fontSrc: string[];
            imgSrc: string[];
            scriptSrc: string[];
            objectSrc: string[];
            mediaSrc: string[];
            frameSrc: string[];
            connectSrc: string[];
            workerSrc: string[];
        };
    };
    crossOriginEmbedderPolicy: boolean;
    hsts: boolean | {
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
    };
    noSniff: boolean;
    xssFilter: boolean;
    referrerPolicy: {
        policy: "same-origin";
    };
};
export declare const createRateLimit: (windowMs: number, max: number, message?: string) => import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const speedLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityMiddleware: any[];
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const ipWhitelist: (allowedIPs: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateApiKey: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=security.d.ts.map