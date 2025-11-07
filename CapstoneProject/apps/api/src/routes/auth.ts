import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../db/models/User.js';
import { authenticate, generateToken, type AuthRequest } from '../middleware/auth.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.').max(64, 'Password must be no more than 64 characters long.'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'EMAIL_TAKEN' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      hash,
      role: 'user',
    });
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // dev
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      });
      return;
    }
    logger.error({ error }, 'Registration error');
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // dev
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      });
      return;
    }
    logger.error({ error }, 'Login error');
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    user: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

export default router;

