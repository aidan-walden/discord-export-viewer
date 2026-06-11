import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RenderItem } from "@/types/manifest";
import { MessageList } from "./MessageList";

interface MessageScrollerProps {
  items: RenderItem[];
  now?: Date;
}

// How many render items to reveal per "page". A render item is a group (often
// several rows), a system line, or a date divider — so 50 items is roughly
// 100–300 rows: enough to fill any viewport and overscroll smoothly while
// keeping the DOM small for long channels.
const PAGE = 50;

// Owns the scroll container so the chat opens at the newest messages (bottom)
// and reveals older history as the user scrolls up. All messages are already in
// memory (the store caches the full RenderItem[]), so this is a pure DOM window:
// we render the last `visibleCount` items and grow the window toward the top.
// Mounted with key={openChannelId} in App, so switching channels resets state
// and re-anchors to the bottom.
export function MessageScroller({ items, now }: MessageScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(PAGE, items.length));
  // Scroll height captured immediately before a window grow, so we can keep the
  // viewport pinned after older items are prepended. null when no grow is pending.
  const prevHeightRef = useRef<number | null>(null);
  const didInit = useRef(false);

  // The most-recent `visibleCount` items. Slicing on RenderItem boundaries keeps
  // groups/dividers intact.
  const windowed = useMemo(
    () => items.slice(Math.max(0, items.length - visibleCount)),
    [items, visibleCount],
  );

  // Anchor to the bottom on first paint (before the browser paints, so the top
  // never flashes). Runs once per mount; key={openChannelId} resets it per channel.
  useLayoutEffect(() => {
    if (didInit.current) return;
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    el.scrollTop = el.scrollHeight;
    didInit.current = true;
  }, [items.length]);

  // After the window grows, restore scroll position: older items prepended above
  // the viewport add exactly (newHeight - oldHeight) px, so add that to scrollTop
  // to keep the same content under the viewport — no jump.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && prevHeightRef.current !== null) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
      prevHeightRef.current = null;
    }
  }, [visibleCount]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 200 && visibleCount < items.length) {
      // Capture height synchronously, before the state change re-renders a larger
      // slice; the layout effect above reads it to correct scrollTop.
      prevHeightRef.current = el.scrollHeight;
      setVisibleCount((c) => Math.min(c + PAGE, items.length));
    }
  }, [visibleCount, items.length]);

  return (
    <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto">
      <MessageList items={windowed} now={now} />
    </div>
  );
}
