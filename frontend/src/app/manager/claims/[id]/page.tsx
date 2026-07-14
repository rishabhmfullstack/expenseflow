import { ManagerClaimDetailContent } from '@/components/pages/manager-claim-detail-content';
import { fetchManagerClaimServer } from '@/lib/data/server-queries';

export default async function ManagerClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialClaim = await fetchManagerClaimServer(id);

  return <ManagerClaimDetailContent id={id} initialClaim={initialClaim} />;
}
