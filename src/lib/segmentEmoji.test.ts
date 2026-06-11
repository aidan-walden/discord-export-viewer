import { test, expect, describe } from "bun:test";
import { segmentEmoji } from "./segmentEmoji";

describe("segmentEmoji", () => {
  test("plain text → a single text segment", () => {
    expect(segmentEmoji("Players")).toEqual([{ type: "text", value: "Players" }]);
  });

  test("empty string → no segments", () => {
    expect(segmentEmoji("")).toEqual([]);
  });

  test("leading emoji splits from trailing text", () => {
    expect(segmentEmoji("🎲 Game Master")).toEqual([
      { type: "emoji", value: "🎲" },
      { type: "text", value: " Game Master" },
    ]);
  });

  test("emoji in the middle of text", () => {
    expect(segmentEmoji("a🎨b")).toEqual([
      { type: "text", value: "a" },
      { type: "emoji", value: "🎨" },
      { type: "text", value: "b" },
    ]);
  });

  test("variation-selector emoji (🛡️) is one emoji segment", () => {
    const segs = segmentEmoji("🛡️ Moderators");
    expect(segs[0]).toEqual({ type: "emoji", value: "🛡️" });
    expect(segs[1]).toEqual({ type: "text", value: " Moderators" });
  });

  test("ZWJ sequence (family) stays a single emoji segment", () => {
    const family = "👨‍👩‍👧";
    expect(segmentEmoji(family)).toEqual([{ type: "emoji", value: family }]);
  });

  test("skin-tone modifier stays attached to its base emoji", () => {
    expect(segmentEmoji("👋🏽")).toEqual([{ type: "emoji", value: "👋🏽" }]);
  });

  test("regional-indicator flag is a single emoji segment", () => {
    expect(segmentEmoji("🇺🇸")).toEqual([{ type: "emoji", value: "🇺🇸" }]);
  });

  test("adjacent emoji become separate segments", () => {
    expect(segmentEmoji("🎲🎨")).toEqual([
      { type: "emoji", value: "🎲" },
      { type: "emoji", value: "🎨" },
    ]);
  });

  test("reassembling all segment values reproduces the input", () => {
    const input = "🛡️ Mods • 🎲 GMs 🇺🇸";
    expect(segmentEmoji(input).map((s) => s.value).join("")).toBe(input);
  });
});
