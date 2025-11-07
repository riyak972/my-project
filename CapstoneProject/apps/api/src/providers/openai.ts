import OpenAI from 'openai';
import type { BaseProvider, ChatRequest, ChatResponse, StreamChunk } from './base.js';
import { config } from '../config.js';
import { generateId } from '../services/ids.js';
import { logger } from '../utils/logger.js';

export class OpenAIProvider implements BaseProvider {
  private client: OpenAI | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.providers.openai.enabled;
    if (this.enabled && config.providers.openai.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: config.providers.openai.apiKey,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to initialize OpenAI client');
        this.enabled = false;
      }
    }
  }

  name(): string {
    return 'openai';
  }

  supportsTools(): boolean {
    return config.features.tools;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async chat(req: ChatRequest, onStream?: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    if (!this.enabled || !this.client) {
      throw new Error('OpenAI provider is not enabled. Set OPENAI_API_KEY in .env');
    }

    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, timeoutMs = 30000 } = req;

    try {
      // Convert messages to OpenAI format
      const openAIMessages = messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content,
      }));

      if (onStream) {
        onStream({ type: 'event', name: 'start' });
        
        let fullText = '';
        const stream = await this.client.chat.completions.create({
          model,
          messages: openAIMessages,
          temperature,
          stream: true,
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onStream({ type: 'text', delta });
          }
        }

        onStream({ type: 'event', name: 'end' });

        // Get usage from final chunk (OpenAI doesn't provide usage in streaming)
        const estimateInputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
        const estimateOutputTokens = Math.ceil(fullText.length / 4);

        return {
          id: generateId('openai'),
          provider: 'openai',
          model,
          usage: {
            inputTokens: estimateInputTokens,
            outputTokens: estimateOutputTokens,
          },
          message: {
            role: 'assistant',
            content: fullText,
          },
        };
      } else {
        const response = await this.client.chat.completions.create({
          model,
          messages: openAIMessages,
          temperature,
        });

        const content = response.choices[0]?.message?.content ?? '';
        const usage = response.usage;

        return {
          id: generateId('openai'),
          provider: 'openai',
          model,
          usage: {
            inputTokens: usage?.prompt_tokens,
            outputTokens: usage?.completion_tokens,
          },
          message: {
            role: 'assistant',
            content,
          },
        };
      }
    } catch (error) {
      logger.error({ error, model }, 'OpenAI chat error');
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

