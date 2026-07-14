import { AdminClaimsContent } from '@/components/pages/admin-claims-content';
import { fetchAdminClaimsServer } from '@/lib/data/server-queries';

export default async function AdminClaimsPage() {
  const initialData = await fetchAdminClaimsServer(1, 10);

  return <AdminClaimsContent initialData={initialData} />;
}
