import request from 'supertest';
import { createServer } from '../server.js';
import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { User } from '../db/models/User.js';

describe('Auth Smoke Test', () => {
  let app: any;
  let server: any;

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
    await User.deleteMany({});
  });

  test('Register → Login → Me (with cookie)', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';

    // 1. Register with random email + strong pwd → 201 + Set-Cookie
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    expect(registerRes.body.user).toBeDefined();
    expect(registerRes.body.user.email).toBe(email);
    expect(registerRes.headers['set-cookie']).toBeDefined();

    // 2. Login with same creds → 200 + Set-Cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginRes.body.user).toBeDefined();
    expect(loginRes.body.user.email).toBe(email);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    // Extract cookie
    const cookies = loginRes.headers['set-cookie'];
    const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();

    // 3. GET /api/auth/me with cookie → 200 { user }
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', tokenCookie!)
      .expect(200);

    expect(meRes.body.user).toBeDefined();
    expect(meRes.body.user.email).toBe(email);
  });

  test('Duplicate register → 409', async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';

    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    // Duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(409);

    expect(res.body.error).toBe('EMAIL_TAKEN');
  });

  test('Wrong password → 401 { error:"INVALID_CREDENTIALS" }', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';

    // Register user first
    await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    // Try login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  test('Login with nonexistent user → 401 { error:"INVALID_CREDENTIALS" }', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'P@ssw0rd!' })
      .expect(401);

    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });
});

