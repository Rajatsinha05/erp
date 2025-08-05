import { Request, Response, NextFunction } from 'express';
import { IUser, ICompanyAccess } from '@/types/models';
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            company?: any;
            companyAccess?: ICompanyAccess;
            requestId?: string;
        }
    }
}
interface JWTPayload {
    userId: string;
    username: string;
    email: string;
    companyId?: string;
    role?: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}
interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
    iat: number;
    exp: number;
}
export declare const generateAccessToken: (user: IUser, companyId?: string) => string;
export declare const generateRefreshToken: (userId: string, tokenVersion?: number) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const requireCompany: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const requireRole: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requirePermission: (module: string, action: string, options?: {
    allowSelf?: boolean;
    adminOnly?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshAccessToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=auth.d.ts.map