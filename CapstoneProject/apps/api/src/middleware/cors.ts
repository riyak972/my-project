import cors from 'cors';
import { config } from '../config.js';

export const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', /^http:\/\/127\.0\.0\.1:\d+$/],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
});

