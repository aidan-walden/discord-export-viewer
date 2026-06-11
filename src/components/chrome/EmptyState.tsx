// Friendly state when a directory was scanned but held no valid channel exports.

import { useStore } from "@/store/store";

export function EmptyState() {
  const pickDirectory = useStore((s) => s.pickDirectory);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-chat px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-header">No exports found</h1>
        <p className="mt-3 text-sm text-muted">
          That folder didn&apos;t contain any DiscordChatExporter JSON exports. Pick a folder that
          holds the exported <code className="text-default">.json</code> files (and their{" "}
          <code className="text-default">_Files</code> asset folders).
        </p>
        <button
          type="button"
          onClick={() => pickDirectory()}
          className="mt-6 rounded-md bg-blurple px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Choose another folder
        </button>
      </div>
    </div>
  );
}
