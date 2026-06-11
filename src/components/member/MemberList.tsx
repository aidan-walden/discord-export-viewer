import { useMemo } from "react";
import type { Member, Role } from "@/types/member";
import { groupMembersByRole, resolveMemberColor } from "@/lib/memberList";
import { RoleSeparator } from "./RoleSeparator";
import { MemberRow } from "./MemberRow";

interface MemberListProps {
  members: Member[];
  roles: Role[];
}

// The right-hand member sidebar. Owns no layout decisions of its own — it maps
// the role-grouped sections from groupMembersByRole() (the testable seam) into
// a separator + member rows, tinting each name via resolveMemberColor().
export function MemberList({ members, roles }: MemberListProps) {
  const sections = useMemo(() => groupMembersByRole(members, roles), [members, roles]);
  const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);

  return (
    <aside className="w-60 shrink-0 overflow-y-auto bg-sidebar pb-4" aria-label="Members">
      {sections.map((section) => (
        <div key={section.role?.id ?? "__default"}>
          <RoleSeparator role={section.role} count={section.members.length} />
          {section.members.map((member) => (
            <MemberRow
              key={member.author.id}
              member={member}
              color={resolveMemberColor(member, roleMap)}
            />
          ))}
        </div>
      ))}
    </aside>
  );
}
