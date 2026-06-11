// Left column for the open guild: categories → channels → nested threads.
// Threads nest under their parent channel via parentChannelId (a thread's
// categoryId is its parent channel id). Voice channels are listed but
// non-clickable (no messages to show this slice).

import { useMemo } from "react";
import type { ChannelMeta } from "@/types/manifest";
import { useStore } from "@/store/store";
import { navigate } from "@/store/router";

interface Category {
  id: string;
  name: string;
  channels: ChannelMeta[];
}

function buildTree(channels: ChannelMeta[]) {
  const threadsByParent = new Map<string, ChannelMeta[]>();
  for (const c of channels) {
    if (c.isThread && c.parentChannelId) {
      (threadsByParent.get(c.parentChannelId) ?? threadsByParent.set(c.parentChannelId, []).get(c.parentChannelId)!).push(c);
    }
  }

  const categories: Category[] = [];
  const index = new Map<string, number>();
  for (const c of channels) {
    if (c.isThread) continue; // threads nest under their parent, not a category
    let i = index.get(c.categoryId);
    if (i === undefined) {
      i = categories.length;
      index.set(c.categoryId, i);
      categories.push({ id: c.categoryId, name: c.category || "Channels", channels: [] });
    }
    categories[i].channels.push(c);
  }
  return { categories, threadsByParent };
}

function ChannelRow({ channel, active, onClick }: { channel: ChannelMeta; active: boolean; onClick: () => void }) {
  if (channel.isVoice) {
    return (
      <div className="flex cursor-default items-center gap-1.5 rounded px-2 py-1 text-channel/70" title="Voice channels aren’t viewable">
        <span aria-hidden>🔊</span>
        <span className="truncate text-[0.95rem]">{channel.name}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left transition ${
        active ? "bg-channel-active text-header" : "text-channel hover:bg-white/[0.04] hover:text-default"
      }`}
    >
      <span aria-hidden className="text-lg leading-none text-channel/70">#</span>
      <span className="truncate text-[0.95rem]">{channel.name}</span>
    </button>
  );
}

export function ChannelSidebar() {
  const manifest = useStore((s) => s.manifest);
  const openGuildId = useStore((s) => s.openGuildId);
  const openChannelId = useStore((s) => s.openChannelId);

  const { categories, threadsByParent } = useMemo(() => {
    const channels = manifest?.channels.filter((c) => c.guildId === openGuildId) ?? [];
    return buildTree(channels);
  }, [manifest, openGuildId]);

  if (!manifest) return null;

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-4 overflow-y-auto bg-sidebar px-2 py-3" aria-label="Channels">
      {categories.map((cat) => (
        <div key={cat.id}>
          <h2 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-channel/80">{cat.name}</h2>
          <div className="flex flex-col gap-0.5">
            {cat.channels.map((channel) => {
              const threads = threadsByParent.get(channel.id) ?? [];
              return (
                <div key={channel.id}>
                  <ChannelRow
                    channel={channel}
                    active={channel.id === openChannelId}
                    onClick={() => navigate(channel.guildId, channel.id)}
                  />
                  {threads.length > 0 && (
                    <div className="ml-5 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                      {threads.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => navigate(t.guildId, t.id)}
                          aria-current={t.id === openChannelId}
                          className={`flex w-full items-center gap-1 rounded px-2 py-0.5 text-left text-sm transition ${
                            t.id === openChannelId ? "bg-channel-active text-header" : "text-channel hover:text-default"
                          }`}
                        >
                          <span aria-hidden className="text-channel/60">↳</span>
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
