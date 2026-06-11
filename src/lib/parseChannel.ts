// Lazily parse one channel export file into Message[] (called only when a channel
// is first opened, then cached). A thin, total mapper over the export JSON: it
// fills the export-faithful shape the type contract promises, defaulting absent
// arrays so downstream code never guards for undefined. Deferred-render fields
// (attachments, embeds, …) are passed through unmapped.

import type { Author, Message } from "@/types/message";
import type { Role } from "@/types/member";

// Minimal structural type for the bits we read; `.text()` covers both the real
// File and in-memory fakes.
interface TextSource {
  text(): Promise<string>;
}

function mapRole(raw: any): Role {
  // Exports omit `hoist`; force it false so the participant list stays a single
  // MEMBERS bucket and the role objects are type-sound at runtime.
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    color: raw.color ?? null,
    position: Number(raw.position ?? 0),
    hoist: false,
  };
}

function mapAuthor(raw: any): Author {
  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? ""),
    discriminator: String(raw?.discriminator ?? "0000"),
    nickname: raw?.nickname ?? null,
    color: raw?.color ?? null,
    isBot: Boolean(raw?.isBot),
    roles: Array.isArray(raw?.roles) ? raw.roles.map(mapRole) : [],
    avatarUrl: String(raw?.avatarUrl ?? ""),
  };
}

function mapMessage(raw: any): Message {
  return {
    id: String(raw.id),
    type: String(raw.type),
    timestamp: String(raw.timestamp),
    timestampEdited: raw.timestampEdited ?? null,
    callEndedTimestamp: raw.callEndedTimestamp ?? null,
    isPinned: Boolean(raw.isPinned),
    content: String(raw.content ?? ""),
    author: mapAuthor(raw.author),
    attachments: raw.attachments ?? [],
    embeds: raw.embeds ?? [],
    stickers: raw.stickers ?? [],
    reactions: raw.reactions ?? [],
    mentions: Array.isArray(raw.mentions) ? raw.mentions.map(mapAuthor) : [],
    inlineEmojis: raw.inlineEmojis ?? [],
    reference: raw.reference ?? undefined,
    interaction: raw.interaction
      ? { id: String(raw.interaction.id), name: String(raw.interaction.name), user: mapAuthor(raw.interaction.user) }
      : undefined,
  };
}

export async function parseChannel(file: TextSource): Promise<Message[]> {
  const raw = JSON.parse(await file.text());
  const messages = Array.isArray(raw?.messages) ? raw.messages : [];
  return messages.map(mapMessage);
}
