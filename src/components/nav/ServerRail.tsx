// Far-left guild column: one icon per guild.id. Selecting a guild routes to its
// first text channel (the sidebar + chat follow from the hash).

import type { GuildMeta } from "@/types/manifest";
import { useStore } from "@/store/store";
import { useResolvedAsset } from "@/store/useResolvedAsset";
import { navigate } from "@/store/router";

function GuildIcon({ guild, active, onClick }: { guild: GuildMeta; active: boolean; onClick: () => void }) {
  const url = useResolvedAsset(guild.iconUrl);
  const initials = guild.name.replace(/[^A-Za-z0-9]+/g, " ").trim().split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <button
      type="button"
      onClick={onClick}
      title={guild.name}
      aria-label={guild.name}
      aria-current={active}
      className={`relative flex size-12 items-center justify-center overflow-hidden bg-chat text-sm font-semibold text-header transition-all hover:rounded-2xl ${
        active ? "rounded-2xl" : "rounded-3xl"
      }`}
    >
      <span
        className={`absolute left-0 w-1 rounded-r bg-white transition-all ${active ? "h-8" : "h-0 group-hover:h-5"}`}
      />
      {url ? <img src={url} alt="" className="size-full object-cover" draggable={false} /> : initials || "?"}
    </button>
  );
}

export function ServerRail() {
  const manifest = useStore((s) => s.manifest);
  const openGuildId = useStore((s) => s.openGuildId);
  if (!manifest) return null;

  function selectGuild(guildId: string) {
    const first = manifest!.channels.find((c) => c.guildId === guildId && !c.isThread && !c.isVoice);
    if (first) navigate(guildId, first.id);
  }

  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-rail py-3" aria-label="Servers">
      {manifest.guilds.map((guild) => (
        <GuildIcon
          key={guild.id}
          guild={guild}
          active={guild.id === openGuildId}
          onClick={() => selectGuild(guild.id)}
        />
      ))}
    </nav>
  );
}
