import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getEnv } from './utils/env.js';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const env = getEnv();

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  clientOrigin: env.CLIENT_ORIGIN,
  
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpires: env.JWT_EXPIRES,
    cookieSecure: env.COOKIE_SECURE,
  },
  
  mongo: {
    uri: env.MONGO_URI,
  },
  
  providers: {
    default: env.PROVIDER_DEFAULT,
    gemini: {
      apiKey: env.GEMINI_API_KEY,
      enabled: !!env.GEMINI_API_KEY,
    },
    openai: {
      apiKey: env.OPENAI_API_KEY,
      enabled: !!env.OPENAI_API_KEY,
    },
    dialogflow: {
      credentialsPath: env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: env.DIALOGFLOW_PROJECT_ID,
      languageCode: env.DIALOGFLOW_LANGUAGE_CODE,
      enabled: !!(env.GOOGLE_APPLICATION_CREDENTIALS && env.DIALOGFLOW_PROJECT_ID),
    },
    mock: {
      enabled: true, // Always enabled for testing
    },
  },
  
  features: {
    websocket: env.FEATURE_WS,
    tools: env.FEATURE_TOOLS,
  },
  
  limits: {
    maxMessageLength: 10000,
    maxMessagesPerRequest: 50,
    tokenBudget: {
      default: 100000,
      max: 1000000,
    },
    summarizeThreshold: 0.8, // Summarize when 80% of budget used
    rateLimit: {
      windowMs: 1 * 60 * 1000, // 1 minute (shorter window for testing)
      maxRequests: 1000, // Much higher limit for development
    },
  },
};

