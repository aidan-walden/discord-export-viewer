// Central client-side state (ADP 0003): the picked directory handle, the scanned
// manifest, lazily-parsed + grouped channels, derived participants, and the
// object-URL asset cache. All user data stays in memory; nothing is persisted.

import { create } from "zustand";
import type { Manifest } from "@/types/manifest";
import type { RenderItem } from "@/types/manifest";
import { loadDirectory, resolveAsset as resolveAssetFs } from "@/lib/fsAdapter";
import { scan, type FsDirHandle, type FsFileHandle } from "@/lib/scanner";
import { parseChannel } from "@/lib/parseChannel";
import { groupMessages } from "@/lib/groupMessages";
import { deriveParticipants, type Participants } from "@/lib/deriveParticipants";
import { humanizeMentions } from "@/lib/humanizeMentions";

// In-flight asset resolutions, deduped by relpath. Kept outside reactive state.
const assetPending = new Map<string, Promise<string>>();

interface StoreState {
  handle: FileSystemDirectoryHandle | null;
  manifest: Manifest | null;
  warnings: string[];
  openGuildId: string | null;
  openChannelId: string | null;
  loading: boolean;
  error: string | null;
  // Bumped whenever an async cache fill completes, to re-render consumers.
  cacheVersion: number;

  // Caches — mutated in place; reads gated by openChannelId / cacheVersion.
  fileHandles: Map<string, FsFileHandle>;
  channelNames: Map<string, string>;
  channelCache: Map<string, RenderItem[]>;
  participantCache: Map<string, Participants>;
  assetUrls: Map<string, string>;

  pickDirectory: () => Promise<void>;
  openChannel: (channelId: string) => Promise<void>;
  resolveAsset: (relpath: string) => Promise<string>;
  reset: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  handle: null,
  manifest: null,
  warnings: [],
  openGuildId: null,
  openChannelId: null,
  loading: false,
  error: null,
  cacheVersion: 0,
  fileHandles: new Map(),
  channelNames: new Map(),
  channelCache: new Map(),
  participantCache: new Map(),
  assetUrls: new Map(),

  async pickDirectory() {
    set({ loading: true, error: null });
    let handle: FileSystemDirectoryHandle;
    try {
      handle = await loadDirectory();
    } catch (e) {
      // The user dismissing the picker is not an error.
      const aborted = e instanceof DOMException && e.name === "AbortError";
      set({ loading: false, error: aborted ? null : "Could not open that directory." });
      return;
    }

    get().reset();
    try {
      const { manifest, warnings, fileHandles } = await scan(handle as unknown as FsDirHandle);
      set({
        handle,
        manifest,
        warnings,
        fileHandles,
        channelNames: new Map(manifest.channels.map((c) => [c.id, c.name])),
        channelCache: new Map(),
        participantCache: new Map(),
        assetUrls: new Map(),
        openGuildId: manifest.guilds[0]?.id ?? null,
        openChannelId: null,
        loading: false,
      });
    } catch {
      set({ loading: false, error: "Failed to scan that directory." });
    }
  },

  async openChannel(channelId) {
    const { manifest, channelCache, participantCache, fileHandles, channelNames } = get();
    const channel = manifest?.channels.find((c) => c.id === channelId);
    set({ openChannelId: channelId, openGuildId: channel?.guildId ?? get().openGuildId });

    if (channelCache.has(channelId)) return; // already parsed + grouped
    const fh = fileHandles.get(channelId);
    if (!fh) return;

    const messages = (await parseChannel(await fh.getFile())).map((m) => ({
      ...m,
      content: humanizeMentions(m.content, m.mentions, channelNames),
    }));

    channelCache.set(channelId, groupMessages(messages));
    participantCache.set(channelId, deriveParticipants(messages));
    set({ cacheVersion: get().cacheVersion + 1 });
  },

  async resolveAsset(relpath) {
    const { handle, assetUrls } = get();
    if (!handle || !relpath) return "";
    const cached = assetUrls.get(relpath);
    if (cached !== undefined) return cached;
    const inflight = assetPending.get(relpath);
    if (inflight) return inflight;

    const p = resolveAssetFs(handle, relpath)
      .then((url) => {
        assetUrls.set(relpath, url);
        assetPending.delete(relpath);
        return url;
      })
      .catch(() => {
        assetPending.delete(relpath);
        return "";
      });
    assetPending.set(relpath, p);
    return p;
  },

  reset() {
    for (const url of get().assetUrls.values()) {
      if (url) URL.revokeObjectURL(url);
    }
    assetPending.clear();
    set({
      assetUrls: new Map(),
      channelCache: new Map(),
      participantCache: new Map(),
    });
  },
}));
