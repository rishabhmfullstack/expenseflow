'use client';

import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { EmptyState, ErrorState } from '@/components/common/states';
import { ListCardSkeleton } from '@/components/common/skeleton';
import { ApprovalHistoryTimeline } from '@/components/timeline';
import { getApiErrorMessage } from '@/lib/api';
import {
  approvalHistoryService,
  type ApprovalHistoryScope,
} from '@/services/approval-history.service';

interface ApprovalHistoryPanelProps {
  claimId: string;
  scope: ApprovalHistoryScope;
  className?: string;
}

export function ApprovalHistoryPanel({ claimId, scope, className }: ApprovalHistoryPanelProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['approval-history', scope, claimId],
    queryFn: () => approvalHistoryService.list(scope, claimId),
  });

  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Approval history</h2>
      </div>

      {isLoading && <ListCardSkeleton rows={3} />}
      {isError && (
        <ErrorState
          title="Could not load history"
          message={getApiErrorMessage(error)}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState
          title="No approval activity yet"
          description="Actions such as submissions, approvals, and rejections will appear here."
        />
      )}
      {!isLoading && !isError && data && data.length > 0 && (
        <ApprovalHistoryTimeline history={data} />
      )}
    </section>
  );
}
