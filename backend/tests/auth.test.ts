import { createApp } from '../src/app';
import { resetDatabase } from './helpers/db';
import {
  authHeader,
  createAgent,
  extractRefreshToken,
  login,
} from './helpers/http';
import { TEST_PASSWORD, seedRoleHierarchy } from './helpers/fixtures';

async function waitForDistinctRefreshToken(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

describe('Authentication API', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDatabase();
    await seedRoleHierarchy();
  });

  it('logs in with valid credentials and returns an access token', async () => {
    const agent = createAgent(app);

    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'employee@test.expenseflow.com', password: TEST_PASSWORD })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      email: 'employee@test.expenseflow.com',
      role: 'EMPLOYEE',
    });
    expect(extractRefreshToken(response)).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const response = await createAgent(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@test.expenseflow.com', password: 'wrong-password' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toMatch(/invalid email or password/i);
  });

  it('registers a new employee account', async () => {
    const response = await createAgent(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'new-hire@test.expenseflow.com',
        password: TEST_PASSWORD,
        firstName: 'New',
        lastName: 'Hire',
      })
      .expect(201);

    expect(response.body.data.user).toMatchObject({
      email: 'new-hire@test.expenseflow.com',
      role: 'EMPLOYEE',
    });
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it('issues a new access token when refreshing with a valid refresh token', async () => {
    const agent = createAgent(app);

    const loginResponse = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'manager@test.expenseflow.com', password: TEST_PASSWORD })
      .expect(200);

    const originalAccessToken = loginResponse.body.data.accessToken;
    const refreshToken = extractRefreshToken(loginResponse);

    await waitForDistinctRefreshToken();

    const refreshResponse = await agent
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshResponse.body.data.accessToken).toEqual(expect.any(String));
    expect(refreshResponse.body.data.accessToken).not.toBe(originalAccessToken);
    expect(refreshResponse.body.data.user.role).toBe('MANAGER');
  });

  it('rotates refresh tokens and rejects reuse of a revoked refresh token', async () => {
    const agent = createAgent(app);

    const loginResponse = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'employee@test.expenseflow.com', password: TEST_PASSWORD })
      .expect(200);

    const firstRefreshToken = extractRefreshToken(loginResponse);

    await waitForDistinctRefreshToken();

    await agent.post('/api/v1/auth/refresh').send({ refreshToken: firstRefreshToken }).expect(200);

    await createAgent(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: firstRefreshToken })
      .expect(401);
  });

  it('returns the authenticated profile from /auth/me', async () => {
    const agent = createAgent(app);
    const { accessToken } = await login(agent, 'admin@test.expenseflow.com', TEST_PASSWORD);

    const response = await agent.get('/api/v1/auth/me').set(authHeader(accessToken)).expect(200);

    expect(response.body.data.user).toMatchObject({
      email: 'admin@test.expenseflow.com',
      role: 'ADMIN',
    });
  });

  it('logs out and clears the refresh token session', async () => {
    const agent = createAgent(app);

    const loginResponse = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'employee@test.expenseflow.com', password: TEST_PASSWORD })
      .expect(200);

    const refreshToken = extractRefreshToken(loginResponse);

    await agent.post('/api/v1/auth/logout').send({ refreshToken }).expect(200);

    await agent.post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
  });
});
