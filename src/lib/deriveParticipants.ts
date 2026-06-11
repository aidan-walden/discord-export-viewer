// Derive a member list from the open channel's actual message authors (ADP 0003
// Q6). Exports carry no roster and no `hoist`, so every role is emitted with
// hoist=false → all members fall into the single trailing MEMBERS bucket via the
// existing groupMembersByRole. Real, role-colored participants are honest "real
// data" and keep 0002's components live; hoisted sections wait for a guild-data
// source.

import type { Message } from "@/types/message";
import type { Member, Role } from "@/types/member";

export interface Participants {
  members: Member[];
  roles: Role[];
}

/**
 * Dedup authors by id across a channel's messages. Each member references its
 * roles by id; the distinct role set (hoist forced false) is returned alongside
 * so the sidebar resolves names/colors through the same role-map indirection the
 * real data uses.
 */
export function deriveParticipants(messages: Message[]): Participants {
  const members = new Map<string, Member>();
  const roles = new Map<string, Role>();

  for (const { author } of messages) {
    if (!members.has(author.id)) {
      members.set(author.id, {
        author,
        roleIds: author.roles.map((r) => r.id),
      });
    }
    for (const r of author.roles) {
      if (!roles.has(r.id)) {
        // Export roles are {id,name,color,position}; exports omit hoist.
        roles.set(r.id, { ...r, hoist: false });
      }
    }
  }

  return { members: [...members.values()], roles: [...roles.values()] };
}
