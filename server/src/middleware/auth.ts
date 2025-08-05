import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User from '@/models/User';
import Company from '@/models/Company';
import config from '@/config/environment';
import logger from '@/utils/logger';
import { IUser, ICompanyAccess } from '@/types/models';

// Extend Request interface to include user and company info
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

// =============================================
// JWT Token Generation
// =============================================
export const generateAccessToken = (user: IUser, companyId?: string): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email
  };

  if (companyId) {
    const companyAccess = user.companyAccess.find(
      access => access.companyId.toString() === companyId && access.isActive
    );

    if (companyAccess) {
      payload.companyId = companyId;
      payload.role = companyAccess.role;
    }
  }

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE as any,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE
  });
};

export const generateRefreshToken = (userId: string, tokenVersion: number = 1): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    tokenVersion
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE as any
  });
};

// =============================================
// JWT Token Verification
// =============================================
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// =============================================
// Authentication Middleware
// =============================================
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid access token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Find user
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('companyAccess.companyId', 'companyName companyCode isActive');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found or inactive'
      });
    }

    // Check if account is locked
    if (user.security.accountLocked) {
      const lockoutTime = user.security.lockoutTime;
      if (lockoutTime && lockoutTime > new Date()) {
        return res.status(423).json({
          error: 'Account locked',
          message: 'Account is temporarily locked due to multiple failed login attempts',
          unlockTime: lockoutTime
        });
      } else {
        // Unlock account if lockout time has passed
        await user.updateOne({
          $unset: { 'security.lockoutTime': 1 },
          $set: { 
            'security.accountLocked': false,
            'security.failedLoginAttempts': 0
          }
        });
      }
    }

    // Get company ID from header (for company switching) or token
    const headerCompanyId = req.headers['x-company-id'] as string;
    const targetCompanyId = headerCompanyId || decoded.companyId;

    // Attach user to request with JWT payload properties
    (req as any).user = {
      ...user.toObject(),
      userId: decoded.userId,
      companyId: targetCompanyId
    };

    // Skip company validation for 2FA routes (user-level functionality)
    const is2FARoute = req.path.includes('/2fa/');

    // Validate company access if company ID is provided and not a 2FA route
    if (targetCompanyId && !is2FARoute) {
      // Log for debugging
      logger.info('Company access validation', {
        userId: user._id,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin,
        targetCompanyId,
        userCompanyAccess: user.companyAccess?.length || 0
      });

      // Super admin can access any company
      if (user.isSuperAdmin === true) {
        // For super admin, just validate that company exists
        const company = await Company.findById(targetCompanyId).select('companyName companyCode isActive');
        if (!company || !company.isActive) {
          logger.warn('Company not found for super admin', {
            userId: user._id,
            targetCompanyId,
            companyExists: !!company,
            companyActive: company?.isActive
          });
          return res.status(404).json({
            error: 'Company not found',
            message: 'The specified company was not found or is inactive'
          });
        }
        req.company = company;
        logger.info('Super admin company access granted', {
          userId: user._id,
          companyId: company._id,
          companyName: company.companyName
        });
      } else {
        // For regular users, check company access
        const companyAccess = user.companyAccess?.find(
          access => access.companyId.toString() === targetCompanyId && access.isActive
        );

        if (!companyAccess) {
          logger.warn('Company access denied for regular user', {
            userId: user._id,
            username: user.username,
            targetCompanyId,
            availableCompanies: user.companyAccess?.map(a => ({
              companyId: a.companyId.toString(),
              isActive: a.isActive
            })) || []
          });
          return res.status(403).json({
            error: 'Company access denied',
            message: 'You do not have access to this company'
          });
        }

        req.companyAccess = companyAccess;
        req.company = companyAccess.companyId;
      }
    } else if (!user.isSuperAdmin && !is2FARoute) {
      // Non-super admin users must have a company context (except for 2FA routes)
      return res.status(400).json({
        error: 'Company ID required',
        message: 'X-Company-ID header is required'
      });
    } else {
      // Super admin without company ID - allow access
      logger.info('Super admin access without company context', {
        userId: user._id,
        username: user.username
      });
    }

    // Update last login info
    await user.updateOne({
      'security.lastLogin': new Date(),
      'security.lastLoginIP': req.ip
    });

    logger.info('User authenticated', {
      userId: user._id,
      username: user.username,
      companyId: decoded.companyId,
      role: decoded.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });

    if (error instanceof Error && error.message === 'Token expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired. Please refresh your token.'
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired access token'
    });
  }
};

