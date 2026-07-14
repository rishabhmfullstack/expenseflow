import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'password123';
const SALT_ROUNDS = 12;

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  const seniorManager = await prisma.user.upsert({
    where: { email: 'sm@expenseflow.com' },
    update: {},
    create: {
      email: 'sm@expenseflow.com',
      passwordHash,
      firstName: 'Sam',
      lastName: 'Senior',
      role: Role.SENIOR_MANAGER,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@expenseflow.com' },
    update: {},
    create: {
      email: 'manager@expenseflow.com',
      passwordHash,
      firstName: 'Morgan',
      lastName: 'Manager',
      role: Role.MANAGER,
      managerId: seniorManager.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@expenseflow.com' },
    update: { managerId: manager.id },
    create: {
      email: 'employee@expenseflow.com',
      passwordHash,
      firstName: 'Ella',
      lastName: 'Employee',
      role: Role.EMPLOYEE,
      managerId: manager.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@expenseflow.com' },
    update: {},
    create: {
      email: 'admin@expenseflow.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  console.log('Seed complete. Demo accounts (password: password123):');
  console.log('  employee@expenseflow.com  — Employee');
  console.log('  manager@expenseflow.com   — Manager');
  console.log('  sm@expenseflow.com        — Senior Manager');
  console.log('  admin@expenseflow.com     — Admin');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
