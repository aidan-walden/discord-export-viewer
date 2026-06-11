// Pure timestamp formatters for message headers. All formatting happens in the
// viewer's local timezone via Intl.DateTimeFormat — matching what a Discord user
// saw on their own machine. The relative-day decision is computed against an
// injected `now` so the header formatter is deterministic and unit-testable.

const clockFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const fullFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dividerFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Calendar-day index in the local timezone, independent of clock time and DST.
// Exported so message grouping and date dividers share one day-boundary rule.
export function localDayIndex(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/**
 * Discord-style message header timestamp.
 *   same calendar day as `now` → "Today at 3:45 PM"
 *   previous calendar day      → "Yesterday at 3:45 PM"
 *   older                      → "MM/DD/YYYY"
 * Day boundaries are evaluated in the viewer's local timezone.
 */
export function formatMessageTimestamp(iso: string, now: Date): string {
  const d = new Date(iso);
  const diff = localDayIndex(now) - localDayIndex(d);
  if (diff === 0) return `Today at ${clockFmt.format(d)}`;
  if (diff === 1) return `Yesterday at ${clockFmt.format(d)}`;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/** Bare clock time, e.g. "3:45 PM" — shown in the compact-row hover gutter. */
export function formatClockTime(iso: string): string {
  return clockFmt.format(new Date(iso));
}

/** Long localized date+time for the native `title` hover tooltip. */
export function formatFullTimestamp(iso: string): string {
  return fullFmt.format(new Date(iso));
}

/** Centered day-boundary label for a date divider, e.g. "June 1, 2024". */
export function formatDividerDate(iso: string): string {
  return dividerFmt.format(new Date(iso));
}
