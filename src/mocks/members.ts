import type { Author } from "@/types/message";
import type { Member, Role } from "@/types/member";

// Hardcoded member-list fixture, fully offline. Collectively exercises:
//   • emoji inside role names (🎲, 🛡️) → emoji-segmented rendering,
//   • hoisted vs non-hoisted roles → who gets their own section,
//   • a member whose name color comes from a *non-hoisted* role (Cassia, below),
//   • a member with no roles → the trailing default "Members" bucket.

export const mockRoles: Role[] = [
  { id: "r_gm", name: "🎲 Game Master", color: "#f47fff", position: 40, hoist: true },
  { id: "r_mod", name: "🛡️ Moderators", color: "#5865f2", position: 30, hoist: true },
  // Non-hoisted but colored: contributes a name color without its own section.
  { id: "r_artist", name: "🎨 Artist", color: "#faa61a", position: 25, hoist: false },
  { id: "r_player", name: "Players", color: "#57f287", position: 10, hoist: true },
];

const aurora: Author = {
  id: "1001",
  name: "aurora",
  nickname: "Aurora",
  color: "#f47fff",
  isBot: false,
  avatarUrl: "Aurora_Files/avatar.png",
};

const bjorn: Author = {
  id: "1002",
  name: "bjorn",
  nickname: null,
  color: null,
  isBot: false,
  avatarUrl: "Bjorn_Files/avatar.png",
};

const cassia: Author = {
  id: "1003",
  name: "cassia",
  nickname: "Cassia",
  color: null,
  isBot: false,
  avatarUrl: "Cassia_Files/avatar.png",
};

const dimitri: Author = {
  id: "1004",
  name: "dimitri",
  nickname: "Dimitri",
  color: null,
  isBot: false,
  avatarUrl: "Dimitri_Files/avatar.png",
};

const elena: Author = {
  id: "1005",
  name: "elena",
  nickname: "Elena",
  color: null,
  isBot: false,
  avatarUrl: "Elena_Files/avatar.png",
};

const ledger: Author = {
  id: "1006",
  name: "Ledger",
  nickname: "Ledger Bot",
  color: null,
  isBot: true,
  avatarUrl: "Ledger_Files/avatar.png",
};

export const mockMembers: Member[] = [
  { author: aurora, roleIds: ["r_gm"] }, // → 🎲 Game Master section, pink
  { author: bjorn, roleIds: ["r_mod"] }, // → 🛡️ Moderators section, blurple
  // Highest hoisted role is Players, but the highest *colored* role is the
  // non-hoisted Artist → grouped under Players, name rendered orange.
  { author: cassia, roleIds: ["r_player", "r_artist"] },
  { author: dimitri, roleIds: ["r_player"] }, // → Players section, green
  { author: elena, roleIds: [] }, // → default "Members" bucket, no color
  { author: ledger, roleIds: [] }, // → default "Members" bucket, no color
];
