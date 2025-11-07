export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  tools?: any[];
  stream?: boolean;
};

export type StreamChunk =
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; args: any }
  | { type: 'event'; name: 'start' | 'end' | 'error' | 'heartbeat'; data?: any };

export type ChatResponse = {
  id: string;
  provider: 'gemini' | 'openai' | 'dialogflow' | 'mock';
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
  };
  message?: {
    role: 'assistant';
    content: string;
  };
};

export interface BaseProvider {
  name(): string;
  supportsTools(): boolean;
  isEnabled(): boolean;
  chat(req: ChatRequest, onStream?: (chunk: StreamChunk) => void): Promise<ChatResponse>;
}

