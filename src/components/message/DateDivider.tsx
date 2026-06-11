// Centered day-boundary marker between render items, in the viewer's local
// timezone (ADP 0003). A hairline rule with the date floating in the middle.

import { formatDividerDate } from "@/lib/formatTimestamp";

export function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="shrink-0 text-xs font-semibold text-muted">{formatDividerDate(date)}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}
