import { SeniorManagerDashboardContent } from '@/components/pages/senior-manager-dashboard-content';
import { fetchSeniorManagerPendingClaimsServer } from '@/lib/data/server-queries';

export default async function SeniorManagerDashboardPage() {
  const initialData = await fetchSeniorManagerPendingClaimsServer(1, 10);

  return <SeniorManagerDashboardContent initialData={initialData} />;
}
