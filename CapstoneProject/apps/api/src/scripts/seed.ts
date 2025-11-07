import dotenv from 'dotenv';
import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { User } from '../db/models/User.js';
import { Session } from '../db/models/Session.js';
import { Message } from '../db/models/Message.js';
import { /* generateUserId, generateSessionId, generateMessageId */ } from '../services/ids.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function seed() {
  try {
    await connectMongo();

    // Create demo user
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123456';

    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      const hash = await bcrypt.hash(demoPassword, 10);
      user = new User({
        email: demoEmail,
        hash,
        role: 'user',
      });
      await user.save();
      console.log('Created demo user:', demoEmail);
    } else {
      console.log('Demo user already exists:', demoEmail);
    }

    // Create sample session
    let session = await Session.findOne({ userId: user._id });
    if (!session) {
      session = new Session({
        userId: user._id,
        title: 'Welcome Chat',
        tokenBudget: {
          max: 100000,
          used: 0,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      await session.save();
      console.log('Created sample session:', session._id);
    } else {
      console.log('Sample session already exists:', session._id);
    }

    // Create sample messages
    const sampleMessages = [
      {
        role: 'user' as const,
        content: 'Hello! How can you help me?',
      },
      {
        role: 'assistant' as const,
        content:
          'Hello! I\'m an AI assistant powered by the MERN stack. I can help you with various tasks, answer questions, and engage in conversation. What would you like to know?',
      },
    ];

    for (const msg of sampleMessages) {
      const existing = await Message.findOne({
        sessionId: session._id,
        role: msg.role,
        content: msg.content,
      });
      if (!existing) {
        const message = new Message({
          sessionId: session._id,
          role: msg.role,
          content: msg.content,
        });
        await message.save();
      }
    }

    console.log('Seed completed successfully!');
    console.log('Demo credentials:');
    console.log('  Email:', demoEmail);
    console.log('  Password:', demoPassword);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectMongo();
  }
}

seed();


