import request from 'supertest';
import { createServer } from '../server';
import { connectMongo, disconnectMongo } from '../db/mongo';
import { User } from '../db/models/User';

describe('Auth Routes', () => {
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

  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/register - should fail with existing email', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(409);
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should fail with invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
  });
});


