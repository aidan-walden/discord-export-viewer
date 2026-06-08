import type { Author, MessageGroup } from "@/types/message";

// Captured once at module load so the fixture's relative timestamps and the
// renderer's relative-day headers agree on a single reference "now". App threads
// this same value into <MessageList now={mockNow} />.
export const mockNow = new Date();

// Build an ISO timestamp `dayOffset` days before mockNow at a fixed local time.
function at(dayOffset: number, hour: number, minute: number): string {
  const d = new Date(mockNow);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const aurora: Author = {
  id: "1001",
  name: "aurora",
  nickname: "Aurora",
  color: "#f47fff", // non-null → username renders in this color
  isBot: false,
  avatarUrl: "Aurora_Files/avatar.png", // unresolved this slice → default avatar
};

const bjorn: Author = {
  id: "1002",
  name: "bjorn",
  nickname: null,
  color: null, // null → default header gray
  isBot: false,
  avatarUrl: "Bjorn_Files/avatar.png",
};

const cassia: Author = {
  id: "1003",
  name: "cassia",
  nickname: "Cassia",
  color: null,
  isBot: false,
  avatarUrl: "Cassia_Files/avatar.png",
};

export const mockGroups: MessageGroup[] = [
  // Older date → MM/DD/YYYY header. Full row + one compact follow-up.
  {
    author: cassia,
    messages: [
      {
        id: "2001",
        type: "Default",
        timestamp: at(9, 16, 12),
        timestampEdited: null,
        content: "Did we ever settle on a date for the next session?",
        author: cassia,
      },
      {
        id: "2002",
        type: "Default",
        timestamp: at(9, 16, 13),
        timestampEdited: null,
        content: "I can do any evening except Thursday.",
        author: cassia,
      },
    ],
  },
  // Yesterday → "Yesterday at …" header. Full row + compact follow-up;
  // the follow-up is edited → (edited) marker.
  {
    author: bjorn,
    messages: [
      {
        id: "2003",
        type: "Default",
        timestamp: at(1, 20, 30),
        timestampEdited: null,
        content: "Pushed the map handouts to the shared folder.",
        author: bjorn,
      },
      {
        id: "2004",
        type: "Default",
        timestamp: at(1, 20, 32),
        timestampEdited: at(1, 20, 35),
        content: "Two of them are spoilers — don't peek before the reveal.",
        author: bjorn,
      },
    ],
  },
  // Today → "Today at …" header. Full row + two compact follow-ups; the first
  // message is edited and the content carries a literal multi-line block to
  // exercise whitespace-pre-wrap.
  {
    author: aurora,
    messages: [
      {
        id: "2005",
        type: "Default",
        timestamp: at(0, 9, 5),
        timestampEdited: at(0, 9, 7),
        content: "Morning! Recap from last week:\n  • the door was a mimic\n  • nobody trusts the bard now",
        author: aurora,
      },
      {
        id: "2006",
        type: "Default",
        timestamp: at(0, 9, 6),
        timestampEdited: null,
        content: "Markdown like **bold** and ||spoilers|| render literally for now.",
        author: aurora,
      },
      {
        id: "2007",
        type: "Default",
        timestamp: at(0, 9, 8),
        timestampEdited: null,
        content: "See you all tonight 🎲",
        author: aurora,
      },
    ],
  },
];
