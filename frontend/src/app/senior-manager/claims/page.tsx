import { SeniorManagerClaimsContent } from '@/components/pages/senior-manager-claims-content';
import { fetchSeniorManagerPendingClaimsServer } from '@/lib/data/server-queries';

export default async function SeniorManagerClaimsPage() {
  const initialData = await fetchSeniorManagerPendingClaimsServer(1, 10);

  return <SeniorManagerClaimsContent initialData={initialData} />;
}
