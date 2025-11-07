import { randomBytes } from 'crypto';

export function generateId(prefix?: string): string {
  const id = randomBytes(16).toString('hex');
  return prefix ? `${prefix}_${id}` : id;
}

export function generateSessionId(): string {
  return generateId('sess');
}

export function generateMessageId(): string {
  return generateId('msg');
}

export function generateUserId(): string {
  return generateId('user');
}

