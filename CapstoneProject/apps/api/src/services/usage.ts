// Simple in-memory metrics store
// In production, consider Redis or a proper metrics backend

interface Metrics {
  latency: number[];
  tokenIn: number;
  tokenOut: number;
  errors: number;
  requests: number;
  startTime: number;
}

const metrics: Metrics = {
  latency: [],
  tokenIn: 0,
  tokenOut: 0,
  errors: 0,
  requests: 0,
  startTime: Date.now(),
};

// Keep only last hour of data
const MAX_AGE_MS = 60 * 60 * 1000;
const MAX_LATENCY_SAMPLES = 1000;

export function recordRequest(latencyMs: number, inputTokens: number, outputTokens: number): void {
  metrics.requests++;
  metrics.tokenIn += inputTokens;
  metrics.tokenOut += outputTokens;
  
  // Keep only recent latency samples
  const now = Date.now();
  if (metrics.latency.length >= MAX_LATENCY_SAMPLES) {
    metrics.latency.shift();
  }
  metrics.latency.push(latencyMs);
}

export function recordError(): void {
  metrics.errors++;
}

export function getMetrics(): {
  latencyP50: number;
  latencyP95: number;
  tokenIn: number;
  tokenOut: number;
  errorRate: number;
  requests: number;
  uptime: number;
} {
  const latencies = [...metrics.latency].sort((a, b) => a - b);
  const p50Index = Math.floor(latencies.length * 0.5);
  const p95Index = Math.floor(latencies.length * 0.95);
  
  const uptime = Date.now() - metrics.startTime;
  const errorRate = metrics.requests > 0 ? metrics.errors / metrics.requests : 0;
  
  return {
    latencyP50: latencies[p50Index] ?? 0,
    latencyP95: latencies[p95Index] ?? 0,
    tokenIn: metrics.tokenIn,
    tokenOut: metrics.tokenOut,
    errorRate,
    requests: metrics.requests,
    uptime,
  };
}

export function resetMetrics(): void {
  metrics.latency = [];
  metrics.tokenIn = 0;
  metrics.tokenOut = 0;
  metrics.errors = 0;
  metrics.requests = 0;
  metrics.startTime = Date.now();
}

