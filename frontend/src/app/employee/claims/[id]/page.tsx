import { EmployeeClaimDetailContent } from '@/components/pages/employee-claim-detail-content';
import { fetchEmployeeClaimServer } from '@/lib/data/server-queries';

export default async function EmployeeClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialClaim = await fetchEmployeeClaimServer(id);

  return <EmployeeClaimDetailContent id={id} initialClaim={initialClaim} />;
}
