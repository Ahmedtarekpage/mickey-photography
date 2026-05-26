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
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { useMediaSrc } from "@/lib/useMediaSrc";
import type { Photo } from "@/lib/types";

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

  // Instagram-style touch swipe. Enabled only for plain images so it never
  // fights the before/after slider's own drag or the video player's controls.
  const canSwipe = items.length > 1 && !isVideo && !hasBA;
  const touch = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [dragX, setDragX] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!canSwipe) return;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, active: true };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touch.current.active) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    // Only follow the finger once the gesture is clearly horizontal.
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
  };
  const onTouchEnd = () => {
    if (!touch.current.active) return;
    touch.current.active = false;
    const dx = dragX;
    setDragX(0);
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

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

  // Drop any leftover drag offset when the photo changes.
  useEffect(() => setDragX(0), [index]);

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
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-16"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: canSwipe ? "pan-y" : undefined }}
      >
        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className={`absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6 sm:flex ${
                canSwipe ? "hidden" : "flex"
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(1)}
              className={`absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:flex ${
                canSwipe ? "hidden" : "flex"
              }`}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div
          className="max-h-full w-full max-w-5xl animate-scale-in"
          style={{
            transform: dragX ? `translateX(${dragX}px)` : undefined,
            transition: dragX ? "none" : "transform .25s ease",
          }}
        >
          {isVideo ? (
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              autoPlay
              playsInline
              className="mx-auto max-h-[72vh] w-auto rounded-2xl"
            />
          ) : hasBA ? (
            <div className="mx-auto max-h-[72vh] w-full max-w-3xl">
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.title}
              className="mx-auto max-h-[72vh] w-auto rounded-2xl object-contain"
            />
          )}
        </div>
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
