import { Router, Request, Response } from 'express';
import { getAvailableProviders } from '../providers/index.js';
import { config } from '../config.js';

const router = Router();

// GET /api/config
router.get('/', (req: Request, res: Response) => {
  try {
    const providers = getAvailableProviders();
    
    res.json({
      providers: providers.map((p) => ({
        name: p.name,
        enabled: p.enabled,
      })),
      limits: {
        maxMessageLength: config.limits.maxMessageLength,
        maxMessagesPerRequest: config.limits.maxMessagesPerRequest,
        tokenBudget: config.limits.tokenBudget,
      },
      features: {
        websocket: config.features.websocket,
        tools: config.features.tools,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

export default router;

