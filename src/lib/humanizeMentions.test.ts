import { test, expect } from "bun:test";
import type { Author } from "@/types/message";
import { humanizeMentions } from "./humanizeMentions";

function author(id: string, name: string, nickname: string | null = null): Author {
  return {
    id,
    name,
    discriminator: "0000",
    nickname,
    color: null,
    isBot: false,
    roles: [],
    avatarUrl: "",
  };
}

const channels = new Map([
  ["555", "general"],
  ["556", "off-topic"],
]);

test("substitutes a user mention with the nickname", () => {
  const mentions = [author("111", "aurora", "Aurora")];
  expect(humanizeMentions("hi <@111>!", mentions, channels)).toBe("hi @Aurora!");
});

test("falls back to username when the mention has no nickname", () => {
  const mentions = [author("111", "aurora")];
  expect(humanizeMentions("hi <@111>", mentions, channels)).toBe("hi @aurora");
});

test("handles the <@!id> nickname-mention form", () => {
  const mentions = [author("111", "aurora", "Aurora")];
  expect(humanizeMentions("<@!111> pong", mentions, channels)).toBe("@Aurora pong");
});

test("substitutes a channel mention from the manifest map", () => {
  expect(humanizeMentions("see <#555>", [], channels)).toBe("see #general");
});

test("substitutes a custom emoji to its colon name", () => {
  expect(humanizeMentions("nice <:blobwave:123>", [], channels)).toBe("nice :blobwave:");
  expect(humanizeMentions("anim <a:spin:456>", [], channels)).toBe("anim :spin:");
});

test("unknown user id degrades to @Unknown", () => {
  expect(humanizeMentions("<@999>", [], channels)).toBe("@Unknown");
});

test("unknown channel id degrades to #unknown-channel", () => {
  expect(humanizeMentions("<#999>", [], channels)).toBe("#unknown-channel");
});

test("leaves bold, links, spoilers, and <t:> timestamps literal", () => {
  const s = "**bold** ||spoiler|| https://x.test <t:1700000000:R>";
  expect(humanizeMentions(s, [], channels)).toBe(s);
});

test("round-trips content with no tokens", () => {
  expect(humanizeMentions("plain text only", [], channels)).toBe("plain text only");
});

test("empty content returns empty", () => {
  expect(humanizeMentions("", [], channels)).toBe("");
});

test("substitutes multiple mixed tokens in one pass", () => {
  const mentions = [author("111", "aurora", "Aurora"), author("222", "bjorn")];
  const out = humanizeMentions("<@111> & <@222> in <#556> <:wave:1>", mentions, channels);
  expect(out).toBe("@Aurora & @bjorn in #off-topic :wave:");
});
