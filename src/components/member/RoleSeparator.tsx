import type { Role } from "@/types/member";
import { RoleName } from "./RoleName";

interface RoleSeparatorProps {
  role: Role | null; // null → the default "Members" bucket
  count: number;
}

// The uppercase divider that introduces each member-list section, e.g.
// "🎲 GAME MASTER — 1". Discord renders these headers in muted gray (the role's
// own color tints member names below, not the header). A small left accent dot
// carries the role color so the grouping reads at a glance.
export function RoleSeparator({ role, count }: RoleSeparatorProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 pt-6 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
      {role?.color && (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: role.color }}
          aria-hidden="true"
        />
      )}
      <span className="truncate">
        <RoleName name={role?.name ?? "Members"} />
      </span>
      <span className="text-muted/80">— {count}</span>
    </div>
  );
}
