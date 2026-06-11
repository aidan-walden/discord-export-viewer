// Splits a string into runs of plain text and whole emoji so each emoji can be
// rendered in its own styled span (Discord sizes inline emoji a touch larger and
// aligns them to the text baseline). Pure and unit-tested.
//
// A single emoji is treated as one segment even when it spans several code
// points: a base pictograph plus optional variation selector / skin-tone
// modifier and any number of ZWJ-joined continuations (👨‍👩‍👧), or a regional-
// indicator pair (flags, 🇺🇸).

export type Segment = { type: "text" | "emoji"; value: string };

const EMOJI_RUN = new RegExp(
  // regional-indicator pair (flag)
  "(?:\\p{Regional_Indicator}\\p{Regional_Indicator})" +
    "|" +
    // pictographic grapheme: base + optional VS16/skin-tone + ZWJ continuations
    "(?:\\p{Extended_Pictographic}(?:\\uFE0F|[\\u{1F3FB}-\\u{1F3FF}])?" +
    "(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|[\\u{1F3FB}-\\u{1F3FF}])?)*)",
  "gu",
);

export function segmentEmoji(input: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of input.matchAll(EMOJI_RUN)) {
    const start = match.index;
    if (start > last) segments.push({ type: "text", value: input.slice(last, start) });
    segments.push({ type: "emoji", value: match[0] });
    last = start + match[0].length;
  }
  if (last < input.length) segments.push({ type: "text", value: input.slice(last) });
  return segments;
}
