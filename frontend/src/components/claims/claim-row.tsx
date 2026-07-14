import Link from 'next/link';
import { formatCurrency, formatDate, formatLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import type { Claim, ClaimWithEmployee } from '@/types';

export function ClaimRow({ claim, href }: { claim: Claim | ClaimWithEmployee; href?: string }) {
  const content = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900">{formatLabel(claim.category)}</p>
          <StatusBadge status={claim.status} />
        </div>
        <p className="mt-1 truncate text-sm text-slate-600">{claim.description}</p>
        <p className="mt-1 text-xs text-slate-400">{formatDate(claim.expenseDate)}</p>
        {'employee' in claim && (
          <p className="mt-1 text-xs text-slate-500">
            {claim.employee.firstName} {claim.employee.lastName}
          </p>
        )}
      </div>
      <p className="text-lg font-semibold text-slate-900">{formatCurrency(claim.amount)}</p>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-xl border border-slate-200 bg-white p-4">{content}</div>;
}

export { Pagination } from '@/components/common/pagination';
