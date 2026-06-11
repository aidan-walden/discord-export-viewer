import { test, expect } from "bun:test";
import type { Author, Message } from "@/types/message";
import type { Role } from "@/types/member";
import { resolveMemberColor } from "./memberList";
import { deriveParticipants } from "./deriveParticipants";

// Export-shaped role: no hoist (deriveParticipants forces hoist=false).
function role(id: string, color: string | null, position: number): Role {
  return { id, name: `role-${id}`, color, position, hoist: false };
}

function author(id: string, name: string, roles: Role[] = []): Author {
  return {
    id,
    name,
    discriminator: "0000",
    nickname: null,
    color: null,
    isBot: false,
    roles,
    avatarUrl: "",
  };
}

function msg(id: string, author: Author): Message {
  return {
    id,
    type: "Default",
    timestamp: "2024-01-01T00:00:00.000+00:00",
    timestampEdited: null,
    callEndedTimestamp: null,
    isPinned: false,
    content: "",
    author,
    attachments: [],
    embeds: [],
    stickers: [],
    reactions: [],
    mentions: [],
    inlineEmojis: [],
  };
}

test("dedups authors by id", () => {
  const a = author("1", "aurora");
  const { members } = deriveParticipants([msg("m1", a), msg("m2", a), msg("m3", author("2", "bjorn"))]);
  expect(members.map((m) => m.author.id).sort()).toEqual(["1", "2"]);
});

test("collects distinct roles with hoist forced false", () => {
  const r = role("r1", "#ff0000", 10);
  const { roles } = deriveParticipants([msg("m1", author("1", "aurora", [r]))]);
  expect(roles).toHaveLength(1);
  expect(roles[0]).toMatchObject({ id: "r1", hoist: false });
});

test("name color resolves to the highest colored role", () => {
  const low = role("low", "#111111", 1);
  const high = role("high", "#222222", 50);
  const { members, roles } = deriveParticipants([msg("m1", author("1", "aurora", [low, high]))]);
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  expect(resolveMemberColor(members[0], roleMap)).toBe("#222222");
});

test("a role-less author yields no roles and an empty roleIds", () => {
  const { members, roles } = deriveParticipants([msg("m1", author("1", "aurora"))]);
  expect(roles).toEqual([]);
  expect(members[0].roleIds).toEqual([]);
});

test("empty channel yields empty members and roles", () => {
  expect(deriveParticipants([])).toEqual({ members: [], roles: [] });
});
