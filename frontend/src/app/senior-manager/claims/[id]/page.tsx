import { SeniorManagerClaimDetailContent } from '@/components/pages/senior-manager-claim-detail-content';
import { fetchSeniorManagerClaimServer } from '@/lib/data/server-queries';

export default async function SeniorManagerClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialClaim = await fetchSeniorManagerClaimServer(id);

  return <SeniorManagerClaimDetailContent id={id} initialClaim={initialClaim} />;
}
