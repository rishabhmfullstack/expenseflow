import { AdminUsersContent } from '@/components/pages/admin-users-content';
import { fetchAdminUsersServer } from '@/lib/data/server-queries';

export default async function AdminUsersPage() {
  const initialData = await fetchAdminUsersServer(1, 10);

  return <AdminUsersContent initialData={initialData} />;
}
