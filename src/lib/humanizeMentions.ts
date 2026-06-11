// A minimal, tested pre-pass that swaps raw Discord ID tokens for readable names
// (ADP 0003 Q7). Scoped tightly to mention/emoji *names* only — the deferred
// markdown slice owns the real AST and replaces this wholesale. Bold, links,
// spoilers, and `<t:unix:>` timestamps are left strictly literal.
//
//   <@id> / <@!id>      → @nick      (nickname ?? name, from the message mentions)
//   <#id>               → #channel   (name from the manifest channel map)
//   <:name:id> / <a:…>  → :name:     (custom-emoji name, kept colon-wrapped)
//
// Unknown ids degrade to @Unknown / #unknown-channel; custom emoji carry their
// own name in the token so they never need a lookup.

import type { Author } from "@/types/message";

// Order matters: the custom-emoji form `<:name:id>` and `<a:name:id>` must be
// matched before the bare `<#id>`/`<@id>` forms so they aren't mis-parsed.
const EMOJI = /<a?:(\w+):\d+>/g;
const USER = /<@!?(\d+)>/g;
const CHANNEL = /<#(\d+)>/g;

/**
 * @param content    raw message content
 * @param mentions   the message's mentions[] (resolves <@id> → nickname/name)
 * @param channelMap manifest channel id → channel name (resolves <#id> → name)
 */
export function humanizeMentions(
  content: string,
  mentions: Author[],
  channelMap: Map<string, string>,
): string {
  if (!content) return content;

  const byId = new Map(mentions.map((m) => [m.id, m.nickname ?? m.name]));

  return content
    .replace(EMOJI, (_, name: string) => `:${name}:`)
    .replace(USER, (_, id: string) => `@${byId.get(id) ?? "Unknown"}`)
    .replace(CHANNEL, (_, id: string) => `#${channelMap.get(id) ?? "unknown-channel"}`);
}
