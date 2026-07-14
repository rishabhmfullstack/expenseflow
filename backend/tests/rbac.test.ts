import { createApp } from '../src/app';
import { resetDatabase } from './helpers/db';
import {
  authHeader,
  createAgent,
  createDraftClaim,
  login,
  submitClaim,
} from './helpers/http';
import { TEST_PASSWORD, buildClaimPayload, getRoleHierarchy, seedRoleHierarchy } from './helpers/fixtures';

describe('RBAC API', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDatabase();
    await seedRoleHierarchy();
  });

  it('requires authentication for protected routes', async () => {
    await createAgent(app).get('/api/v1/claims').expect(401);
    await createAgent(app).get('/api/v1/manager/claims').expect(401);
    await createAgent(app).get('/api/v1/admin/users').expect(401);
  });

  it('forbids employees from manager endpoints', async () => {
    const agent = createAgent(app);
    const { accessToken } = await login(agent, 'employee@test.expenseflow.com', TEST_PASSWORD);

    const response = await agent
      .get('/api/v1/manager/claims')
      .set(authHeader(accessToken))
      .expect(403);

    expect(response.body.error.message).toMatch(/insufficient permissions/i);
  });

  it('forbids managers from senior manager endpoints', async () => {
    const agent = createAgent(app);
    const { accessToken } = await login(agent, 'manager@test.expenseflow.com', TEST_PASSWORD);

    const response = await agent
      .get('/api/v1/senior-manager/claims')
      .set(authHeader(accessToken))
      .expect(403);

    expect(response.body.error.message).toMatch(/insufficient permissions/i);
  });

  it('forbids employees from admin endpoints', async () => {
    const agent = createAgent(app);
    const { accessToken } = await login(agent, 'employee@test.expenseflow.com', TEST_PASSWORD);

    const response = await agent
      .get('/api/v1/admin/users')
      .set(authHeader(accessToken))
      .expect(403);

    expect(response.body.error.message).toMatch(/insufficient permissions/i);
  });

  it('allows admins to list users and blocks non-admins', async () => {
    const agent = createAgent(app);
    const adminSession = await login(agent, 'admin@test.expenseflow.com', TEST_PASSWORD);
    const managerSession = await login(agent, 'manager@test.expenseflow.com', TEST_PASSWORD);

    const adminResponse = await agent
      .get('/api/v1/admin/users')
      .set(authHeader(adminSession.accessToken))
      .expect(200);

    expect(adminResponse.body.data.users.length).toBeGreaterThan(0);

    await agent
      .get('/api/v1/admin/users')
      .set(authHeader(managerSession.accessToken))
      .expect(403);
  });

  it('prevents a manager from acting on claims not pending with them', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    await agent
      .post(`/api/v1/manager/claims/${claimId}/approve`)
      .set(authHeader(managerSession.accessToken))
      .send({})
      .expect(200);

    const response = await agent
      .post(`/api/v1/manager/claims/${claimId}/approve`)
      .set(authHeader(managerSession.accessToken))
      .send({})
      .expect(403);

    expect(response.body.error.message).toMatch(/not pending with you/i);
  });
});
