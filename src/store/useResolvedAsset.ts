// Resolve an export-relative asset path to an object URL for rendering. Returns
// null while loading or on failure so callers can show a fallback. The store
// caches and dedupes the underlying resolution.

import { useEffect, useState } from "react";
import { useStore } from "./store";

export function useResolvedAsset(relpath: string | null | undefined): string | null {
  const resolveAsset = useStore((s) => s.resolveAsset);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setUrl(null);
    if (relpath) {
      resolveAsset(relpath).then((u) => {
        if (live) setUrl(u || null);
      });
    }
    return () => {
      live = false;
    };
  }, [relpath, resolveAsset]);

  return url;
}
