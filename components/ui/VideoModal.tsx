"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useMediaSrc } from "@/lib/useMediaSrc";

export function VideoModal({
  open,
  src,
  title,
  onClose,
  aspect = "vertical",
}: {
  open: boolean;
  src: string;
  title: string;
  onClose: () => void;
  /** "vertical" for reels/portrait, "wide" for landscape clips. */
  aspect?: "vertical" | "wide";
}) {
  // Resolves uploaded (idb:) videos to a playable object URL; URLs pass through.
  const resolvedSrc = useMediaSrc(open ? src : "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full animate-scale-in ${
          aspect === "wide" ? "max-w-3xl" : "max-w-sm"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="truncate pr-3 text-sm font-medium text-white">{title}</p>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-3d">
          <video
            src={resolvedSrc}
            controls
            autoPlay
            playsInline
            className={`w-full object-contain ${
              aspect === "wide" ? "aspect-video" : "aspect-[9/16]"
            }`}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
