import request, { Agent, Response, Test } from 'supertest';
import { Express } from 'express';

export function authHeader(accessToken: string): { Authorization: string } {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function login(
  agent: Agent,
  email: string,
  password: string,
): Promise<{ accessToken: string; user: { id: string; role: string } }> {
  const response = await agent.post('/api/v1/auth/login').send({ email, password }).expect(200);

  return {
    accessToken: response.body.data.accessToken,
    user: response.body.data.user,
  };
}

export function createAgent(app: Express): Agent {
  return request.agent(app);
}

export function extractRefreshToken(response: Response): string {
  const setCookie = response.headers['set-cookie'];

  if (!setCookie) {
    throw new Error('Expected refresh token cookie on response');
  }

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  const refreshCookie = cookies.find((cookie) => cookie.startsWith('refreshToken='));

  if (!refreshCookie) {
    throw new Error('Refresh token cookie not found');
  }

  return decodeURIComponent(refreshCookie.split(';')[0].split('=')[1] ?? '');
}

export async function createDraftClaim(
  agent: Agent,
  accessToken: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const response = await agent
    .post('/api/v1/claims')
    .set(authHeader(accessToken))
    .send(payload)
    .expect(201);

  return response.body.data.claim.id as string;
}

export async function submitClaim(agent: Agent, accessToken: string, claimId: string): Promise<Test> {
  return agent
    .post(`/api/v1/claims/${claimId}/submit`)
    .set(authHeader(accessToken))
    .expect(200);
}
