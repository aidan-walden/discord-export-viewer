// Hash routing: #/guild/:guildId/channel/:channelId. Hash (not history) routing
// keeps the SPA refresh-stable on a static host and gives back/forward for free.
// FSA handles can't be restored without a user gesture, so on refresh the app
// re-picks the directory and then honors whatever channel the hash names.

export interface Route {
  guildId: string;
  channelId: string;
}

const HASH = /^#\/guild\/([^/]+)\/channel\/([^/]+)$/;

export function parseHash(): Route | null {
  const m = location.hash.match(HASH);
  return m ? { guildId: decodeURIComponent(m[1]), channelId: decodeURIComponent(m[2]) } : null;
}

export function navigate(guildId: string, channelId: string): void {
  location.hash = `#/guild/${encodeURIComponent(guildId)}/channel/${encodeURIComponent(channelId)}`;
}

export function onRouteChange(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
