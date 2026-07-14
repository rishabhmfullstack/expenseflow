'use client';

import { cn } from '@/lib/utils';

export type TimelineTone = 'default' | 'success' | 'danger' | 'warning' | 'info';

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: TimelineTone;
}

const toneStyles: Record<TimelineTone, { dot: string; ring: string }> = {
  default: { dot: 'bg-slate-400', ring: 'ring-slate-100' },
  success: { dot: 'bg-emerald-500', ring: 'ring-emerald-100' },
  danger: { dot: 'bg-red-500', ring: 'ring-red-100' },
  warning: { dot: 'bg-amber-500', ring: 'ring-amber-100' },
  info: { dot: 'bg-indigo-500', ring: 'ring-indigo-100' },
};

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((item, index) => {
        const tone = item.tone ?? 'default';
        const styles = toneStyles[tone];
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-200"
              />
            )}

            <div className="relative z-10 flex shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full ring-4',
                  styles.dot,
                  styles.ring,
                )}
              >
                {item.icon ?? <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </span>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    {item.subtitle && (
                      <p className="mt-0.5 text-sm text-slate-500">{item.subtitle}</p>
                    )}
                  </div>
                  {item.meta && (
                    <div className="shrink-0 text-sm text-slate-500">{item.meta}</div>
                  )}
                </div>
                {item.description && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
