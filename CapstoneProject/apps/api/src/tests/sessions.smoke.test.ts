import request from 'supertest';
import { createServer } from '../server.js';
import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { User, Session } from '../db/models/index.js';
import bcrypt from 'bcryptjs';

describe('Sessions Smoke Test', () => {
  let app: any;
  let server: any;
  let authCookie: string;

  beforeAll(async () => {
    await connectMongo();
    app = await createServer();
    server = app.listen(0);

    // Create test user and login to get auth cookie
    const email = `test-${Date.now()}@example.com`;
    const password = 'testing123';
    const hash = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      hash,
      role: 'user',
    });
    await user.save();

    // Login to get cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'];
    authCookie = cookies.find((c: string) => c.startsWith('token=')) || '';
  });

  afterAll(async () => {
    await server.close();
    await disconnectMongo();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
  });

  test('POST /api/sessions - create session with empty body', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Cookie', authCookie)
      .send({})
      .expect(201);

    expect(res.body._id).toBeDefined();
    expect(res.body.title).toBe('New Chat');
    expect(res.body.userId).toBeDefined();
    expect(res.body.tokenBudget.max).toBe(100000);
    expect(res.body.tokenBudget.used).toBe(0);
    expect(res.body.expiresAt).toBeDefined();
  });

  test('POST /api/sessions - create session with title', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Cookie', authCookie)
      .send({ title: 'Test Session' })
      .expect(201);

    expect(res.body.title).toBe('Test Session');
    expect(res.body._id).toBeDefined();
  });

  test('GET /api/sessions - list sessions', async () => {
    // Create a session first
    await request(app)
      .post('/api/sessions')
      .set('Cookie', authCookie)
      .send({})
      .expect(201);

    // Get sessions
    const res = await request(app)
      .get('/api/sessions')
      .set('Cookie', authCookie)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe('New Chat');
  });

  test('POST /api/sessions - requires authentication', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({})
      .expect(401);

    expect(res.body.error).toBe('Authentication required');
  });
});

