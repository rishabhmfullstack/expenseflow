import { prisma } from '../../src/config';

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      approval_history,
      refresh_tokens,
      claims,
      users
    RESTART IDENTITY CASCADE;
  `);
}
