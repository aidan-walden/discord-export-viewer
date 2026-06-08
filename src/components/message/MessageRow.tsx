import type { Message } from "@/types/message";
import { Avatar } from "./Avatar";
import {
  formatMessageTimestamp,
  formatClockTime,
  formatFullTimestamp,
} from "@/lib/formatTimestamp";

interface MessageRowProps {
  message: Message;
  variant: "full" | "compact";
  // Injected reference time for relative-day formatting (defaults to wall clock).
  now?: Date;
}

const displayName = (m: Message) => m.author.nickname ?? m.author.name;

export function MessageRow({ message, variant, now = new Date() }: MessageRowProps) {
  const edited = message.timestampEdited && (
    <span
      className="ml-1 text-[0.625rem] text-muted align-baseline"
      title={formatFullTimestamp(message.timestampEdited)}
    >
      (edited)
    </span>
  );

  const body = (
    <div className="min-w-0 flex-1">
      <span className="whitespace-pre-wrap break-words text-default text-[0.9375rem] leading-[1.375rem]">
        {message.content}
      </span>
      {edited}
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="group flex gap-4 px-4 py-0.5 hover:bg-black/[0.06]">
        <div className="w-10 shrink-0 flex justify-end pt-1">
          <span
            className="hidden group-hover:inline text-[0.625rem] leading-none text-muted"
            title={formatFullTimestamp(message.timestamp)}
          >
            {formatClockTime(message.timestamp)}
          </span>
        </div>
        {body}
      </div>
    );
  }

  return (
    <div className="flex gap-4 px-4 pt-3 pb-0.5 mt-1 hover:bg-black/[0.06]">
      <Avatar avatarUrl={message.author.avatarUrl} alt={displayName(message)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-header font-medium text-[0.9375rem] leading-[1.375rem]"
            style={message.author.color ? { color: message.author.color } : undefined}
          >
            {displayName(message)}
          </span>
          <span
            className="text-xs text-muted"
            title={formatFullTimestamp(message.timestamp)}
          >
            {formatMessageTimestamp(message.timestamp, now)}
          </span>
        </div>
        <div className="flex">{body}</div>
      </div>
    </div>
  );
}
