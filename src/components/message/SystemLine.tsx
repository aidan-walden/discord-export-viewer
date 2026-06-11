// A pure-event render item (GuildMemberJoin, type-21 thread starter, unknown
// numerics) — rendered as a muted, full-width line that breaks message grouping.
// The reply-reference bar and `/command` header are deferred; the event text and
// actor are enough to keep the timeline honest this slice.

import type { Message } from "@/types/message";
import { formatClockTime, formatFullTimestamp } from "@/lib/formatTimestamp";

const displayName = (m: Message) => m.author.nickname ?? m.author.name;

export function SystemLine({ message }: { message: Message }) {
  return (
    <div className="group flex items-baseline gap-4 px-4 py-1 hover:bg-black/[0.06]">
      <span className="w-10 shrink-0 text-right text-[0.625rem] leading-none text-muted">
        <span className="hidden group-hover:inline" title={formatFullTimestamp(message.timestamp)}>
          {formatClockTime(message.timestamp)}
        </span>
      </span>
      <span className="min-w-0 flex-1 text-sm text-muted">
        <span className="font-medium" style={message.author.color ? { color: message.author.color } : undefined}>
          {displayName(message)}
        </span>{" "}
        {message.content || "sent a system message."}
      </span>
    </div>
  );
}
