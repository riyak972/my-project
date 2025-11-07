import { GoogleGenAI } from '@google/genai';
import type { BaseProvider, ChatRequest, ChatResponse, StreamChunk } from './base.js';
import { config } from '../config.js';
import { generateId } from '../services/ids.js';
import { logger } from '../utils/logger.js';

export class GeminiProvider implements BaseProvider {
  private client: GoogleGenAI | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.providers.gemini.enabled;
    if (this.enabled && config.providers.gemini.apiKey) {
      try {
        // New Google GenAI client (reads GEMINI_API_KEY from env if not provided)
        this.client = new GoogleGenAI({ apiKey: config.providers.gemini.apiKey });
      } catch (error) {
        logger.error({ error }, 'Failed to initialize Gemini client');
        this.enabled = false;
      }
    }
  }

  name(): string {
    return 'gemini';
  }

  supportsTools(): boolean {
    return config.features.tools;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async chat(req: ChatRequest, onStream?: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    if (!this.enabled || !this.client) {
      throw new Error('Gemini provider is not enabled. Set GEMINI_API_KEY in .env');
    }

    const { messages, model = 'gemini-2.5-flash', temperature = 0.7 } = req;

    // Normalize deprecated model names
    const effectiveModel = ['gemini-pro', 'gemini-1.5-flash'].includes(model) ? 'gemini-2.5-flash' : model;

    try {
      // Compose a simple prompt text including optional system prompt and history
      const systemPrompt = messages.find((m) => m.role === 'system')?.content;
      const history = messages.filter((m) => m.role !== 'system');
      const prompt = [
        systemPrompt ? `System: ${systemPrompt}` : null,
        ...history.map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`),
      ]
        .filter(Boolean)
        .join('\n');

      if (onStream) {
        // Synthesize streaming: start -> full text -> end
        onStream({ type: 'event', name: 'start' });
        const response = await this.client.models.generateContent({
          model: effectiveModel,
          contents: prompt,
          generationConfig: { temperature },
        });
        const text = (response as any).text || (response as any).output_text || '';
        if (text) {
          onStream({ type: 'text', delta: text });
        }
        onStream({ type: 'event', name: 'end' });

        return {
          id: generateId('gemini'),
          provider: 'gemini',
          model: effectiveModel,
          message: { role: 'assistant', content: text },
        };
      } else {
        const response = await this.client.models.generateContent({
          model: effectiveModel,
          contents: prompt,
          generationConfig: { temperature },
        });
        const text = (response as any).text || (response as any).output_text || '';
        return {
          id: generateId('gemini'),
          provider: 'gemini',
          model: effectiveModel,
          message: { role: 'assistant', content: text },
        };
      }
    } catch (error) {
      logger.error({ error, model: effectiveModel }, 'Gemini chat error');
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

