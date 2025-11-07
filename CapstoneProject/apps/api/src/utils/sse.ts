import type { Response } from 'express';
import { logger } from './logger.js';

export interface SSEOptions {
  heartbeatInterval?: number; // ms
  retry?: number; // ms
}

export class SSESender {
  private res: Response;
  private heartbeatInterval?: NodeJS.Timeout;
  private closed = false;
  private options: Required<SSEOptions>;

  constructor(res: Response, options: SSEOptions = {}) {
    this.res = res;
    this.options = {
      heartbeatInterval: options.heartbeatInterval ?? 15000,
      retry: options.retry ?? 3000,
    };
    this.setup();
  }

  private setup(): void {
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection event
    this.send('event', 'connected', { retry: this.options.retry });

    // Setup heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (!this.closed) {
        this.send('event', 'heartbeat', {});
      }
    }, this.options.heartbeatInterval);

    // Handle client disconnect
    this.res.on('close', () => {
      this.close();
    });
  }

  send(event: string, data: unknown): void {
    if (this.closed) return;

    try {
      const json = JSON.stringify(data);
      this.res.write(`event: ${event}\n`);
      this.res.write(`data: ${json}\n\n`);
    } catch (error) {
      logger.error({ error }, 'Failed to send SSE message');
      this.close();
    }
  }

  sendChunk(chunk: unknown): void {
    this.send('message', chunk);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    try {
      this.res.end();
    } catch (error) {
      logger.error({ error }, 'Error closing SSE connection');
    }
  }

  isClosed(): boolean {
    return this.closed;
  }
}

