import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import { startServer } from './server.js';

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

