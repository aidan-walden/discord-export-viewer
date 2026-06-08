import { test, expect, describe } from "bun:test";
import { formatMessageTimestamp } from "./formatTimestamp";

// Dates are built from LOCAL components (`new Date(y, m, d, ...)`) and serialized
// with `.toISOString()`, so every assertion holds in any machine timezone: the
// instant round-trips back to the same local calendar day and clock time.
const iso = (y: number, mo: number, d: number, h = 0, mi = 0) =>
  new Date(y, mo, d, h, mi).toISOString();

describe("formatMessageTimestamp", () => {
  test("same calendar day → Today at h:mm AM/PM", () => {
    const now = iso2date(2026, 5, 7, 18, 0);
    expect(formatMessageTimestamp(iso(2026, 5, 7, 15, 45), now)).toBe("Today at 3:45 PM");
  });

  test("morning time keeps AM", () => {
    const now = iso2date(2026, 5, 7, 18, 0);
    expect(formatMessageTimestamp(iso(2026, 5, 7, 9, 5), now)).toBe("Today at 9:05 AM");
  });

  test("previous calendar day → Yesterday at h:mm AM/PM", () => {
    const now = iso2date(2026, 5, 7, 8, 0);
    expect(formatMessageTimestamp(iso(2026, 5, 6, 22, 30), now)).toBe("Yesterday at 10:30 PM");
  });

  test("older date → MM/DD/YYYY (zero-padded)", () => {
    const now = iso2date(2026, 5, 7, 8, 0);
    expect(formatMessageTimestamp(iso(2026, 0, 3, 12, 0), now)).toBe("01/03/2026");
  });

  test("two days prior is not Yesterday", () => {
    const now = iso2date(2026, 5, 7, 8, 0);
    expect(formatMessageTimestamp(iso(2026, 5, 5, 12, 0), now)).toBe("06/05/2026");
  });

  test("day-boundary: one minute before midnight is Yesterday", () => {
    const now = iso2date(2026, 5, 7, 0, 1);
    expect(formatMessageTimestamp(iso(2026, 5, 6, 23, 59), now)).toBe("Yesterday at 11:59 PM");
  });

  test("day-boundary: one minute after midnight is Today", () => {
    const now = iso2date(2026, 5, 7, 23, 59);
    expect(formatMessageTimestamp(iso(2026, 5, 7, 0, 1), now)).toBe("Today at 12:01 AM");
  });

  test("relative day spans across a month boundary", () => {
    const now = iso2date(2026, 6, 1, 9, 0); // July 1
    expect(formatMessageTimestamp(iso(2026, 5, 30, 14, 0), now)).toBe("Yesterday at 2:00 PM"); // June 30
  });

  test("relative day spans across a year boundary", () => {
    const now = iso2date(2026, 0, 1, 9, 0); // Jan 1 2026
    expect(formatMessageTimestamp(iso(2025, 11, 31, 14, 0), now)).toBe("Yesterday at 2:00 PM"); // Dec 31 2025
  });
});

// `now` is a real Date (the function reads its local components), built locally.
function iso2date(y: number, mo: number, d: number, h: number, mi: number): Date {
  return new Date(y, mo, d, h, mi);
}
