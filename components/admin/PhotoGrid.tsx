"use client";

import {
  SlidersHorizontal,
  RectangleHorizontal,
  RectangleVertical,
  Play,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CardMenu } from "@/components/ui/CardMenu";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import type { Photo } from "@/lib/types";

export function PhotoGrid({
  photos,
  onEdit,
  onDelete,
  onPlay,
}: {
  photos: Photo[];
  onEdit: (p: Photo) => void;
  onDelete: (p: Photo) => void;
  /** Called when a video item is clicked (videography). */
  onPlay?: (p: Photo) => void;
}) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {photos.map((p) => {
        const isVideo = !!p.videoUrl;
        const hasComparison = !isVideo && !!(p.beforeUrl && p.afterUrl);
        return (
          <div
            key={p.id}
            className="card-3d group relative break-inside-avoid overflow-hidden"
          >
            <div className="absolute right-3 top-3 z-20">
              <CardMenu onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
            </div>
            <div className="absolute left-3 top-3 z-10 flex gap-1.5">
              <Badge tone={p.orientation === "portrait" ? "cyan" : "violet"}>
                {p.orientation === "portrait" ? (
                  <RectangleVertical className="h-3 w-3" />
                ) : (
                  <RectangleHorizontal className="h-3 w-3" />
                )}
                {p.orientation}
              </Badge>
              {hasComparison && (
                <Badge tone="pink">
                  <SlidersHorizontal className="h-3 w-3" /> B/A
                </Badge>
              )}
            </div>

            {isVideo ? (
              <button
                onClick={() => onPlay?.(p)}
                className={`relative block w-full overflow-hidden ${
                  p.orientation === "portrait" ? "aspect-[3/4]" : "aspect-video"
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
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d transition group-hover:scale-110">
                  <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                </span>
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
                  p.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]"
                }
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.url} alt={p.title} className="w-full object-cover" />
            )}

            <div className="p-4">
              <p className="truncate text-sm font-medium text-white">{p.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
