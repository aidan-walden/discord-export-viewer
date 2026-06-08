import type { MessageGroup } from "@/types/message";
import { MessageRow } from "./MessageRow";

interface MessageListProps {
  groups: MessageGroup[];
  // Reference time for relative-day header formatting; threaded to every row.
  now?: Date;
}

// Owns the full-vs-compact decision — the seam where groupMessages() lands
// later. Within a group, index 0 is the full row; the rest are compact
// follow-ups. MessageRow itself stays variant-driven and stateless.
export function MessageList({ groups, now }: MessageListProps) {
  return (
    <div className="flex flex-col py-4">
      {groups.map((group) =>
        group.messages.map((message, i) => (
          <MessageRow
            key={message.id}
            message={message}
            variant={i === 0 ? "full" : "compact"}
            now={now}
          />
        )),
      )}
    </div>
  );
}
