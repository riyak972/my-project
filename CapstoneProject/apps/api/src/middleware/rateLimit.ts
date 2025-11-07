import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const rateLimiter = rateLimit({
  windowMs: config.limits.rateLimit.windowMs,
  max: config.limits.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as any).userId || 'anon';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return `${ip}:${userId}`;
  },
});

