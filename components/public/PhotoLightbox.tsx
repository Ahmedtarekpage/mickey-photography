"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  RectangleHorizontal,
  RectangleVertical,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { useMediaSrc } from "@/lib/useMediaSrc";
import type { Photo } from "@/lib/types";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * A photo you can zoom and pan:
 *  - laptop: scroll wheel zooms toward the cursor, double-click toggles zoom,
 *    +/- buttons, drag to pan when zoomed.
 *  - mobile: pinch to zoom, double-tap toggles zoom, drag to pan when zoomed.
 * When not zoomed, a horizontal swipe navigates (via `swipe`) — exactly like
 * Instagram, so the gesture never fights panning.
 */
function ZoomableImage({
  src,
  alt,
  swipe,
}: {
  src: string;
  alt: string;
  /** Navigate when the user swipes while at 1× (omit to disable). */
  swipe?: (dir: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tf = useRef({ scale: 1, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);

  const apply = (animate = false) => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform .18s ease-out" : "none";
    el.style.transform = `translate(${tf.current.x}px, ${tf.current.y}px) scale(${tf.current.scale})`;
  };

  // Keep the image from being dragged past its own edges.
  const clampPan = () => {
    const c = containerRef.current;
    const w = wrapRef.current;
    if (!c || !w) return;
    const maxX = Math.max(0, (w.offsetWidth * tf.current.scale - c.clientWidth) / 2);
    const maxY = Math.max(0, (w.offsetHeight * tf.current.scale - c.clientHeight) / 2);
    tf.current.x = clamp(tf.current.x, -maxX, maxX);
    tf.current.y = clamp(tf.current.y, -maxY, maxY);
  };

  // Zoom toward a screen point so it stays put under the finger/cursor.
  const zoomAt = (clientX: number, clientY: number, next: number, animate = false) => {
    const c = containerRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const fx = clientX - (r.left + r.width / 2);
    const fy = clientY - (r.top + r.height / 2);
    const s0 = tf.current.scale;
    const s1 = clamp(next, MIN_SCALE, MAX_SCALE);
    tf.current.x = fx - (fx - tf.current.x) * (s1 / s0);
    tf.current.y = fy - (fy - tf.current.y) * (s1 / s0);
    tf.current.scale = s1;
    clampPan();
    apply(animate);
    setZoomed(s1 > 1.01);
  };

  const reset = (animate = true) => {
    tf.current = { scale: 1, x: 0, y: 0 };
    apply(animate);
    setZoomed(false);
  };

  const zoomFromCenter = (factor: number) => {
    const c = containerRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, tf.current.scale * factor, true);
    if (tf.current.scale <= 1.01) reset(true);
  };

  // Reset zoom whenever the photo changes.
  useEffect(() => {
    reset(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Wheel needs a non-passive listener so we can preventDefault the page scroll.
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, tf.current.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- pointer gestures (mouse + touch unified) ---
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({
    mode: "none" as "none" | "pan" | "swipe" | "pinch",
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastDist: 0,
    lastMidX: 0,
    lastMidY: 0,
    moved: false,
  });
  const lastTap = useRef(0);

  const beginSingle = (x: number, y: number) => {
    g.current.mode = tf.current.scale > 1 ? "pan" : "swipe";
    g.current.startX = g.current.lastX = x;
    g.current.startY = g.current.lastY = y;
    g.current.moved = false;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    containerRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    if (pts.length === 1) {
      beginSingle(e.clientX, e.clientY);
    } else if (pts.length === 2) {
      g.current.mode = "pinch";
      g.current.lastDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      g.current.lastMidX = (pts[0].x + pts[1].x) / 2;
      g.current.lastMidY = (pts[0].y + pts[1].y) / 2;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());

    if (g.current.mode === "pinch" && pts.length >= 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      if (g.current.lastDist > 0) {
        zoomAt(midX, midY, tf.current.scale * (dist / g.current.lastDist));
      }
      tf.current.x += midX - g.current.lastMidX;
      tf.current.y += midY - g.current.lastMidY;
      clampPan();
      apply();
      g.current.lastDist = dist;
      g.current.lastMidX = midX;
      g.current.lastMidY = midY;
    } else if (g.current.mode === "pan") {
      tf.current.x += e.clientX - g.current.lastX;
      tf.current.y += e.clientY - g.current.lastY;
      g.current.lastX = e.clientX;
      g.current.lastY = e.clientY;
      if (Math.abs(e.clientX - g.current.startX) > 3 || Math.abs(e.clientY - g.current.startY) > 3)
        g.current.moved = true;
      clampPan();
      apply();
    } else if (g.current.mode === "swipe") {
      g.current.lastX = e.clientX;
      g.current.lastY = e.clientY;
      if (Math.abs(e.clientX - g.current.startX) > 3) g.current.moved = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const mode = g.current.mode;
    const remaining = pointers.current.size;

    if (remaining === 0) {
      if (mode === "swipe") {
        const dx = g.current.lastX - g.current.startX;
        const dy = g.current.lastY - g.current.startY;
        if (swipe && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
          swipe(dx < 0 ? 1 : -1);
        } else if (!g.current.moved) {
          const now = Date.now();
          if (now - lastTap.current < 280) {
            zoomAt(g.current.startX, g.current.startY, 2.5, true);
            lastTap.current = 0;
          } else lastTap.current = now;
        }
      } else if (mode === "pan") {
        if (!g.current.moved) {
          const now = Date.now();
          if (now - lastTap.current < 280) {
            reset(true);
            lastTap.current = 0;
          } else lastTap.current = now;
        } else if (tf.current.scale <= 1.01) {
          reset(true);
        }
      }
      g.current.mode = "none";
    } else if (remaining === 1) {
      // A finger lifted off a pinch — continue with the one that's left.
      const p = Array.from(pointers.current.values())[0];
      beginSingle(p.x, p.y);
      g.current.moved = true; // don't treat as a tap
    }

    if (tf.current.scale < 1) reset(true);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex touch-none items-center justify-center px-4 sm:px-16 ${
        zoomed ? "cursor-grab" : "cursor-zoom-in"
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={wrapRef} className="will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-[72vh] w-auto max-w-[94vw] select-none rounded-2xl object-contain sm:max-w-[86vw]"
        />
      </div>

      {/* Zoom controls (handy on laptop; work on touch too) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomFromCenter(1.4)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => zoomFromCenter(1 / 1.4)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function PhotoLightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: Photo[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index >= 0 && index < items.length;
  const item = open ? items[index] : undefined;
  const isVideo = !!item?.videoUrl;
  const hasBA = !isVideo && !!(item?.beforeUrl && item?.afterUrl);
  const videoSrc = useMediaSrc(open && isVideo ? item!.videoUrl! : "");

  const go = (dir: number) =>
    onIndex((index + dir + items.length) % items.length);

  // Swipe-to-navigate applies to plain photos (handled inside ZoomableImage).
  const canSwipe = items.length > 1 && !isVideo && !hasBA;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, items.length, onClose, onIndex]);

  if (!open || !item || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950/95 backdrop-blur-md animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-sm font-medium text-slate-300">
          {index + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6 sm:flex ${
                canSwipe ? "hidden" : "flex"
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(1)}
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:flex ${
                canSwipe ? "hidden" : "flex"
              }`}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {isVideo ? (
          <div className="w-full max-w-5xl px-4 animate-scale-in sm:px-16">
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              autoPlay
              playsInline
              className="mx-auto max-h-[72vh] w-auto rounded-2xl"
            />
          </div>
        ) : hasBA ? (
          <div className="mx-auto w-full max-w-3xl px-4 animate-scale-in sm:px-16">
            <BeforeAfterSlider
              before={item.beforeUrl!}
              after={item.afterUrl!}
              className={
                item.orientation === "portrait"
                  ? "mx-auto aspect-[3/4] max-h-[72vh] w-auto"
                  : "aspect-[3/2]"
              }
            />
          </div>
        ) : (
          <ZoomableImage
            key={item.id}
            src={item.url}
            alt={item.title}
            swipe={canSwipe ? go : undefined}
          />
        )}
      </div>

      {/* Caption (name shown only when enabled; alt always set on the image) */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-5 py-5 text-center">
        {item.showName && (
          <span className="text-base font-medium text-white">{item.title}</span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
          {item.orientation === "portrait" ? (
            <RectangleVertical className="h-3 w-3" />
          ) : (
            <RectangleHorizontal className="h-3 w-3" />
          )}
          {item.orientation}
        </span>
        {hasBA && (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-pink/30 bg-brand-pink/15 px-2.5 py-0.5 text-[11px] text-pink-300">
            <SlidersHorizontal className="h-3 w-3" /> Before / after — drag the
            slider
          </span>
        )}
      </div>
    </div>,
    document.body
  );
}
