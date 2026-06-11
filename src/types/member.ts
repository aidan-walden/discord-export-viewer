// Member-list domain types. A faithful subset of Discord's role/member model.
//
// `Role` mirrors the role objects that ride along on `author.roles[]` in a
// DiscordChatExporter export ({ id, name, color, position }) plus `hoist` — the
// flag that decides whether a role gets its own section in the member sidebar.
// The message export trims `hoist`, but the live API carries it and the member
// list cannot be grouped without it, so it is modeled here (see ADP 0002).

import type { Author } from "./message";

export interface Role {
  id: string;
  name: string; // may contain unicode emoji, e.g. "🎲 Game Master"
  color: string | null; // hex, e.g. "#5865f2"; null → no color contribution
  position: number; // higher = ranks above; ties broken by id for stability
  hoist: boolean; // true → displayed as its own member-list section
}

// A guild member. Reuses the existing `Author` shape (members *are* authors) and
// references roles by id — the same indirection the real data uses, so the
// renderer resolves names/colors through a role map rather than duplicating them.
export interface Member {
  author: Author;
  roleIds: string[];
}

// Grouping output: a hoisted-role section (or the trailing default bucket) with
// its members already sorted. What groupMembersByRole() returns.
export interface MemberSection {
  role: Role | null; // null → the default "Members" bucket (no hoisted role)
  members: Member[]; // sorted by display name, case-insensitive
}
