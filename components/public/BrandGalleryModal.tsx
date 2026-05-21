"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Play, Clock, Globe } from "lucide-react";
import { useStore } from "@/lib/store";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { VideoModal } from "@/components/ui/VideoModal";
import type { Brand, Photo } from "@/lib/types";

type PlayerState = { src: string; title: string; aspect: "vertical" | "wide" };

export function BrandGalleryModal({
  brand,
  onClose,
}: {
  brand: Brand | null;
  onClose: () => void;
}) {
  const { photos } = useStore();
  const [player, setPlayer] = useState<PlayerState | null>(null);

  useEffect(() => {
    if (!brand) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [brand, onClose]);

  if (!brand || typeof document === "undefined") return null;

  const items = photos.filter(
    (p) => p.brandId === brand.id && p.section === "gallery"
  );

  const playVideo = (p: Photo) =>
    setPlayer({
      src: p.videoUrl ?? "",
      title: p.title,
      aspect: p.orientation === "landscape" ? "wide" : "vertical",
    });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-0 sm:p-6">
      <div
        className="fixed inset-0 bg-ink-950/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="surface-raised relative z-10 my-0 w-full max-w-5xl rounded-none sm:my-auto sm:rounded-3xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-ink-850/80 px-5 py-4 backdrop-blur-xl sm:rounded-t-3xl sm:px-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
              {brand.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-ink-700 font-bold text-white">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
              {brand.description && (
                <p className="line-clamp-1 text-sm text-slate-400">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:flex"
              >
                <Globe className="h-4 w-4" /> Visit
              </a>
            )}
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="p-5 sm:p-6">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              No published work in this brand yet.
            </p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {items.map((p) => {
                const isVideo = !!p.videoUrl;
                const hasComparison = !isVideo && !!(p.beforeUrl && p.afterUrl);
                return (
                  <div
                    key={p.id}
                    className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    {isVideo ? (
                      <button
                        onClick={() => playVideo(p)}
                        className={`relative block w-full overflow-hidden ${
                          p.orientation === "portrait"
                            ? "aspect-[3/4]"
                            : "aspect-video"
                        }`}
                      >
                        {p.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.url}
                            alt={p.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-ink-700" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/30 transition group-hover:bg-ink-950/50">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d transition group-hover:scale-110">
                            <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                          </span>
                        </div>
                        {p.durationSec ? (
                          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                            <Clock className="h-3 w-3" /> {p.durationSec}s
                          </span>
                        ) : null}
                      </button>
                    ) : hasComparison ? (
                      <BeforeAfterSlider
                        before={p.beforeUrl!}
                        after={p.afterUrl!}
                        className={
                          p.orientation === "portrait"
                            ? "aspect-[3/4]"
                            : "aspect-[4/3]"
                        }
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.url}
                        alt={p.title}
                        className="w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <VideoModal
        open={!!player}
        src={player?.src ?? ""}
        title={player?.title ?? ""}
        aspect={player?.aspect}
        onClose={() => setPlayer(null)}
      />
    </div>,
    document.body
  );
}
