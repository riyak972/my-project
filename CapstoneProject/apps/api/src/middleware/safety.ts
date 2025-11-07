import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// Simple prompt injection detection
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions|prompts?|system)/i,
  /forget\s+(all|everything|previous)/i,
  /system\s*:\s*you\s+are/i,
  /you\s+are\s+now/i,
  /override/i,
];

// Simple profanity/self-harm detection (basic keyword list)
const UNSAFE_PATTERNS = [
  /\b(kill|harm|hurt|suicide|self[- ]harm)\b/i,
];

export function validateInput(req: Request, res: Response, next: NextFunction): void {
  const body = req.body;
  
  // Check message content
  if (body.content || body.messages) {
    const content = body.content || JSON.stringify(body.messages);
    
    // Check length
    if (content.length > config.limits.maxMessageLength) {
      res.status(400).json({
        error: `Message too long. Maximum length: ${config.limits.maxMessageLength} characters`,
      });
      return;
    }

    // Check for prompt injection
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(content)) {
        logger.warn({ content: content.substring(0, 100) }, 'Prompt injection detected');
        res.status(400).json({
          error: 'Invalid input detected. Please rephrase your message.',
        });
        return;
      }
    }

    // Check for unsafe content
    for (const pattern of UNSAFE_PATTERNS) {
      if (pattern.test(content)) {
        logger.warn({ content: content.substring(0, 100) }, 'Unsafe content detected');
        res.status(400).json({
          error: 'I cannot assist with that request. Please contact a mental health professional if you need support.',
        });
        return;
      }
    }
  }

  next();
}

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().min(1).max(config.limits.maxMessageLength),
  provider: z.enum(['gemini', 'openai', 'dialogflow', 'mock']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().max(5000).optional(),
});

export const sessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  systemPrompt: z.string().max(5000).optional(),
}).passthrough(); // Allow empty body

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}

