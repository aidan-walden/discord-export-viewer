// Turn an ordered Message[] into an ordered RenderItem[] the MessageList renders
// by switching on a tag (ADP 0003 Q5). Content-bearing messages accrete into
// author groups; pure events become standalone system lines; day boundaries
// emit centered dividers. The day-index the grouping already needs makes the
// dividers nearly free, and interleaving system lines as first-class items keeps
// MessageGroup meaning one thing.

import type { Message, MessageGroup } from "@/types/message";
import type { RenderItem } from "@/types/manifest";
import { localDayIndex } from "./formatTimestamp";

const SEVEN_MIN = 7 * 60 * 1000;

// Content-bearing types render as message rows and group by author (Q4):
// Default, Reply, and type-20 (bot slash-command responses carry real text).
// Everything else — GuildMemberJoin, type-21, unknown numerics — is a pure
// event rendered as a muted, grouping-breaking system line.
function isContentBearing(type: string): boolean {
  return type === "Default" || type === "Reply" || type === "20";
}

/**
 * Group breaks on: author change, a >7-minute gap, a Reply (always starts its
 * own group), a system line, or a day boundary. A divider is emitted before the
 * first item and at every calendar-day change (viewer local tz).
 */
export function groupMessages(messages: Message[]): RenderItem[] {
  const items: RenderItem[] = [];
  let group: MessageGroup | null = null;
  let prevDay: number | null = null;

  const flush = () => {
    if (group) {
      items.push({ kind: "group", group });
      group = null;
    }
  };

  for (const m of messages) {
    const t = new Date(m.timestamp);
    const day = localDayIndex(t);

    if (day !== prevDay) {
      flush();
      items.push({ kind: "divider", date: m.timestamp });
      prevDay = day;
    }

    if (!isContentBearing(m.type)) {
      flush();
      items.push({ kind: "system", message: m });
      continue;
    }

    const last = group?.messages.at(-1);
    const continues =
      group !== null &&
      last !== undefined &&
      group.author.id === m.author.id &&
      m.type !== "Reply" &&
      t.getTime() - new Date(last.timestamp).getTime() <= SEVEN_MIN;

    if (continues) {
      group!.messages.push(m);
    } else {
      flush();
      group = { author: m.author, messages: [m] };
    }
  }

  flush();
  return items;
}
