import { AdminDashboardContent } from '@/components/pages/admin-dashboard-content';
import { fetchAdminDashboardServer } from '@/lib/data/server-queries';

export default async function AdminDashboardPage() {
  const initialData = await fetchAdminDashboardServer();

  return <AdminDashboardContent initialData={initialData} />;
}
