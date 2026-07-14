import { redirect } from 'next/navigation';
import { getServerRole } from '@/lib/auth/server-session';
import { ROLE_DASHBOARD } from '@/types';

export default async function HomePage() {
  const role = await getServerRole();

  if (role && role in ROLE_DASHBOARD) {
    redirect(ROLE_DASHBOARD[role]);
  }

  redirect('/login');
}
