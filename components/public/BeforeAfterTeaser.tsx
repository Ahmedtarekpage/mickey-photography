"use client";

import { MoveHorizontal } from "lucide-react";

/**
 * A self-animating before/after teaser shown on gallery cards. The "after"
 * image is the base layer (it sets the card's natural height); the "before"
 * image sits on top and is wiped away by an animated clip-path while a
 * divider + handle sweep across in sync — so a client can tell at a glance,
 * without clicking, that the photo is an interactive before/after comparison.
 *
 * The wipe and the handle share identical timing, so they stay aligned. For
 * users who prefer reduced motion the animation is dropped and the inline
 * defaults below leave a clear 50/50 split.
 */
export function BeforeAfterTeaser({
  before,
  after,
  className = "",
}: {
  before: string;
  after: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* After — base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="After" className="block w-full object-cover" />

      {/* Before — full-size overlay revealed by the animated wipe */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Before"
        style={{ clipPath: "inset(0 50% 0 0)" }}
        className="absolute inset-0 h-full w-full animate-ba-clip object-cover motion-reduce:animate-none"
      />

      {/* Sweeping divider + handle, kept in lockstep with the wipe */}
      <span
        style={{ left: "50%" }}
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 animate-ba-handle bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)] motion-reduce:animate-none"
      >
        <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d">
          <MoveHorizontal className="h-3.5 w-3.5" />
        </span>
      </span>

      {/* Side labels */}
      <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        Before
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        After
      </span>
    </div>
  );
}
