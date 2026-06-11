// A faithful subset of the DiscordChatExporter JSON schema. The parser produces
// exactly this shape. The fields this slice actually renders are content,
// author, timestamp(s), and type; the rest are modeled now (ADP 0003 Q9) so the
// parser-output contract is stable and later rich-rendering slices add
// renderers rather than re-parsing.

import type { Role } from "./member";

export interface Author {
  id: string;
  name: string;
  discriminator: string;
  nickname: string | null;
  color: string | null; // hex, e.g. "#5865f2"; null → default header gray
  isBot: boolean;
  roles: Role[]; // {id,name,color,position} — exports carry NO hoist
  avatarUrl: string; // export-relative path; resolved via resolveAsset()
}

// Content-bearing: "Default" | "Reply" | "20". Pure events: "GuildMemberJoin" |
// "21" | unknown numeric. Kept open so unknown future types degrade gracefully.
export type MessageType = "Default" | "Reply" | "GuildMemberJoin" | (string & {});

export interface Emoji {
  id: string; // "" for unicode emoji; snowflake for custom
  name: string; // unicode glyph or custom-emoji name
  code: string;
  isAnimated: boolean;
  imageUrl: string; // export-relative
}

export interface Attachment {
  id: string;
  url: string; // export-relative
  fileName: string;
  fileSizeBytes: number;
}

export interface EmbedThumbnail {
  url: string;
  canonicalUrl?: string;
  width: number;
  height: number;
}

export interface Embed {
  title: string | null;
  url: string | null;
  timestamp: string | null;
  description: string | null;
  author?: { name: string; url?: string | null };
  thumbnail?: EmbedThumbnail | null;
  images: unknown[];
  fields: unknown[];
  inlineEmojis: Emoji[];
}

export interface Sticker {
  id: string;
  name: string;
  format: string; // "Lottie" | "APNG" | "PNG" | …
  sourceUrl: string; // export-relative
}

export interface Reaction {
  emoji: Emoji;
  count: number;
  users: Author[];
}

export interface Reference {
  type?: string;
  messageId: string;
  channelId: string;
  guildId: string;
}

export interface Interaction {
  id: string;
  name: string; // slash-command name
  user: Author;
}

export interface Message {
  id: string;
  type: MessageType;
  timestamp: string; // ISO 8601 with offset
  timestampEdited: string | null;
  callEndedTimestamp: string | null;
  isPinned: boolean;
  content: string;
  author: Author;
  attachments: Attachment[]; // modeled, not rendered this slice
  embeds: Embed[]; //   "
  stickers: Sticker[]; //   "
  reactions: Reaction[]; //   "
  mentions: Author[]; // used by humanizeMentions
  inlineEmojis: Emoji[]; // used by humanizeMentions
  reference?: Reference; // Reply target (bar deferred)
  interaction?: Interaction; // type-20 (/command header deferred)
}

// Grouping output shape — what groupMessages() returns for content-bearing runs.
export interface MessageGroup {
  author: Author;
  messages: Message[]; // index 0 → full row; rest → compact follow-up rows
}
