import { segmentEmoji } from "@/lib/segmentEmoji";

// Renders a role name with any inline unicode emoji wrapped in their own spans
// so they sit a touch larger and baseline-aligned, the way Discord renders emoji
// inside role headers. Plain-text runs pass through untouched.
export function RoleName({ name }: { name: string }) {
  return (
    <>
      {segmentEmoji(name).map((seg, i) =>
        seg.type === "emoji" ? (
          <span key={i} className="text-[1.1em] leading-none align-[-0.1em]">
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </>
  );
}
