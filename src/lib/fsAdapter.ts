// The single module that touches File System Access globals (ADP 0003 Q10).
// Everything else takes injected handles, so a Firefox/Safari
// `<input webkitdirectory>` fallback becomes a drop-in behind this same seam.

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

/** Chromium gate: the directory picker is the one browser-specific dependency. */
export function isDirectoryPickerSupported(): boolean {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

/** Prompt the user to pick an export directory (requires a user gesture). */
export function loadDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isDirectoryPickerSupported()) {
    return Promise.reject(new Error("Directory picker unsupported"));
  }
  return window.showDirectoryPicker!({ mode: "read" });
}

/**
 * Resolve an export-relative asset path (e.g. "<export>_Files/avatar.png") to a
 * displayable object URL by walking the directory handle. Small images only
 * this slice; the Service Worker supersedes this in the media slice. Throws if
 * the path can't be walked (caller falls back to a default).
 */
export async function resolveAsset(root: FileSystemDirectoryHandle, relpath: string): Promise<string> {
  const segments = relpath.split("/").filter(Boolean);
  if (segments.length === 0) throw new Error("empty asset path");

  let dir = root;
  for (let i = 0; i < segments.length - 1; i++) {
    dir = await dir.getDirectoryHandle(segments[i]);
  }
  const fileHandle = await dir.getFileHandle(segments[segments.length - 1]);
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
}
