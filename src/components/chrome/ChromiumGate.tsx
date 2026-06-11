// The one browser-specific gate (ADP 0003 Q10): the directory picker needs the
// File System Access API, which today is Chromium-only. Non-Chromium visitors
// get a friendly splash instead of a broken picker. A `<input webkitdirectory>`
// fallback can later slot in behind the same adapter seam.

import type { ReactNode } from "react";
import { isDirectoryPickerSupported } from "@/lib/fsAdapter";

export function ChromiumGate({ children }: { children: ReactNode }) {
  if (isDirectoryPickerSupported()) return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-chat px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-header">A Chromium browser is required</h1>
        <p className="mt-3 text-sm text-muted">
          This viewer reads your export folder directly on your device using the File System Access
          API, which is currently only available in Chromium-based browsers (Chrome, Edge, Brave,
          Arc). Please reopen this page in one of those to continue. Your data never leaves your
          machine.
        </p>
      </div>
    </div>
  );
}
