import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  userId: string;
  status: 'active' | 'expired';
  title: string;
  systemPrompt?: string;
  model?: string;
  provider?: 'gemini' | 'openai' | 'dialogflow' | 'mock';
  summary?: string;
  tokenBudget: {
    max: number;
    used: number;
  };
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    systemPrompt: {
      type: String,
    },
    model: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'dialogflow', 'mock'],
    },
    summary: {
      type: String,
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    tokenBudget: {
      max: {
        type: Number,
        default: 100000,
      },
      used: {
        type: Number,
        default: 0,
      },
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index for automatic cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> = mongoose.model<ISession>('Session', sessionSchema);

