import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { DialogflowProvider } from './dialogflow.js';
import { MockProvider } from './mock.js';
import type { BaseProvider } from './base.js';
import { config } from '../config.js';

const providers: Map<string, BaseProvider> = new Map();

// Initialize providers
providers.set('gemini', new GeminiProvider());
providers.set('openai', new OpenAIProvider());
providers.set('dialogflow', new DialogflowProvider());
providers.set('mock', new MockProvider());

export function getProvider(name: string): BaseProvider | null {
  return providers.get(name) ?? null;
}

export function getDefaultProvider(): BaseProvider {
  const defaultName = config.providers.default;
  const provider = providers.get(defaultName);
  if (!provider || !provider.isEnabled()) {
    // Fallback to mock if default is not enabled
    return providers.get('mock')!;
  }
  return provider;
}

export function getAvailableProviders(): Array<{ name: string; enabled: boolean }> {
  return Array.from(providers.entries()).map(([name, provider]) => ({
    name,
    enabled: provider.isEnabled(),
  }));
}

export function getAllProviders(): Map<string, BaseProvider> {
  return providers;
}

