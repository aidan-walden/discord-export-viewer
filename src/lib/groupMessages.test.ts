import { test, expect } from "bun:test";
import type { Author, Message, MessageType } from "@/types/message";
import { groupMessages } from "./groupMessages";

// Local-time ISO strings (no offset) keep day boundaries deterministic across
// the test machine's timezone. June 2024 has no DST transition.
function ts(day: number, hour = 12, min = 0): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `2024-06-${p(day)}T${p(hour)}:${p(min)}:00`;
}

const a1: Author = mkAuthor("1", "aurora");
const a2: Author = mkAuthor("2", "bjorn");

function mkAuthor(id: string, name: string): Author {
  return { id, name, discriminator: "0", nickname: null, color: null, isBot: false, roles: [], avatarUrl: "" };
}

function msg(id: string, author: Author, timestamp: string, type: MessageType = "Default"): Message {
  return {
    id,
    type,
    timestamp,
    timestampEdited: null,
    callEndedTimestamp: null,
    isPinned: false,
    content: id,
    author,
    attachments: [],
    embeds: [],
    stickers: [],
    reactions: [],
    mentions: [],
    inlineEmojis: [],
  };
}

test("empty input yields no items", () => {
  expect(groupMessages([])).toEqual([]);
});

test("same author within 7 minutes forms one group after a leading divider", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a1, ts(1, 12, 3))]);
  expect(items.map((i) => i.kind)).toEqual(["divider", "group"]);
  expect(items[1]).toMatchObject({ kind: "group" });
  if (items[1].kind === "group") expect(items[1].group.messages.map((m) => m.id)).toEqual(["m1", "m2"]);
});

test("a gap of exactly 7 minutes still groups", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a1, ts(1, 12, 7))]);
  const groups = items.filter((i) => i.kind === "group");
  expect(groups).toHaveLength(1);
});

test("a gap over 7 minutes breaks into two groups", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a1, ts(1, 12, 8))]);
  expect(items.filter((i) => i.kind === "group")).toHaveLength(2);
});

test("an author change breaks the group", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a2, ts(1, 12, 1))]);
  expect(items.filter((i) => i.kind === "group")).toHaveLength(2);
});

test("a Reply always starts its own group", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a1, ts(1, 12, 1), "Reply")]);
  const groups = items.filter((i) => i.kind === "group");
  expect(groups).toHaveLength(2);
});

test("a system event is a standalone item that breaks grouping", () => {
  const items = groupMessages([
    msg("m1", a1, ts(1, 12, 0)),
    msg("m2", a1, ts(1, 12, 1), "GuildMemberJoin"),
    msg("m3", a1, ts(1, 12, 2)),
  ]);
  expect(items.map((i) => i.kind)).toEqual(["divider", "group", "system", "group"]);
});

test("type-20 is content-bearing; type-21 is a system line", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0), "20"), msg("m2", a1, ts(1, 12, 1), "21")]);
  expect(items.map((i) => i.kind)).toEqual(["divider", "group", "system"]);
});

test("a day boundary inserts a divider and breaks the group", () => {
  const items = groupMessages([msg("m1", a1, ts(1, 12, 0)), msg("m2", a1, ts(2, 12, 0))]);
  expect(items.map((i) => i.kind)).toEqual(["divider", "group", "divider", "group"]);
});
