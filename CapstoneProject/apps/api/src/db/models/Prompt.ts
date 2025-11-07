import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPrompt extends Document {
  _id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date;
}

const promptSchema = new Schema<IPrompt>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
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

export const Prompt: Model<IPrompt> = mongoose.model<IPrompt>('Prompt', promptSchema);

