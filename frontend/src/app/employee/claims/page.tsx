import { EmployeeClaimsContent } from '@/components/pages/employee-claims-content';
import { fetchEmployeeClaimsServer } from '@/lib/data/server-queries';

export default async function EmployeeClaimsPage() {
  const initialData = await fetchEmployeeClaimsServer(1, 10);

  return <EmployeeClaimsContent initialData={initialData} />;
}
