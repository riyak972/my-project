import type { BaseProvider } from '../providers/base.js';
import type { ChatMessage } from '../providers/base.js';
import { estimateTokens } from '../utils/tokens.js';
import { logger } from '../utils/logger.js';

export interface SummarizeOptions {
  provider: BaseProvider;
  messages: ChatMessage[];
  maxTokens?: number;
}

export async function summarizeConversation(
  options: SummarizeOptions
): Promise<string> {
  const { provider, messages, maxTokens = 2000 } = options;

  // Keep system message if present
  const systemMsg = messages.find((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant');

  // Build summary prompt
  const summaryPrompt = `Summarize the following conversation concisely, preserving key information, decisions, and context needed for future interactions. Keep it under ${maxTokens} tokens.

Conversation:
${userMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n')}`;

  const summaryMessages: ChatMessage[] = [
    ...(systemMsg ? [systemMsg] : []),
    {
      role: 'user',
      content: summaryPrompt,
    },
  ];

  try {
    const response = await provider.chat({
      userId: 'system',
      sessionId: 'system',
      messages: summaryMessages,
      model: undefined, // Use provider default
      temperature: 0.3,
    });

    const summary = response.message?.content ?? 'Conversation summarized.';
    logger.info({ summaryLength: summary.length }, 'Generated conversation summary');
    
    return summary;
  } catch (error) {
    logger.error({ error }, 'Failed to generate summary');
    throw new Error('Summary generation failed');
  }
}

