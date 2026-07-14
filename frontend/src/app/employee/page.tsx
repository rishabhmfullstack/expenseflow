import { EmployeeDashboardContent } from '@/components/pages/employee-dashboard-content';
import { fetchEmployeeClaimsServer } from '@/lib/data/server-queries';

export default async function EmployeeDashboardPage() {
  const initialData = await fetchEmployeeClaimsServer(1, 5);

  return <EmployeeDashboardContent initialData={initialData} />;
}
