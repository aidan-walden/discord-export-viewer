import { test, expect } from "bun:test";
import type { FsDirHandle, FsFileHandle, FsHandle } from "./scanner";
import { scan } from "./scanner";

// --- in-memory FSA fakes -------------------------------------------------
function file(name: string, content: string): FsFileHandle {
  return {
    kind: "file",
    name,
    async getFile() {
      return {
        text: async () => content,
        slice: (s: number, e: number) => ({ text: async () => content.slice(s, e) }),
      };
    },
  };
}

function dir(name: string, children: FsHandle[]): FsDirHandle {
  return {
    kind: "directory",
    name,
    entries() {
      return {
        async *[Symbol.asyncIterator]() {
          for (const c of children) yield [c.name, c] as [string, FsHandle];
        },
      };
    },
  };
}

function exportJson(guild: object, channel: object, messages: unknown[] = []): string {
  return JSON.stringify({ guild, channel, dateRange: { after: null, before: null }, exportedAt: "2026", messages });
}

const guildA = { id: "g1", name: "Guild A", iconUrl: "gA_Files/icon.png" };
const guildB = { id: "g2", name: "Guild B", iconUrl: "gB_Files/icon.png" };
const text = { id: "c1", type: "GuildTextChat", categoryId: "cat1", category: "Text Channels", name: "general", topic: null };
const voice = { id: "c2", type: "GuildVoiceChat", categoryId: "cat2", category: "Voice Channels", name: "General", topic: null };
const thread = { id: "t1", type: "GuildPublicThread", categoryId: "c1", category: "general", name: "a thread", topic: null };

test("an empty directory yields an empty manifest and no warnings", async () => {
  const { manifest, warnings } = await scan(dir("root", []));
  expect(manifest).toEqual({ guilds: [], channels: [] });
  expect(warnings).toEqual([]);
});

test("head-reads guild and channel from a text export", async () => {
  const { manifest } = await scan(dir("root", [file("general.json", exportJson(guildA, text))]));
  expect(manifest.guilds).toEqual([guildA]);
  expect(manifest.channels[0]).toMatchObject({ id: "c1", guildId: "g1", name: "general", isThread: false, isVoice: false });
});

test("skips files inside *_Files/ asset folders", async () => {
  const root = dir("root", [
    file("general.json", exportJson(guildA, text)),
    dir("general.json_Files", [file("sticker.json", exportJson(guildA, voice))]),
  ]);
  const { manifest } = await scan(root);
  expect(manifest.channels.map((c) => c.id)).toEqual(["c1"]); // voice inside _Files ignored
});

test("nests a thread under its parent channel via categoryId", async () => {
  const { manifest } = await scan(
    dir("root", [file("general.json", exportJson(guildA, text)), file("thread.json", exportJson(guildA, thread))]),
  );
  const t = manifest.channels.find((c) => c.id === "t1")!;
  expect(t).toMatchObject({ isThread: true, parentChannelId: "c1" });
});

test("flags voice channels", async () => {
  const { manifest } = await scan(dir("root", [file("voice.json", exportJson(guildA, voice))]));
  expect(manifest.channels[0]).toMatchObject({ id: "c2", isVoice: true });
});

test("skips a malformed file and surfaces a warning", async () => {
  const root = dir("root", [
    file("good.json", exportJson(guildA, text)),
    file("bad.json", "{ this is not json"),
    file("notexport.json", JSON.stringify({ hello: "world" })),
  ]);
  const { manifest, warnings } = await scan(root);
  expect(manifest.channels.map((c) => c.id)).toEqual(["c1"]);
  expect(warnings).toHaveLength(2);
  expect(warnings[0]).toContain("bad.json");
});

test("dedups guilds and spans multiple guilds", async () => {
  const root = dir("root", [
    file("a.json", exportJson(guildA, text)),
    file("a2.json", exportJson(guildA, { ...text, id: "c1b", name: "two" })),
    file("b.json", exportJson(guildB, { ...text, id: "c9", name: "elsewhere" })),
  ]);
  const { manifest } = await scan(root);
  expect(manifest.guilds.map((g) => g.id).sort()).toEqual(["g1", "g2"]);
  expect(manifest.channels).toHaveLength(3);
});

test("an orphan thread (parent absent) still lists with its parentChannelId", async () => {
  const { manifest } = await scan(dir("root", [file("thread.json", exportJson(guildA, thread))]));
  expect(manifest.channels[0]).toMatchObject({ id: "t1", parentChannelId: "c1" });
});

test("recurses into nested non-asset subdirectories", async () => {
  const root = dir("root", [dir("sub", [file("general.json", exportJson(guildA, text))])]);
  const { manifest } = await scan(root);
  expect(manifest.channels.map((c) => c.id)).toEqual(["c1"]);
});

test("returns a file handle per channel for lazy parsing", async () => {
  const { fileHandles } = await scan(dir("root", [file("general.json", exportJson(guildA, text))]));
  expect(fileHandles.get("c1")?.name).toBe("general.json");
});
