// Slim top bar above the message list naming the open channel.

import type { ChannelMeta } from "@/types/manifest";

export function ChannelHeader({ channel }: { channel: ChannelMeta | null }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/20 bg-chat px-4">
      <span aria-hidden className="text-xl leading-none text-channel/70">
        {channel?.isThread ? "↳" : channel?.isVoice ? "🔊" : "#"}
      </span>
      <span className="font-semibold text-header">{channel?.name ?? "—"}</span>
    </header>
  );
}
