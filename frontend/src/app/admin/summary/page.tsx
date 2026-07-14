import { AdminSummaryContent } from '@/components/pages/admin-summary-content';
import { fetchAdminSummaryServer } from '@/lib/data/server-queries';

export default async function AdminSummaryPage() {
  const initialData = await fetchAdminSummaryServer(1, 12);

  return <AdminSummaryContent initialData={initialData} />;
}
