import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../db/models/User.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get token from cookie first
    let token = req.cookies?.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      throw error;
    }
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpires,
  });
}

