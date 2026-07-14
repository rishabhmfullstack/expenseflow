import { ManagerDashboardContent } from '@/components/pages/manager-dashboard-content';
import { fetchManagerPendingClaimsServer } from '@/lib/data/server-queries';

export default async function ManagerDashboardPage() {
  const initialData = await fetchManagerPendingClaimsServer(1, 10);

  return <ManagerDashboardContent initialData={initialData} />;
}
