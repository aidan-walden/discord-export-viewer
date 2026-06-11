import type { Member } from "@/types/member";
import { memberDisplayName } from "@/lib/memberList";
import { Avatar } from "@/components/message/Avatar";

interface MemberRowProps {
  member: Member;
  // Resolved name color (highest-ranked colored role), or null for the default.
  color: string | null;
}

// One member entry in the sidebar: small avatar + display name tinted by the
// member's top role color. Bots get a small tag, mirroring Discord.
export function MemberRow({ member, color }: MemberRowProps) {
  const name = memberDisplayName(member);
  return (
    <div className="group mx-2 flex items-center gap-3 rounded px-2 py-1 hover:bg-black/[0.06]">
      <Avatar avatarUrl={member.author.avatarUrl} alt={name} size="sm" />
      <span
        className="truncate text-[0.9375rem] font-medium leading-5 text-header"
        style={color ? { color } : undefined}
      >
        {name}
      </span>
      {member.author.isBot && (
        <span className="rounded bg-blurple px-1 py-px text-[0.625rem] font-semibold uppercase leading-none text-white">
          Bot
        </span>
      )}
    </div>
  );
}
