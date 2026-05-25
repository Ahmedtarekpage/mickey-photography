"use client";

import { Camera, Video, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * Picks a target category for moving or linking a brand. "move" lists every
 * other category; "link" lists categories the brand isn't already in.
 */
export function CategoryPicker({
  open,
  mode,
  brandName,
  currentIds,
  sourceCategoryId,
  onClose,
  onPick,
}: {
  open: boolean;
  mode: "move" | "link";
  brandName: string;
  /** Categories the brand already belongs to. */
  currentIds: string[];
  /** The category the picker was opened from (the "move from"). */
  sourceCategoryId: string;
  onClose: () => void;
  onPick: (categoryId: string) => void;
}) {
  const { categories } = useStore();

  const eligible = categories.filter((c) =>
    mode === "move" ? c.id !== sourceCategoryId : !currentIds.includes(c.id)
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "move" ? "Move brand" : "Add to category"}
      subtitle={
        mode === "move"
          ? `Move "${brandName}" to another category.`
          : `Show "${brandName}" in another category too — it stays one brand, edited in one place.`
      }
      footer={
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      {eligible.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          {mode === "move"
            ? "There are no other categories to move to."
            : "This brand is already in every category."}
        </p>
      ) : (
        <div className="space-y-2">
          {eligible.map((c) => {
            const isVideo = c.medium === "videography";
            const alreadyIn = currentIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-brand-fuchsia/40 hover:bg-white/[0.06]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.accent }}
                />
                <span className="flex-1 truncate font-medium text-white">
                  {c.name}
                </span>
                {alreadyIn && (
                  <span className="flex items-center gap-1 text-xs text-brand-fuchsia">
                    <Check className="h-3.5 w-3.5" /> already in
                  </span>
                )}
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                    "bg-white/10 text-slate-300"
                  )}
                >
                  {isVideo ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                  {isVideo ? "Video" : "Photo"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
