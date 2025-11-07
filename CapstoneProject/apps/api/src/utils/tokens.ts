// Simple token estimation (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Count tokens in messages array
export function countMessageTokens(messages: Array<{ role: string; content: string }>): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
}

// Calculate token budget usage
export function calculateTokenUsage(
  inputTokens: number,
  outputTokens: number,
  maxBudget: number
): { used: number; remaining: number; percentage: number } {
  const used = inputTokens + outputTokens;
  const remaining = Math.max(0, maxBudget - used);
  const percentage = (used / maxBudget) * 100;
  
  return { used, remaining, percentage };
}

