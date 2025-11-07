import { Router, Response } from 'express';
import { getMetrics } from '../services/usage.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/metrics
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

export default router;

