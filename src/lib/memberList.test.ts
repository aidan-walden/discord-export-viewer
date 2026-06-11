import { test, expect, describe } from "bun:test";
import {
  groupMembersByRole,
  resolveMemberColor,
  memberDisplayName,
} from "./memberList";
import type { Author } from "@/types/message";
import type { Member, Role } from "@/types/member";

// Minimal author factory — only the fields the member list reads.
const author = (id: string, name: string, nickname: string | null = null): Author => ({
  id,
  name,
  nickname,
  color: null,
  isBot: false,
  avatarUrl: "",
});

const member = (id: string, name: string, roleIds: string[], nickname: string | null = null): Member => ({
  author: author(id, name, nickname),
  roleIds,
});

const gm: Role = { id: "r_gm", name: "🎲 Game Master", color: "#f47fff", position: 40, hoist: true };
const mod: Role = { id: "r_mod", name: "🛡️ Moderators", color: "#5865f2", position: 30, hoist: true };
const artist: Role = { id: "r_artist", name: "🎨 Artist", color: "#faa61a", position: 25, hoist: false };
const player: Role = { id: "r_player", name: "Players", color: "#57f287", position: 10, hoist: true };
const roles = [gm, mod, artist, player];
const roleMap = new Map(roles.map((r) => [r.id, r]));

describe("memberDisplayName", () => {
  test("prefers nickname over username", () => {
    expect(memberDisplayName(member("1", "aurora", [], "Aurora"))).toBe("Aurora");
  });
  test("falls back to username when no nickname", () => {
    expect(memberDisplayName(member("1", "bjorn", []))).toBe("bjorn");
  });
});

describe("resolveMemberColor", () => {
  test("uses the highest-ranked colored role", () => {
    expect(resolveMemberColor(member("1", "a", ["r_player", "r_gm"]), roleMap)).toBe("#f47fff");
  });

  test("a non-hoisted role still contributes its color when it ranks highest", () => {
    // Artist (pos 25, not hoisted) outranks Players (pos 10) for color purposes.
    expect(resolveMemberColor(member("1", "cassia", ["r_player", "r_artist"]), roleMap)).toBe("#faa61a");
  });

  test("null when the member has no colored role", () => {
    const colorless: Role = { id: "r_x", name: "x", color: null, position: 5, hoist: true };
    const map = new Map([[colorless.id, colorless]]);
    expect(resolveMemberColor(member("1", "a", ["r_x"]), map)).toBeNull();
  });

  test("null when the member has no roles", () => {
    expect(resolveMemberColor(member("1", "a", []), roleMap)).toBeNull();
  });

  test("unknown role ids are ignored, not thrown", () => {
    expect(resolveMemberColor(member("1", "a", ["nope", "r_mod"]), roleMap)).toBe("#5865f2");
  });
});

describe("groupMembersByRole", () => {
  test("places each member under their highest-ranked hoisted role", () => {
    const sections = groupMembersByRole(
      [
        member("1", "Aurora", ["r_gm"]),
        member("2", "Bjorn", ["r_mod"]),
        member("3", "Cassia", ["r_player", "r_artist"]), // artist not hoisted → Players
      ],
      roles,
    );
    expect(sections.map((s) => s.role?.id)).toEqual(["r_gm", "r_mod", "r_player"]);
    expect(sections[2]!.members[0]!.author.id).toBe("3");
  });

  test("orders sections by role rank, highest first", () => {
    const sections = groupMembersByRole(
      [member("1", "P", ["r_player"]), member("2", "G", ["r_gm"]), member("3", "M", ["r_mod"])],
      roles,
    );
    expect(sections.map((s) => s.role?.position)).toEqual([40, 30, 10]);
  });

  test("members with no hoisted role land in a trailing default bucket", () => {
    const sections = groupMembersByRole(
      [member("1", "Elena", []), member("2", "Aurora", ["r_gm"]), member("3", "Artsy", ["r_artist"])],
      roles,
    );
    const last = sections[sections.length - 1]!;
    expect(last.role).toBeNull();
    // Both the role-less member and the only-non-hoisted-role member fall here.
    expect(last.members.map((m) => m.author.id).sort()).toEqual(["1", "3"]);
  });

  test("sorts members within a section by display name, case-insensitively", () => {
    const sections = groupMembersByRole(
      [
        member("1", "zara", ["r_player"], "zara"),
        member("2", "Anton", ["r_player"], "Anton"),
        member("3", "bea", ["r_player"], "bea"),
      ],
      roles,
    );
    expect(sections[0]!.members.map((m) => memberDisplayName(m))).toEqual(["Anton", "bea", "zara"]);
  });

  test("omits sections that end up empty", () => {
    const sections = groupMembersByRole([member("1", "G", ["r_gm"])], roles);
    expect(sections).toHaveLength(1);
    expect(sections[0]!.role?.id).toBe("r_gm");
  });

  test("no default bucket when every member is hoisted", () => {
    const sections = groupMembersByRole([member("1", "G", ["r_gm"])], roles);
    expect(sections.some((s) => s.role === null)).toBe(false);
  });

  test("empty input → no sections", () => {
    expect(groupMembersByRole([], roles)).toEqual([]);
  });
});
