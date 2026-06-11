// Pure member-list logic: who goes in which role section, and what color a
// member's name renders in. Mirrors Discord's own rules so the sidebar renderer
// stays a thin, stateless map over this output. All functions are deterministic
// and unit-tested; no DOM, no wall clock.

import type { Member, MemberSection, Role } from "@/types/member";

/** Display name for a member — nickname wins, falling back to the username. */
export function memberDisplayName(member: Member): string {
  return member.author.nickname ?? member.author.name;
}

// Higher position ranks above; equal positions broken by id so ordering is
// stable and independent of input order.
function outranks(a: Role, b: Role): boolean {
  return a.position !== b.position ? a.position > b.position : a.id > b.id;
}

// The member's roles that exist in the map, resolved from ids. Unknown ids are
// silently dropped (graceful-degrade: a stale role reference must never throw).
function rolesOf(member: Member, roleMap: Map<string, Role>): Role[] {
  return member.roleIds
    .map((id) => roleMap.get(id))
    .filter((r): r is Role => r !== undefined);
}

/**
 * A member's name color: the color of their highest-ranked *colored* role,
 * regardless of whether that role is hoisted. Returns null when the member has
 * no colored role (→ default member text color).
 */
export function resolveMemberColor(member: Member, roleMap: Map<string, Role>): string | null {
  let top: Role | null = null;
  for (const role of rolesOf(member, roleMap)) {
    if (role.color === null) continue;
    if (top === null || outranks(role, top)) top = role;
  }
  return top?.color ?? null;
}

// The hoisted role that decides a member's *section*: their highest-ranked role
// with hoist=true. Null → the member falls into the default bucket.
function sectionRole(member: Member, roleMap: Map<string, Role>): Role | null {
  let top: Role | null = null;
  for (const role of rolesOf(member, roleMap)) {
    if (!role.hoist) continue;
    if (top === null || outranks(role, top)) top = role;
  }
  return top;
}

/**
 * Group members into member-list sections, Discord-style:
 *   • each member appears once, under their highest-ranked hoisted role;
 *   • members with no hoisted role fall into a trailing default bucket (role: null);
 *   • sections are ordered by role rank, highest first, default bucket last;
 *   • within a section, members are sorted by display name (case-insensitive);
 *   • empty sections are omitted.
 */
export function groupMembersByRole(members: Member[], roles: Role[]): MemberSection[] {
  const roleMap = new Map(roles.map((r) => [r.id, r]));

  // Bucket members by their section role id (or a sentinel for the default).
  const DEFAULT = "__default__";
  const buckets = new Map<string, Member[]>();
  for (const member of members) {
    const role = sectionRole(member, roleMap);
    const key = role?.id ?? DEFAULT;
    (buckets.get(key) ?? buckets.set(key, []).get(key)!).push(member);
  }

  const sections: MemberSection[] = [];
  for (const [key, bucket] of buckets) {
    if (key === DEFAULT) continue;
    bucket.sort((a, b) =>
      memberDisplayName(a).localeCompare(memberDisplayName(b), undefined, { sensitivity: "base" }),
    );
    sections.push({ role: roleMap.get(key)!, members: bucket });
  }

  // Hoisted sections ranked high→low.
  sections.sort((a, b) => (outranks(a.role!, b.role!) ? -1 : 1));

  // Default bucket always trails.
  const fallback = buckets.get(DEFAULT);
  if (fallback && fallback.length > 0) {
    fallback.sort((a, b) =>
      memberDisplayName(a).localeCompare(memberDisplayName(b), undefined, { sensitivity: "base" }),
    );
    sections.push({ role: null, members: fallback });
  }

  return sections;
}
