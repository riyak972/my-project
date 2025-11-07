import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { Session, Message } from '../db/models/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

// GET /api/messages?sessionId=...
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { sessionId } = req.query as { sessionId?: string };

    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'sessionId required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      res.status(400).json({ error: 'Invalid sessionId format' });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session || session.userId !== userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    logger.error({ error }, 'Get messages error');
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;