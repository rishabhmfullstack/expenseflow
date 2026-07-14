import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, formatLabel } from '@/lib/utils';
import type { ManagerActionHistoryEntry } from '@/types';

export function ManagerActionHistoryRow({
  entry,
}: {
  entry: ManagerActionHistoryEntry;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{formatLabel(entry.action)}</p>
            <StatusBadge status={entry.newStatus} />
            <span className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</span>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">Employee:</span>{' '}
              {entry.employee.firstName} {entry.employee.lastName}
            </p>
            <p>
              <span className="font-medium text-slate-700">Claim:</span>{' '}
              {formatLabel(entry.claim.category)} · {formatCurrency(entry.claim.amount)}
            </p>
          </div>

          <p className="text-sm text-slate-600">{entry.claim.description}</p>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {formatLabel(entry.previousStatus)}
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
              {formatLabel(entry.newStatus)}
            </span>
          </div>

          {entry.note && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                Note
              </p>
              <p className="whitespace-pre-wrap">{entry.note}</p>
            </div>
          )}
        </div>

        <Link
          href={`/manager/claims/${entry.claimId}`}
          className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View claim
        </Link>
      </div>
    </div>
  );
}
