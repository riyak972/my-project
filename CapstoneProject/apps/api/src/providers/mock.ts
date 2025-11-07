import type { BaseProvider, ChatRequest, ChatResponse, StreamChunk } from './base.js';
import { generateId } from '../services/ids.js';
import { estimateTokens } from '../utils/tokens.js';

export class MockProvider implements BaseProvider {
  name(): string {
    return 'mock';
  }

  supportsTools(): boolean {
    return false;
  }

  isEnabled(): boolean {
    return true; // Always enabled for testing
  }

  async chat(req: ChatRequest, onStream?: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    const { messages, model = 'mock-model', temperature = 0.7 } = req;
    
    // Simulate deterministic response based on last user message
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const responseText = lastUserMessage
      ? `Mock response to: "${lastUserMessage.content.substring(0, 50)}..." (model: ${model}, temp: ${temperature})`
      : 'Mock response: Hello! How can I help you?';

    // Simulate streaming
    if (onStream) {
      onStream({ type: 'event', name: 'start' });
      
      // Send chunks with delays
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay per word
        const delta = i === 0 ? words[i] : ` ${words[i]}`;
        onStream({ type: 'text', delta });
      }
      
      onStream({ type: 'event', name: 'end' });
    }

    const inputTokens = estimateTokens(messages.map((m) => m.content).join(' '));
    const outputTokens = estimateTokens(responseText);

    return {
      id: generateId('mock'),
      provider: 'mock',
      model,
      usage: {
        inputTokens,
        outputTokens,
        costUsd: 0,
      },
      message: {
        role: 'assistant',
        content: responseText,
      },
    };
  }
}

