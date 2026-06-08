// A faithful subset of the DiscordChatExporter JSON schema. The future parser
// produces exactly this shape; only the fields this slice renders are modeled.

export interface Author {
  id: string;
  name: string;
  nickname: string | null;
  color: string | null; // hex, e.g. "#5865f2"; null → default header gray
  isBot: boolean;
  avatarUrl: string; // export-relative path; unresolved this slice → default avatar
}

export interface Message {
  id: string;
  type: "Default"; // widened to the full union in later slices
  timestamp: string; // ISO 8601 with offset
  timestampEdited: string | null;
  content: string;
  author: Author;
}

// Grouping output shape — what groupMessages() will eventually return (Q7).
export interface MessageGroup {
  author: Author;
  messages: Message[]; // index 0 → full row; rest → compact follow-up rows
}
