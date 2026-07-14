import { ManagerClaimsContent } from '@/components/pages/manager-claims-content';
import { fetchManagerPendingClaimsServer } from '@/lib/data/server-queries';

export default async function ManagerClaimsPage() {
  const initialData = await fetchManagerPendingClaimsServer(1, 10);

  return <ManagerClaimsContent initialData={initialData} />;
}
