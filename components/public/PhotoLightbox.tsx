"use client";

import { useEffect } from "react";
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
  const videoSrc = useMediaSrc(open && isVideo ? item!.videoUrl! : "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onClose, onIndex]);

  if (!open || !item || typeof document === "undefined") return null;

  const hasBA = !isVideo && !!(item.beforeUrl && item.afterUrl);

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
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-16">
        {items.length > 1 && (
          <>
            <button
              onClick={() => onIndex((index - 1 + items.length) % items.length)}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => onIndex((index + 1) % items.length)}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="max-h-full w-full max-w-5xl animate-scale-in">
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

      {/* Caption */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-5 py-5 text-center">
        <span className="text-base font-medium text-white">{item.title}</span>
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
