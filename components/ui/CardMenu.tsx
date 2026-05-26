"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2, FolderInput, CopyPlus } from "lucide-react";

export function CardMenu({
  onEdit,
  onDelete,
  onMove,
  onLink,
  deleteLabel = "Delete",
}: {
  onEdit: () => void;
  onDelete: () => void;
  /** Optional — shows a "Move to…" item. */
  onMove?: () => void;
  /** Optional — shows an "Add to category…" item. */
  onLink?: () => void;
  /** Override the delete item's label (e.g. "Remove from category"). */
  deleteLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_W = 176; // w-44
  const itemCount = 2 + (onMove ? 1 : 0) + (onLink ? 1 : 0);
  const menuH = itemCount * 40 + 10;

  // Position the (portaled) menu under the trigger, flipping up / clamping to
  // the viewport so it's never clipped by a card's overflow.
  const place = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8));
    const top =
      r.bottom + 6 + menuH > window.innerHeight - 8
        ? Math.max(8, r.top - menuH - 6)
        : r.bottom + 6;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const reposition = () => place();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const run = (e: React.MouseEvent, fn: () => void) => {
    stop(e);
    setOpen(false);
    fn();
  };

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition";

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-950/50 text-slate-200 backdrop-blur transition hover:bg-ink-950/80"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={stop}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: MENU_W }}
            className="z-50 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1 shadow-3d backdrop-blur-xl animate-scale-in"
          >
            <button
              onClick={(e) => run(e, onEdit)}
              className={`${itemClass} text-slate-200 hover:bg-white/10`}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            {onMove && (
              <button
                onClick={(e) => run(e, onMove)}
                className={`${itemClass} text-slate-200 hover:bg-white/10`}
              >
                <FolderInput className="h-4 w-4" /> Move to…
              </button>
            )}
            {onLink && (
              <button
                onClick={(e) => run(e, onLink)}
                className={`${itemClass} text-slate-200 hover:bg-white/10`}
              >
                <CopyPlus className="h-4 w-4" /> Add to category…
              </button>
            )}
            <button
              onClick={(e) => run(e, onDelete)}
              className={`${itemClass} text-red-300 hover:bg-red-500/15`}
            >
              <Trash2 className="h-4 w-4" /> {deleteLabel}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
