// Scan a chosen directory handle into a navigable Manifest without ever holding
// all messages (ADP 0003 Q2). A file is a channel export only if it is NOT under
// a `*_Files/` asset folder and its bounded ~16 KB head — cut at the "messages"
// key — parses to a guild + channel. guild@4 / channel@195 always precede
// messages@503, so the head-read is clean and exact, and the scanner scales to
// multi-GB exports. Malformed files are skipped with a surfaced warning.

import type { ChannelMeta, GuildMeta, Manifest } from "@/types/manifest";

// Structural subset of the File System Access API so tests can pass small
// in-memory fakes. The real FileSystemDirectoryHandle / FileSystemFileHandle /
// File satisfy these shapes.
interface BlobLike {
  text(): Promise<string>;
}
export interface FsFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<{ slice(start: number, end: number): BlobLike } & BlobLike>;
}
export interface FsDirHandle {
  kind: "directory";
  name: string;
  entries(): AsyncIterable<[string, FsHandle]>;
}
export type FsHandle = FsFileHandle | FsDirHandle;

const HEAD_BYTES = 16 * 1024;

export interface ScanResult {
  manifest: Manifest;
  warnings: string[];
  // Channel id → file handle, kept in memory so openChannel parses without
  // re-walking the tree. Not part of the serializable manifest.
  fileHandles: Map<string, FsFileHandle>;
}

interface HeadMeta {
  guild: GuildMeta;
  channel: {
    id: string;
    type: string;
    categoryId: string;
    category: string;
    name: string;
  };
}

// Parse the bounded head into guild/channel by truncating just before the
// "messages" array and closing the object. Returns null if the fragment is not a
// channel export (missing guild/channel, or unparseable).
function readHead(head: string): HeadMeta | null {
  const idx = head.indexOf('"messages"');
  const fragment = idx === -1 ? head : head.slice(0, idx).replace(/\s*,\s*$/, "") + "}";
  try {
    const obj = JSON.parse(fragment);
    if (obj && obj.guild && obj.channel && obj.guild.id && obj.channel.id) {
      return { guild: obj.guild as GuildMeta, channel: obj.channel };
    }
  } catch {
    /* fall through to null */
  }
  return null;
}

const isThreadType = (t: string) => /thread/i.test(t);
const isVoiceType = (t: string) => /voice|stage/i.test(t);

export async function scan(root: FsDirHandle): Promise<ScanResult> {
  const guilds = new Map<string, GuildMeta>();
  const channels: ChannelMeta[] = [];
  const fileHandles = new Map<string, FsFileHandle>();
  const warnings: string[] = [];

  async function walk(dir: FsDirHandle): Promise<void> {
    for await (const [, handle] of dir.entries()) {
      if (handle.kind === "directory") {
        // Asset folders sit beside their export and hold no channel exports.
        if (handle.name.endsWith("_Files")) continue;
        await walk(handle);
        continue;
      }
      if (!handle.name.endsWith(".json")) continue;

      let meta: HeadMeta | null = null;
      try {
        const file = await handle.getFile();
        const head = await file.slice(0, HEAD_BYTES).text();
        meta = readHead(head);
      } catch {
        meta = null;
      }

      if (!meta) {
        warnings.push(`Skipped "${handle.name}": not a readable channel export.`);
        continue;
      }

      const { guild, channel } = meta;
      if (!guilds.has(guild.id)) guilds.set(guild.id, guild);

      const thread = isThreadType(channel.type);
      channels.push({
        id: channel.id,
        guildId: guild.id,
        type: channel.type,
        categoryId: channel.categoryId,
        category: channel.category,
        name: channel.name,
        isThread: thread,
        parentChannelId: thread ? channel.categoryId : null,
        isVoice: isVoiceType(channel.type),
        file: handle.name,
      });
      fileHandles.set(channel.id, handle);
    }
  }

  await walk(root);

  return { manifest: { guilds: [...guilds.values()], channels }, warnings, fileHandles };
}