// =============================================
// Company Context Middleware
// =============================================
export const requireCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.headers['x-company-id'] as string;
    
    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID required',
        message: 'X-Company-ID header is required'
      });
    }

    if (!Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        error: 'Invalid company ID',
        message: 'Company ID must be a valid ObjectId'
      });
    }

    // Check if user has access to this company
    const user = req.user!;
    let companyAccess = null;

    // Super admin can access any company
    if (!user.isSuperAdmin) {
      companyAccess = user.companyAccess?.find(
        access => access.companyId.toString() === companyId && access.isActive
      );

      if (!companyAccess) {
        return res.status(403).json({
          error: 'Company access denied',
          message: 'You do not have access to this company'
        });
      }
    }

    // Find and validate company
    const company = await Company.findById(companyId);
    if (!company || !company.isActive) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'Company not found or inactive'
      });
    }

    // Attach company info to request
    req.company = company;
    if (companyAccess) {
      req.companyAccess = companyAccess;
    }

    next();
  } catch (error) {
    logger.error('Company context validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?._id,
      companyId: req.headers['x-company-id']
    });

    return res.status(500).json({
      error: 'Company validation failed',
      message: 'Failed to validate company context'
    });
  }
};

// =============================================
// Role-based Authorization
// =============================================
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.companyAccess?.role;
    
    if (!userRole) {
      return res.status(403).json({
        error: 'Role required',
        message: 'User role not found in company context'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Super admin has access to everything
    if (userRole === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Role authorization failed', {
        userId: req.user?._id,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// =============================================
// Permission-based Authorization
// =============================================
export const requirePermission = (module: string, action: string, options: {
  allowSelf?: boolean,
  adminOnly?: boolean
} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    const companyAccess = req.companyAccess!;

    // Super admin has all permissions
    if (companyAccess.role === 'super_admin') {
      return next();
    }

    // Admin only check
    if (options.adminOnly) {
      const adminRoles = ['owner', 'manager'];
      const isAdmin = adminRoles.includes(companyAccess.role);

      if (!isAdmin) {
        logger.warn('Admin access denied', {
          userId: user._id,
          username: user.username,
          companyId: req.company?._id,
          role: companyAccess.role,
          module,
          action
        });

        return res.status(403).json({
          error: 'Admin access required',
          message: 'This action requires admin privileges'
        });
      }
    }

    // Check self access (for profile operations)
    if (options.allowSelf && req.params.id === user._id.toString()) {
      return next();
    }

    // Check specific permission
    const hasPermission = companyAccess.permissions?.[module]?.[action];

    // Role-based fallback permissions
    if (!hasPermission) {
      const rolePermissions = getRolePermissions(companyAccess.role);
      const hasRolePermission = rolePermissions?.[module]?.[action] === true;

      if (!hasRolePermission) {
        logger.warn('Permission authorization failed', {
          userId: user._id,
          username: user.username,
          companyId: req.company?._id,
          role: companyAccess.role,
          module,
          action,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You do not have permission to ${action} ${module}`
        });
      }
    }

    next();
  };
};

/**
 * Get default permissions for a role
 */
function getRolePermissions(role: string): Record<string, Record<string, boolean>> {
  const rolePermissions: Record<string, Record<string, Record<string, boolean>>> = {
    admin: {
      users: { view: true, create: true, update: true, delete: true },
      visitors: { view: true, create: true, update: true, delete: true },
      companies: { view: true, update: true },
      reports: { view: true, create: true },
      settings: { view: true, update: true },
      audit: { view: true }
    },
    manager: {
      users: { view: true, create: true, update: true },
      visitors: { view: true, create: true, update: true, delete: true },
      reports: { view: true, create: true },
      settings: { view: true }
    },
    employee: {
      visitors: { view: true, create: true, update: true },
      reports: { view: true }
    },
    security: {
      visitors: { view: true, create: true, update: true },
      reports: { view: true }
    }
  };

  return rolePermissions[role] || {};
}

// =============================================
// Admin Authorization Middleware
// =============================================
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user is super admin or has admin role in current company
  const isAdmin = user.isSuperAdmin ||
    user.companyAccess?.some(access =>
      ['admin', 'owner', 'manager'].includes(access.role)
    );

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }

  next();
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super admin privileges required'
    });
  }

  next();
};

// =============================================
// Optional Authentication (for public endpoints with user context)
// =============================================
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('companyAccess.companyId', 'companyName companyCode isActive');
    
    if (user && user.isActive && !user.security.accountLocked) {
      (req as any).user = {
        ...user.toObject(),
        userId: decoded.userId,
        companyId: decoded.companyId
      };
      
      if (decoded.companyId) {
        const companyAccess = user.companyAccess.find(
          access => access.companyId.toString() === decoded.companyId && access.isActive
        );
        
        if (companyAccess) {
          req.companyAccess = companyAccess;
          req.company = companyAccess.companyId;
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

// =============================================
// Refresh Token Middleware
// =============================================
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);
    
    res.json({
      success: true,
      accessToken,
      expiresIn: config.JWT_EXPIRE
    });
  } catch (error) {
    logger.warn('Refresh token failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });

    return res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Refresh token is invalid or expired'
    });
  }
};
