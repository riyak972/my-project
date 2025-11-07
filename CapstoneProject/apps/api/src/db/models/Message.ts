import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  providerMeta?: {
    provider: string;
    model: string;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      costUsd?: number;
    };
  };
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokensIn: {
      type: Number,
    },
    tokensOut: {
      type: Number,
    },
    providerMeta: {
      provider: String,
      model: String,
      usage: {
        inputTokens: Number,
        outputTokens: Number,
        costUsd: Number,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

