import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  console.log(`[AUTH] Checking header: "${req.headers.authorization}"`);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AUTH] Token extracted: ${token.substring(0, 10)}...`);
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      console.log(`[AUTH] Token decoded successfully. ID: ${decoded.id}`);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }
      return next();
    } catch (error: any) {
      console.error('[AUTH ERROR] Token verification failure:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.warn('[AUTH] Access denied: No token provided in headers');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role?.toString().trim().toUpperCase();
    const requiredRoles = roles.map(r => r.trim().toUpperCase());
    
    console.log(`[AUTH] Path: ${req.method} ${req.originalUrl}`);
    console.log(`[AUTH] Required: ${JSON.stringify(requiredRoles)}, User: "${userRole}"`);
    
    if (req.user && requiredRoles.includes(userRole)) {
      next();
    } else {
      console.warn(`[AUTH] Forbidden: "${userRole}" matches none of ${JSON.stringify(requiredRoles)}`);
      res.status(403).json({ 
        success: false, 
        message: `Role ${userRole} is not authorized. Required: ${requiredRoles.join(", ")}` 
      });
    }
  };
};
