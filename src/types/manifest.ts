// Navigation + render-item shapes. The scanner produces a Manifest from a
// bounded head-read (never touching messages[]); groupMessages produces
// RenderItem[] from a lazily-parsed channel.

import type { Message, MessageGroup } from "./message";

export interface GuildMeta {
  id: string;
  name: string;
  iconUrl: string; // export-relative; resolved via resolveAsset()
}

export interface ChannelMeta {
  id: string;
  guildId: string;
  type: string; // GuildTextChat | GuildVoiceChat | GuildPublicThread | …
  categoryId: string;
  category: string;
  name: string;
  isThread: boolean;
  parentChannelId: string | null; // a thread's categoryId is its parent CHANNEL id
  isVoice: boolean; // listed non-clickable in the sidebar
  file: string; // export filename to lazy-parse
}

export interface Manifest {
  guilds: GuildMeta[];
  channels: ChannelMeta[];
}

export type RenderItem =
  | { kind: "group"; group: MessageGroup }
  | { kind: "system"; message: Message }
  | { kind: "divider"; date: string };
