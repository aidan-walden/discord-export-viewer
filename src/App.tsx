import { useEffect } from "react";
import type { ChannelMeta } from "@/types/manifest";
import { useStore } from "@/store/store";
import { parseHash, navigate, onRouteChange } from "@/store/router";
import { ChromiumGate } from "@/components/chrome/ChromiumGate";
import { DirectoryPicker } from "@/components/chrome/DirectoryPicker";
import { EmptyState } from "@/components/chrome/EmptyState";
import { WarningBanner } from "@/components/chrome/WarningBanner";
import { ServerRail } from "@/components/nav/ServerRail";
import { ChannelSidebar } from "@/components/nav/ChannelSidebar";
import { ChannelHeader } from "@/components/nav/ChannelHeader";
import { MessageScroller } from "@/components/message/MessageScroller";
import { MemberList } from "@/components/member/MemberList";
import "./index.css";

// First non-thread, non-voice channel — the landing/auto-open target (Q8).
function firstTextChannel(channels: ChannelMeta[]): ChannelMeta | undefined {
  return channels.find((c) => !c.isThread && !c.isVoice);
}

function Viewer() {
  const manifest = useStore((s) => s.manifest);
  const warnings = useStore((s) => s.warnings);
  const openChannelId = useStore((s) => s.openChannelId);
  const openChannel = useStore((s) => s.openChannel);
  const channelCache = useStore((s) => s.channelCache);
  const participantCache = useStore((s) => s.participantCache);
  // Subscribe to cache fills so the chat/member panes re-render when a lazily
  // opened channel finishes parsing.
  useStore((s) => s.cacheVersion);

  // Apply the hash route whenever the manifest changes or the hash changes. On a
  // fresh pick with no/stale hash, auto-open the first text channel (Q8).
  useEffect(() => {
    if (!manifest) return;
    const apply = () => {
      const route = parseHash();
      const exists = route && manifest.channels.some((c) => c.id === route.channelId);
      if (route && exists) {
        openChannel(route.channelId);
      } else {
        const first = firstTextChannel(manifest.channels);
        if (first) navigate(first.guildId, first.id);
      }
    };
    apply();
    return onRouteChange(apply);
  }, [manifest, openChannel]);

  if (!manifest) return <DirectoryPicker />;
  if (manifest.channels.length === 0) return <EmptyState />;

  const channel = manifest.channels.find((c) => c.id === openChannelId) ?? null;
  const items = openChannelId ? channelCache.get(openChannelId) : undefined;
  const participants = openChannelId ? participantCache.get(openChannelId) : undefined;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-chat">
      <ServerRail />
      <ChannelSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader channel={channel} />
        <WarningBanner warnings={warnings} />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1">
            {items ? (
              <MessageScroller items={items} key={openChannelId} />
            ) : (
              <div className="p-6 text-sm text-muted">Loading channel…</div>
            )}
          </main>
          {participants && <MemberList members={participants.members} roles={participants.roles} />}
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ChromiumGate>
      <Viewer />
    </ChromiumGate>
  );
}

export default App;
