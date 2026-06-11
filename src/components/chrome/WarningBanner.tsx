// Surfaces scanner warnings for files that were skipped (unreadable or not a
// channel export) without blocking the rest of the load. Dismissible.

import { useState } from "react";

export function WarningBanner({ warnings }: { warnings: string[] }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || warnings.length === 0) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-semibold">
            {warnings.length} file{warnings.length === 1 ? "" : "s"} skipped.
          </span>{" "}
          <span className="text-amber-200/80">{warnings.slice(0, 3).join(" ")}</span>
          {warnings.length > 3 && <span className="text-amber-200/60"> …and {warnings.length - 3} more.</span>}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded px-1.5 text-amber-200/70 hover:text-amber-100"
          aria-label="Dismiss warnings"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
