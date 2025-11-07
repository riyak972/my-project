import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES: z.string().default('1d'),
  COOKIE_SECURE: z.string().transform((v) => v === 'true').default('false'),
  
  // Mongo
  MONGO_URI: z.string().default('mongodb://localhost:27017/mern_chat'),
  
  // Provider selection
  PROVIDER_DEFAULT: z.enum(['gemini', 'openai', 'dialogflow', 'mock']).default('gemini'),
  
  // Gemini (default)
  GEMINI_API_KEY: z.string().optional(),
  
  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),
  
  // Dialogflow ES (optional)
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  DIALOGFLOW_PROJECT_ID: z.string().optional(),
  DIALOGFLOW_LANGUAGE_CODE: z.string().default('en'),
  
  // Feature flags
  FEATURE_WS: z.string().transform((v) => v === 'true').default('false'),
  FEATURE_TOOLS: z.string().transform((v) => v === 'true').default('false'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (env) return env;
  
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Failed to validate environment variables');
  }
}

