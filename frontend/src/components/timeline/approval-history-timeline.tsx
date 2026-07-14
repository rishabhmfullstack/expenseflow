'use client';

import {
  Ban,
  CheckCircle2,
  FilePenLine,
  RotateCcw,
  Send,
} from 'lucide-react';
import { RoleBadge } from '@/components/ui/badge';
import { formatDateTime, formatLabel } from '@/lib/utils';
import type { ApprovalAction, ApprovalHistoryEntry, ApprovalStep } from '@/types';
import { Timeline, type TimelineItem, type TimelineTone } from './timeline';

function getActionTone(action: ApprovalAction): TimelineTone {
  switch (action) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
    case 'CANCELLED':
      return 'danger';
    case 'REVISION_REQUESTED':
      return 'warning';
    case 'SUBMITTED':
    case 'RESUBMITTED':
      return 'info';
    default:
      return 'default';
  }
}

function getActionIcon(action: ApprovalAction) {
  switch (action) {
    case 'APPROVED':
      return <CheckCircle2 className="h-4 w-4 text-white" />;
    case 'REJECTED':
    case 'CANCELLED':
      return <Ban className="h-4 w-4 text-white" />;
    case 'REVISION_REQUESTED':
      return <RotateCcw className="h-4 w-4 text-white" />;
    case 'SUBMITTED':
    case 'RESUBMITTED':
      return <Send className="h-4 w-4 text-white" />;
    default:
      return <FilePenLine className="h-4 w-4 text-white" />;
  }
}

function toTimelineItem(entry: ApprovalHistoryEntry): TimelineItem {
  return {
    id: entry.id,
    tone: getActionTone(entry.action),
    icon: getActionIcon(entry.action),
    title: (
      <span className="flex flex-wrap items-center gap-2">
        <span>
          {entry.actor.firstName} {entry.actor.lastName}
        </span>
        <RoleBadge role={entry.actor.role} />
      </span>
    ),
    subtitle: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-700">{formatLabel(entry.action)}</span>
        <span className="text-slate-300">•</span>
        <span>{formatLabel(entry.step)} step</span>
      </span>
    ),
    meta: formatDateTime(entry.createdAt),
    description: entry.note ? (
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Note</p>
        <p className="whitespace-pre-wrap text-slate-700">{entry.note}</p>
      </div>
    ) : undefined,
  };
}

export function ApprovalHistoryTimeline({
  history,
  className,
}: {
  history: ApprovalHistoryEntry[];
  className?: string;
}) {
  const items = history.map(toTimelineItem);

  return <Timeline items={items} className={className} />;
}

export function getApprovalStepLabel(step: ApprovalStep) {
  return formatLabel(step);
}

export function getApprovalActionLabel(action: ApprovalAction) {
  return formatLabel(action);
}
