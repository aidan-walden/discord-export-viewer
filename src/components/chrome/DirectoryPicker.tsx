// The landing screen before a directory is chosen. A single user gesture opens
// the picker (FSA requires a gesture, and also requires a re-pick after refresh
// since handles can't be persisted).

import { useStore } from "@/store/store";

export function DirectoryPicker() {
  const pickDirectory = useStore((s) => s.pickDirectory);
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-chat px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-header">Discord Export Viewer</h1>
        <p className="mt-3 text-sm text-muted">
          Open a folder of DiscordChatExporter JSON exports to browse them as a real Discord client.
          Everything stays on your device — nothing is uploaded.
        </p>
        <button
          type="button"
          onClick={() => pickDirectory()}
          disabled={loading}
          className="mt-6 rounded-md bg-blurple px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Scanning…" : "Open export folder"}
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
