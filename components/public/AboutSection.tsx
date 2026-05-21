"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { useMediaSrc } from "@/lib/useMediaSrc";

export function AboutSection({ settings }: { settings: SiteSettings }) {
  const reelSrc = useMediaSrc(settings.reelVideoUrl);
  const [playing, setPlaying] = useState(false);

  return (
    <section
      id="about"
      className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-2 lg:gap-16"
    >
      {/* Reel (left) */}
      <div className="mx-auto w-full max-w-sm">
        <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-3d">
          {playing && reelSrc ? (
            // Inline playback — full video, sound on, with controls.
            <video
              key={`play-${reelSrc}`}
              src={reelSrc}
              poster={settings.reelPoster || undefined}
              autoPlay
              controls
              playsInline
              className="h-full w-full bg-black object-contain"
            />
          ) : (
            <>
              {reelSrc ? (
                <video
                  key={reelSrc}
                  src={reelSrc}
                  poster={settings.reelPoster || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : settings.reelPoster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.reelPoster}
                  alt="Reel"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-ink-800" />
              )}
              <button
                onClick={() => reelSrc && setPlaying(true)}
                aria-label="Play reel"
                className="absolute inset-0 flex items-center justify-center bg-ink-950/20 transition group-hover:bg-ink-950/40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d transition group-hover:scale-110">
                  <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Brief (right) */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-fuchsia">
          The studio
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {settings.briefHeading}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 whitespace-pre-line">
          {settings.brief}
        </p>
      </div>
    </section>
  );
}
