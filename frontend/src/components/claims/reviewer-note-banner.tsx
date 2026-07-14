import { AlertCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { ApprovalHistoryEntry } from '@/types';

interface ReviewerNoteBannerProps {
  entry: ApprovalHistoryEntry;
}

export function ReviewerNoteBanner({ entry }: ReviewerNoteBannerProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-amber-900">Revision requested</p>
          <p className="mt-1 text-sm text-amber-800">
            {entry.actor.firstName} {entry.actor.lastName} asked you to revise this claim on{' '}
            {formatDateTime(entry.createdAt)}.
          </p>
          {entry.note && (
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-700">
              {entry.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
