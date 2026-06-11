import type { RenderItem } from "@/types/manifest";
import { MessageRow } from "./MessageRow";
import { SystemLine } from "./SystemLine";
import { DateDivider } from "./DateDivider";

interface MessageListProps {
  items: RenderItem[];
  // Reference time for relative-day header formatting; threaded to every row.
  now?: Date;
}

// The seam where groupMessages() lands: switch on the render item's tag rather
// than re-deriving structure. Within a group, index 0 is the full row; the rest
// are compact follow-ups. MessageRow / SystemLine / DateDivider stay stateless.
export function MessageList({ items, now }: MessageListProps) {
  return (
    <div className="flex flex-col py-4">
      {items.map((item, i) => {
        switch (item.kind) {
          case "group":
            return item.group.messages.map((message, j) => (
              <MessageRow key={message.id} message={message} variant={j === 0 ? "full" : "compact"} now={now} />
            ));
          case "system":
            return <SystemLine key={item.message.id} message={item.message} />;
          case "divider":
            return <DateDivider key={`divider-${i}-${item.date}`} date={item.date} />;
        }
      })}
    </div>
  );
}
