import { MockProvider } from '../providers/mock';
import type { ChatRequest } from '../providers/base';

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider();
  });

  test('should be enabled', () => {
    expect(provider.isEnabled()).toBe(true);
  });

  test('should return mock provider name', () => {
    expect(provider.name()).toBe('mock');
  });

  test('should not support tools', () => {
    expect(provider.supportsTools()).toBe(false);
  });

  test('should generate response', async () => {
    const request: ChatRequest = {
      userId: 'test-user',
      sessionId: 'test-session',
      messages: [
        { role: 'user', content: 'Hello, world!' },
      ],
    };

    const response = await provider.chat(request);

    expect(response).toBeDefined();
    expect(response.provider).toBe('mock');
    expect(response.message).toBeDefined();
    expect(response.message?.content).toContain('Hello, world!');
    expect(response.usage).toBeDefined();
  });

  test('should stream chunks', async () => {
    const request: ChatRequest = {
      userId: 'test-user',
      sessionId: 'test-session',
      messages: [
        { role: 'user', content: 'Test message' },
      ],
      stream: true,
    };

    const chunks: any[] = [];

    await provider.chat(request, (chunk) => {
      chunks.push(chunk);
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].type).toBe('event');
    expect(chunks[0].name).toBe('start');
    expect(chunks[chunks.length - 1].type).toBe('event');
    expect(chunks[chunks.length - 1].name).toBe('end');
  });
});


