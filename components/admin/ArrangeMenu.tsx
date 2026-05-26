"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowDownAZ, ArrowDown10, ArrowUp10 } from "lucide-react";

type Item = { id: string; title: string; createdAt: string };

/**
 * Re-sorts a list and reports the new id order. Used to arrange photos/reels by
 * name or date — the result is saved as the real order (works on touch, unlike
 * drag-and-drop). Manual drag remains available for fine-tuning on desktop.
 */
export function ArrangeMenu({
  items,
  onReorder,
}: {
  items: Item[];
  onReorder: (orderedIds: string[]) => void;
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

  const apply = (mode: "name" | "newest" | "oldest") => {
    const sorted = [...items].sort((a, b) => {
      if (mode === "name")
        return (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
          numeric: true,
        });
      const da = Date.parse(a.createdAt) || 0;
      const db = Date.parse(b.createdAt) || 0;
      return mode === "newest" ? db - da : da - db;
    });
    onReorder(sorted.map((i) => i.id));
    setOpen(false);
  };

  const options: { mode: "name" | "newest" | "oldest"; label: string; icon: typeof ArrowDownAZ }[] =
    [
      { mode: "name", label: "Name (A–Z)", icon: ArrowDownAZ },
      { mode: "newest", label: "Newest first", icon: ArrowDown10 },
      { mode: "oldest", label: "Oldest first", icon: ArrowUp10 },
    ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <ArrowDownUp className="h-4 w-4" />
        <span className="hidden sm:inline">Arrange</span>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-44 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1 shadow-3d backdrop-blur-xl animate-scale-in">
          {options.map((o) => (
            <button
              key={o.mode}
              onClick={() => apply(o.mode)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <o.icon className="h-4 w-4" /> {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
