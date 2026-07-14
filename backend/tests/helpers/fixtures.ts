import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../src/config';

export const TEST_PASSWORD = 'password123';

export interface RoleHierarchy {
  seniorManager: { id: string; email: string };
  manager: { id: string; email: string };
  employee: { id: string; email: string };
  admin: { id: string; email: string };
}

export async function seedRoleHierarchy(): Promise<RoleHierarchy> {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  const seniorManager = await prisma.user.create({
    data: {
      email: 'sm@test.expenseflow.com',
      passwordHash,
      firstName: 'Sam',
      lastName: 'Senior',
      role: Role.SENIOR_MANAGER,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@test.expenseflow.com',
      passwordHash,
      firstName: 'Morgan',
      lastName: 'Manager',
      role: Role.MANAGER,
      managerId: seniorManager.id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: 'employee@test.expenseflow.com',
      passwordHash,
      firstName: 'Ella',
      lastName: 'Employee',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.expenseflow.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  return {
    seniorManager: { id: seniorManager.id, email: seniorManager.email },
    manager: { id: manager.id, email: manager.email },
    employee: { id: employee.id, email: employee.email },
    admin: { id: admin.id, email: admin.email },
  };
}

export async function getRoleHierarchy(): Promise<RoleHierarchy> {
  const seniorManager = await prisma.user.findUniqueOrThrow({
    where: { email: 'sm@test.expenseflow.com' },
  });
  const manager = await prisma.user.findUniqueOrThrow({
    where: { email: 'manager@test.expenseflow.com' },
  });
  const employee = await prisma.user.findUniqueOrThrow({
    where: { email: 'employee@test.expenseflow.com' },
  });
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@test.expenseflow.com' },
  });

  return {
    seniorManager: { id: seniorManager.id, email: seniorManager.email },
    manager: { id: manager.id, email: manager.email },
    employee: { id: employee.id, email: employee.email },
    admin: { id: admin.id, email: admin.email },
  };
}

export function buildClaimPayload(overrides: Record<string, unknown> = {}) {
  return {
    amount: 125.5,
    category: 'MEALS',
    description: 'Team lunch with client',
    expenseDate: '2026-07-01',
    ...overrides,
  };
}
