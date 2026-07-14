import { cookies } from 'next/headers';
import type { Role } from '@/types';

export const ACCESS_TOKEN_COOKIE = 'expenseflow_access_token';
export const ROLE_COOKIE = 'expenseflow_role';
export const SESSION_COOKIE = 'expenseflow_session';

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getServerRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE)?.value;
  if (!role) {
    return null;
  }

  return role as Role;
}

export async function hasServerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(SESSION_COOKIE)?.value);
}
