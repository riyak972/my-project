import { Router, Request, Response } from 'express';
import { getProvider, getDefaultProvider } from '../providers/index.js';
import { Session, Message } from '../db/models/index.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { validateBody, chatRequestSchema } from '../middleware/safety.js';
import { SSESender } from '../utils/sse.js';
import { countMessageTokens, estimateTokens } from '../utils/tokens.js';
import { recordRequest, recordError } from '../services/usage.js';
import { logger } from '../utils/logger.js';
import { summarizeConversation } from '../services/summarize.js';
import { config } from '../config.js';

const router = Router();

// POST /api/chat (non-streaming)
router.post(
  '/',
  authenticate,
  validateBody(chatRequestSchema),
  async (req: AuthRequest, res: Response) => {
    const startTime = Date.now();
    try {
      const { sessionId, content, provider: providerName, model, temperature, systemPrompt } =
        req.body;
      const userId = req.userId!;

      // Get or create session
      let session = await Session.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Update system prompt if provided
      if (systemPrompt !== undefined) {
        session.systemPrompt = systemPrompt;
        await session.save();
      }

      // Get provider
      const provider = providerName ? getProvider(providerName) : getDefaultProvider();
      if (!provider || !provider.isEnabled()) {
        res.status(400).json({
          error: `Provider ${providerName ?? 'default'} is not enabled`,
        });
        return;
      }

      // Get messages
      const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
      const chatMessages = messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      }));

      // Add system prompt if present
      if (session.systemPrompt) {
        chatMessages.unshift({
          role: 'system',
          content: session.systemPrompt,
        });
      }

      // Add user message
      chatMessages.push({
        role: 'user',
        content,
      });

      // Check token budget
      const inputTokens = countMessageTokens(chatMessages);
      if (inputTokens + session.tokenBudget.used > session.tokenBudget.max) {
        // Auto-summarize
        try {
          const summary = await summarizeConversation({
            provider,
            messages: chatMessages.slice(0, -1), // Exclude current message
          });
          session.summary = summary;
          session.tokenBudget.used = estimateTokens(summary);
          await session.save();

          // Clear old messages (keep last 10)
          const oldMessages = messages.slice(0, -10);
          if (oldMessages.length > 0) {
            await Message.deleteMany({ _id: { $in: oldMessages.map((m) => m._id) } });
          }
        } catch (error) {
          logger.error({ error }, 'Auto-summarize failed');
        }
      }

      // Call provider
      const response = await provider.chat({
        userId,
        sessionId,
        messages: chatMessages,
        model,
        temperature,
      });

      // Save messages
      const userMessage = new Message({
        sessionId,
        role: 'user',
        content,
        tokensIn: response.usage?.inputTokens,
      });
      await userMessage.save();

      const assistantMessage = new Message({
        sessionId,
        role: 'assistant',
        content: response.message?.content ?? '',
        tokensOut: response.usage?.outputTokens,
        providerMeta: {
          provider: response.provider,
          model: response.model,
          usage: response.usage,
        },
      });
      await assistantMessage.save();

      // Update session
      session.tokenBudget.used += (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0);
      session.lastActivityAt = new Date();
      await session.save();

      // Record metrics
      const latency = Date.now() - startTime;
      recordRequest(
        latency,
        response.usage?.inputTokens ?? 0,
        response.usage?.outputTokens ?? 0
      );

      res.json(response);
    } catch (error) {
      recordError();
      logger.error({ error }, 'Chat error');
      res.status(500).json({ error: 'Chat failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// POST /api/chat/stream (SSE streaming)
router.post(
  '/stream',
  authenticate,
  validateBody(chatRequestSchema),
  async (req: AuthRequest, res: Response) => {
    const startTime = Date.now();
    let fullResponse = '';

    try {
      const { sessionId, content, provider: providerName, model, temperature, systemPrompt } =
        req.body;
      const userId = req.userId!;

      // Get or create session
      let session = await Session.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Update system prompt if provided
      if (systemPrompt !== undefined) {
        session.systemPrompt = systemPrompt;
        await session.save();
      }

      // Get provider
      const provider = providerName ? getProvider(providerName) : getDefaultProvider();
      if (!provider || !provider.isEnabled()) {
        res.status(400).json({
          error: `Provider ${providerName ?? 'default'} is not enabled`,
        });
        return;
      }

      // Setup SSE
      const sse = new SSESender(res);

      // Get messages
      const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
      const chatMessages = messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      }));

      // Add system prompt if present
      if (session.systemPrompt) {
        chatMessages.unshift({
          role: 'system',
          content: session.systemPrompt,
        });
      }

      // Add user message
      chatMessages.push({
        role: 'user',
        content,
      });

      // Check token budget
      const inputTokens = countMessageTokens(chatMessages);
      if (inputTokens + session.tokenBudget.used > session.tokenBudget.max) {
        // Auto-summarize
        try {
          const summary = await summarizeConversation({
            provider,
            messages: chatMessages.slice(0, -1),
          });
          session.summary = summary;
          session.tokenBudget.used = estimateTokens(summary);
          await session.save();

          const oldMessages = messages.slice(0, -10);
          if (oldMessages.length > 0) {
            await Message.deleteMany({ _id: { $in: oldMessages.map((m) => m._id) } });
          }
        } catch (error) {
          logger.error({ error }, 'Auto-summarize failed');
        }
      }

      // Stream response
      let usage: { inputTokens?: number; outputTokens?: number } = {};

      const response = await provider.chat(
        {
          userId,
          sessionId,
          messages: chatMessages,
          model,
          temperature,
          stream: true,
        },
        (chunk) => {
          if (sse.isClosed()) return;

          if (chunk.type === 'text') {
            fullResponse += chunk.delta;
          }

          sse.sendChunk(chunk);
        }
      );

      usage = response.usage ?? {};

      // Save messages
      const userMessage = new Message({
        sessionId,
        role: 'user',
        content,
        tokensIn: usage.inputTokens,
      });
      await userMessage.save();

      const assistantMessage = new Message({
        sessionId,
        role: 'assistant',
        content: fullResponse,
        tokensOut: usage.outputTokens,
        providerMeta: {
          provider: response.provider,
          model: response.model,
          usage,
        },
      });
      await assistantMessage.save();

      // Update session
      session.tokenBudget.used += (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
      session.lastActivityAt = new Date();
      await session.save();

      // Record metrics
      const latency = Date.now() - startTime;
      recordRequest(latency, usage.inputTokens ?? 0, usage.outputTokens ?? 0);

      // Close SSE
      sse.close();
    } catch (error) {
      recordError();
      logger.error({ error }, 'Chat stream error');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Chat stream failed', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }
);

export default router;

