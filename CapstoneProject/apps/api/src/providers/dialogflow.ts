import { SessionsClient } from '@google-cloud/dialogflow';
import type { BaseProvider, ChatRequest, ChatResponse, StreamChunk } from './base.js';
import { config } from '../config.js';
import { generateId } from '../services/ids.js';
import { logger } from '../utils/logger.js';

export class DialogflowProvider implements BaseProvider {
  private client: SessionsClient | null = null;
  private enabled: boolean;
  private projectId: string;
  private languageCode: string;

  constructor() {
    this.enabled = config.providers.dialogflow.enabled;
    this.projectId = config.providers.dialogflow.projectId ?? '';
    this.languageCode = config.providers.dialogflow.languageCode;
    
    if (this.enabled && config.providers.dialogflow.credentialsPath) {
      try {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = config.providers.dialogflow.credentialsPath;
        this.client = new SessionsClient();
      } catch (error) {
        logger.error({ error }, 'Failed to initialize Dialogflow client');
        this.enabled = false;
      }
    }
  }

  name(): string {
    return 'dialogflow';
  }

  supportsTools(): boolean {
    return false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async chat(req: ChatRequest, onStream?: (chunk: StreamChunk) => void): Promise<ChatResponse> {
    if (!this.enabled || !this.client) {
      throw new Error(
        'Dialogflow provider is not enabled. Set GOOGLE_APPLICATION_CREDENTIALS and DIALOGFLOW_PROJECT_ID in .env'
      );
    }

    const { messages, sessionId } = req;
    
    // Get last user message
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    try {
      const sessionPath = this.client.projectPath(this.projectId);
      const sessionName = `${sessionPath}/agent/sessions/${sessionId}`;

      const request = {
        session: sessionName,
        queryInput: {
          text: {
            text: lastUserMessage.content,
            languageCode: this.languageCode,
          },
        },
      };

      if (onStream) {
        onStream({ type: 'event', name: 'start' });
      }

      const [response] = await this.client.detectIntent(request);
      const fulfillmentText = response.queryResult?.fulfillmentText ?? 'No response';
      const intent = response.queryResult?.intent?.displayName;

      if (onStream) {
        // Dialogflow doesn't support streaming, so we simulate it
        const words = fulfillmentText.split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          const delta = i === 0 ? words[i] : ` ${words[i]}`;
          onStream({ type: 'text', delta });
        }
        onStream({ type: 'event', name: 'end' });
      }

      // Estimate tokens (Dialogflow doesn't provide usage)
      const estimateInputTokens = Math.ceil(lastUserMessage.content.length / 4);
      const estimateOutputTokens = Math.ceil(fulfillmentText.length / 4);

      return {
        id: generateId('dialogflow'),
        provider: 'dialogflow',
        model: `dialogflow-${intent ?? 'default'}`,
        usage: {
          inputTokens: estimateInputTokens,
          outputTokens: estimateOutputTokens,
        },
        message: {
          role: 'assistant',
          content: fulfillmentText,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Dialogflow chat error');
      throw new Error(`Dialogflow API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

