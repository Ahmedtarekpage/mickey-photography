"use client";

import { Play, Clock } from "lucide-react";
import { CardMenu } from "@/components/ui/CardMenu";
import type { Reel } from "@/lib/types";

export function ReelGrid({
  reels,
  onEdit,
  onDelete,
  onPlay,
}: {
  reels: Reel[];
  onEdit: (r: Reel) => void;
  onDelete: (r: Reel) => void;
  onPlay: (r: Reel) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {reels.map((r) => (
        <div key={r.id} className="card-3d group relative overflow-hidden">
          <div className="absolute right-3 top-3 z-20">
            <CardMenu onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} />
          </div>
          <button
            onClick={() => onPlay(r)}
            className="relative block aspect-[9/16] w-full overflow-hidden"
          >
            {r.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.thumbnail}
                alt={r.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-ink-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d transition group-hover:scale-110">
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            </span>
            {r.durationSec ? (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                <Clock className="h-3 w-3" /> {r.durationSec}s
              </span>
            ) : null}
          </button>
          <div className="p-3">
            <p className="truncate text-sm font-medium text-white">{r.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
