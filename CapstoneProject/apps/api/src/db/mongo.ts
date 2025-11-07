import mongoose from 'mongoose';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri);
    logger.info({ uri: config.mongo.uri }, 'MongoDB connected');
  } catch (error) {
    logger.error({ error, uri: config.mongo.uri }, 'MongoDB connection failed');
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error({ error }, 'MongoDB disconnection failed');
    throw error;
  }
}

