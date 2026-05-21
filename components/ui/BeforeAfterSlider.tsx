"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  className?: string;
}

/** A draggable before/after image comparison slider. */
export function BeforeAfterSlider({
  before,
  after,
  className = "",
}: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(50);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Keep the container width in state so the clipped "before" image can be
  // pinned to the full width — otherwise it squishes as the clip shrinks.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const moveTo = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className={`group relative select-none overflow-hidden rounded-2xl ${className}`}
      onMouseDown={(e) => {
        dragging.current = true;
        moveTo(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && moveTo(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => moveTo(e.touches[0].clientX)}
      onTouchMove={(e) => moveTo(e.touches[0].clientX)}
    >
      {/* After — fixed full-size background layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt="After"
        draggable={false}
        className="block h-full w-full object-cover"
      />
      <span className="absolute bottom-3 right-3 z-[5] rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
        After
      </span>

      {/* Before — clipped layer; the image itself stays pinned to the full
          container width so it does not move or squish while sliding. */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt="Before"
          draggable={false}
          className="absolute inset-y-0 left-0 h-full object-cover"
          style={{ width: width ? `${width}px` : "100%", maxWidth: "none" }}
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          Before
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
