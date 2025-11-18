import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';
import { logger } from '../config/logger.js';
import { UserRole } from '../models/zod-schemas.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        name: string | null;
      };
      session?: {
        session: {
          id: string;
          userId: string;
          expiresAt: Date;
        };
        user: {
          id: string;
          email: string;
          role: UserRole;
          name: string | null;
        };
      };
    }
  }
}

/**
 * Middleware to verify authentication
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    // Attach session and user to request
    req.session = session;
    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as UserRole,
      name: session.user.name,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid session' });
  }
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This endpoint requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware to optionally attach user if authenticated
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (session) {
      req.session = session;
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role as UserRole,
        name: session.user.name,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}
