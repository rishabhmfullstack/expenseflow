import { ManagerHistoryContent } from '@/components/pages/manager-history-content';
import { fetchManagerHistoryServer } from '@/lib/data/server-queries';

export default async function ManagerHistoryPage() {
  const initialData = await fetchManagerHistoryServer(1, 10);

  return <ManagerHistoryContent initialData={initialData} />;
}
