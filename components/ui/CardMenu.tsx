"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

export function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div ref={ref} className="relative" onClick={stop}>
      <button
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-950/50 text-slate-200 backdrop-blur transition hover:bg-ink-950/80"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1 shadow-3d backdrop-blur-xl animate-scale-in">
          <button
            onClick={(e) => {
              stop(e);
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={(e) => {
              stop(e);
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/15"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
