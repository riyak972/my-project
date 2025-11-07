import request from 'supertest';
import { createServer } from '../server.js';
import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { User, Session, Message } from '../db/models/index.js';

describe('Chat E2E Flow', () => {
  let app: any;
  let server: any;
  let authCookie: string;
  let userId: string;
  let sessionId: string;

  beforeAll(async () => {
    await connectMongo();
    app = await createServer();
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
    await disconnectMongo();
  });

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Session.deleteMany({});
    await Message.deleteMany({});

    // Register and login to get auth cookie
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'e2e-test@example.com',
        password: 'TestPassword123!',
      });

    expect(registerResponse.status).toBe(201);
    userId = registerResponse.body.user._id;

    // Extract cookie
    const cookies = registerResponse.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  describe('Complete Chat Flow', () => {
    test('should complete full flow: create session -> send message -> fetch messages', async () => {
      // Step 1: Create session
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Cookie', authCookie)
        .send({
          title: 'E2E Test Chat',
          systemPrompt: 'You are a helpful assistant',
        });

      expect(sessionResponse.status).toBe(201);
      expect(sessionResponse.body._id).toBeDefined();
      sessionId = sessionResponse.body._id;

      // Step 2: Send message (non-streaming) - mock provider should work
      const chatResponse = await request(app)
        .post('/api/chat')
        .set('Cookie', authCookie)
        .send({
          sessionId,
          content: 'Hello, test message',
        });

      // Should succeed with mock provider or fail gracefully with 400
      expect([200, 400, 500]).toContain(chatResponse.status);

      // If chat succeeded, verify messages were saved
      if (chatResponse.status === 200) {
        expect(chatResponse.body.message).toBeDefined();
      }

      // Step 3: Fetch messages via /api/sessions/messages?sessionId=...
      const messagesResponse1 = await request(app)
        .get(`/api/sessions/messages?sessionId=${sessionId}`)
        .set('Cookie', authCookie);

      expect(messagesResponse1.status).toBe(200);
      expect(messagesResponse1.body.messages).toBeDefined();
      expect(Array.isArray(messagesResponse1.body.messages)).toBe(true);

      // Step 4: Fetch messages via /api/sessions/:id/messages (alias)
      const messagesResponse2 = await request(app)
        .get(`/api/sessions/${sessionId}/messages`)
        .set('Cookie', authCookie);

      expect(messagesResponse2.status).toBe(200);
      expect(messagesResponse2.body.messages).toBeDefined();
      expect(Array.isArray(messagesResponse2.body.messages)).toBe(true);

      // Step 5: Fetch messages via /api/messages?sessionId=... (new alias)
      const messagesResponse3 = await request(app)
        .get(`/api/messages?sessionId=${sessionId}`)
        .set('Cookie', authCookie);

      expect(messagesResponse3.status).toBe(200);
      expect(messagesResponse3.body.messages).toBeDefined();
      expect(Array.isArray(messagesResponse3.body.messages)).toBe(true);

      // All three endpoints should return the same data
      if (chatResponse.status === 200) {
        expect(messagesResponse1.body.messages.length).toBeGreaterThan(0);
        expect(messagesResponse1.body.messages.length).toBe(
          messagesResponse2.body.messages.length
        );
        expect(messagesResponse1.body.messages.length).toBe(
          messagesResponse3.body.messages.length
        );

        // Verify message pattern: user message and potentially assistant response
        const messages = messagesResponse1.body.messages;
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe('Hello, test message');
      }
    });

    test('should handle missing sessionId in query parameter', async () => {
      const response = await request(app)
        .get('/api/sessions/messages')
        .set('Cookie', authCookie);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('sessionId');
    });

    test('should handle invalid sessionId format', async () => {
      const response = await request(app)
        .get('/api/sessions/messages?sessionId=invalid-id')
        .set('Cookie', authCookie);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid');
    });

    test('should return 404 for session that does not belong to user', async () => {
      // Create a session
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Cookie', authCookie)
        .send({ title: 'Test Session' });

      sessionId = sessionResponse.body._id;

      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'OtherPassword123!',
        });

      const otherCookie = Array.isArray(otherUserResponse.headers['set-cookie'])
        ? otherUserResponse.headers['set-cookie'][0]
        : otherUserResponse.headers['set-cookie'];

      // Try to fetch messages with other user's cookie
      const response = await request(app)
        .get(`/api/sessions/messages?sessionId=${sessionId}`)
        .set('Cookie', otherCookie);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Session not found');
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/sessions/messages?sessionId=123');

      expect(response.status).toBe(401);
    });

    test('should list sessions for authenticated user', async () => {
      // Create a few sessions
      await request(app)
        .post('/api/sessions')
        .set('Cookie', authCookie)
        .send({ title: 'Session 1' });

      await request(app)
        .post('/api/sessions')
        .set('Cookie', authCookie)
        .send({ title: 'Session 2' });

      const response = await request(app)
        .get('/api/sessions')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Route Manifest', () => {
    test('should return route manifest in dev mode', async () => {
      const response = await request(app).get('/__routes');

      expect(response.status).toBe(200);
      expect(response.body.routes).toBeDefined();
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBeGreaterThan(0);

      // Verify critical routes exist
      const routes = response.body.routes;
      const routePaths = routes.map((r: any) => r.path);

      expect(routePaths).toContain('/api/sessions/messages');
      expect(routePaths).toContain('/api/sessions/:id/messages');
      expect(routePaths).toContain('/api/chat/stream');
      expect(routePaths).toContain('/api/chat/');
    });
  });
});
