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

describe('Claim workflow API', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDatabase();
    await seedRoleHierarchy();
  });

  it('creates a draft claim for an employee', async () => {
    const agent = createAgent(app);
    const { accessToken } = await login(agent, 'employee@test.expenseflow.com', TEST_PASSWORD);

    const response = await agent
      .post('/api/v1/claims')
      .set(authHeader(accessToken))
      .send(buildClaimPayload())
      .expect(201);

    expect(response.body.data.claim).toMatchObject({
      status: 'DRAFT',
      amount: 125.5,
      category: 'MEALS',
      description: 'Team lunch with client',
    });
  });

  it('submits a draft claim to the assigned manager', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const { accessToken } = await login(agent, roles.employee.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, accessToken, buildClaimPayload());

    const response = await submitClaim(agent, accessToken, claimId);

    expect(response.body.data.claim).toMatchObject({
      id: claimId,
      status: 'PENDING_MANAGER',
      pendingWith: roles.manager.id,
    });
  });

  it('resubmits a claim after manager sends it back for revision', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    await agent
      .post(`/api/v1/manager/claims/${claimId}/revert-to-employee`)
      .set(authHeader(managerSession.accessToken))
      .send({ note: 'Please attach the itemized receipt.' })
      .expect(200);

    const resubmitResponse = await submitClaim(agent, employeeSession.accessToken, claimId);

    expect(resubmitResponse.body.data.claim).toMatchObject({
      id: claimId,
      status: 'PENDING_MANAGER',
      pendingWith: roles.manager.id,
    });

    const historyResponse = await agent
      .get(`/api/v1/claims/${claimId}/history`)
      .set(authHeader(employeeSession.accessToken))
      .expect(200);

    const actions = historyResponse.body.data.history.map(
      (entry: { action: string }) => entry.action,
    );

    expect(actions).toEqual(
      expect.arrayContaining(['SUBMITTED', 'REVISION_REQUESTED', 'RESUBMITTED']),
    );
  });

  it('approves a claim through manager and senior manager', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);
    const smSession = await login(agent, roles.seniorManager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    const managerApprove = await agent
      .post(`/api/v1/manager/claims/${claimId}/approve`)
      .set(authHeader(managerSession.accessToken))
      .send({})
      .expect(200);

    expect(managerApprove.body.data.claim).toMatchObject({
      status: 'PENDING_SENIOR_MANAGER',
      pendingWith: roles.seniorManager.id,
    });

    const smApprove = await agent
      .post(`/api/v1/senior-manager/claims/${claimId}/approve`)
      .set(authHeader(smSession.accessToken))
      .send({})
      .expect(200);

    expect(smApprove.body.data.claim).toMatchObject({
      status: 'APPROVED',
      pendingWith: null,
    });
  });

  it('rejects a claim at the manager stage', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    const response = await agent
      .post(`/api/v1/manager/claims/${claimId}/reject`)
      .set(authHeader(managerSession.accessToken))
      .send({ note: 'Expense is not reimbursable.' })
      .expect(200);

    expect(response.body.data.claim).toMatchObject({
      id: claimId,
      status: 'REJECTED',
      pendingWith: null,
    });
  });

  it('reverts a claim from senior manager back to the manager for rework', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);
    const smSession = await login(agent, roles.seniorManager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    await agent
      .post(`/api/v1/manager/claims/${claimId}/approve`)
      .set(authHeader(managerSession.accessToken))
      .send({})
      .expect(200);

    const revertResponse = await agent
      .post(`/api/v1/senior-manager/claims/${claimId}/revert-to-manager`)
      .set(authHeader(smSession.accessToken))
      .send({ note: 'Need manager to confirm budget code.' })
      .expect(200);

    expect(revertResponse.body.data.claim).toMatchObject({
      status: 'REVERTED_TO_MANAGER',
      pendingWith: roles.manager.id,
    });

    const reapproveResponse = await agent
      .post(`/api/v1/manager/claims/${claimId}/approve-after-revert`)
      .set(authHeader(managerSession.accessToken))
      .send({})
      .expect(200);

    expect(reapproveResponse.body.data.claim).toMatchObject({
      status: 'PENDING_SENIOR_MANAGER',
      pendingWith: roles.seniorManager.id,
    });
  });

  it('blocks submit when the claim is no longer editable', async () => {
    const agent = createAgent(app);
    const roles = await getRoleHierarchy();
    const employeeSession = await login(agent, roles.employee.email, TEST_PASSWORD);
    const managerSession = await login(agent, roles.manager.email, TEST_PASSWORD);

    const claimId = await createDraftClaim(agent, employeeSession.accessToken, buildClaimPayload());
    await submitClaim(agent, employeeSession.accessToken, claimId);

    await agent
      .post(`/api/v1/manager/claims/${claimId}/reject`)
      .set(authHeader(managerSession.accessToken))
      .send({ note: 'Not approved.' })
      .expect(200);

    const response = await agent
      .post(`/api/v1/claims/${claimId}/submit`)
      .set(authHeader(employeeSession.accessToken))
      .expect(400);

    expect(response.body.error.message).toMatch(/can only be submitted/i);
  });
});
