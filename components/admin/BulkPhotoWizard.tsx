"use client";

import { useEffect, useState } from "react";
import {
  RectangleHorizontal,
  RectangleVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { uploadFile } from "@/lib/uploadMedia";
import type { Orientation } from "@/lib/types";

export type BulkItem = {
  title: string;
  orientation: Orientation;
  showName: boolean;
  url: string;
};

type WorkItem = {
  preview: string; // local object URL for instant preview
  url: string | null; // R2 URL once uploaded
  failed: boolean;
  title: string;
  orientation: Orientation;
  touched: boolean; // user changed orientation — don't overwrite with auto-detect
  showName: boolean;
};

/** "name.JPG" -> "name" */
function nameFromFile(n: string): string {
  return n.replace(/\.[^.]+$/, "").trim() || n;
}

function detectOrientation(file: File): Promise<Orientation> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth >= img.naturalHeight ? "landscape" : "portrait");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("landscape");
    };
    img.src = url;
  });
}

/**
 * Steps through each selected file so the user can set its name, orientation
 * and name-visibility, then saves them all at once. Uploads run in the
 * background while the user fills in details.
 */
export function BulkPhotoWizard({
  open,
  files,
  onClose,
  onSave,
}: {
  open: boolean;
  files: File[];
  onClose: () => void;
  onSave: (items: BulkItem[]) => void;
}) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [i, setI] = useState(0);

  // Build items + kick off detection/upload whenever a new batch opens.
  useEffect(() => {
    if (!open || files.length === 0) return;
    let cancelled = false;
    const initial: WorkItem[] = files.map((f) => ({
      preview: URL.createObjectURL(f),
      url: null,
      failed: false,
      title: nameFromFile(f.name),
      orientation: "landscape",
      touched: false,
      showName: false,
    }));
    setItems(initial);
    setI(0);

    files.forEach((f, idx) => {
      detectOrientation(f).then((o) => {
        if (cancelled) return;
        setItems((prev) =>
          prev.map((it, k) =>
            k === idx && !it.touched ? { ...it, orientation: o } : it
          )
        );
      });
      uploadFile(f)
        .then((url) => {
          if (!cancelled)
            setItems((prev) =>
              prev.map((it, k) => (k === idx ? { ...it, url } : it))
            );
        })
        .catch(() => {
          if (!cancelled)
            setItems((prev) =>
              prev.map((it, k) => (k === idx ? { ...it, failed: true } : it))
            );
        });
    });

    return () => {
      cancelled = true;
      initial.forEach((it) => URL.revokeObjectURL(it.preview));
    };
  }, [open, files]);

  const cur = items[i];
  const isLast = i === items.length - 1;
  const settled = items.filter((it) => it.url || it.failed).length;
  const allSettled = items.length > 0 && settled === items.length;
  const readyCount = items.filter((it) => it.url).length;

  const set = (patch: Partial<WorkItem>) =>
    setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...patch } : it)));

  const save = () => {
    onSave(
      items
        .filter((it) => it.url)
        .map((it) => ({
          title: it.title,
          orientation: it.orientation,
          showName: it.showName,
          url: it.url as string,
        }))
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={items.length ? `Image ${i + 1} of ${items.length}` : "Upload images"}
      subtitle="Set each photo's details, then save them all."
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {isLast ? (
            <Button
              onClick={save}
              disabled={!allSettled || readyCount === 0}
              loading={!allSettled}
            >
              {allSettled
                ? `Save all (${readyCount})`
                : `Uploading ${settled}/${items.length}…`}
            </Button>
          ) : (
            <Button
              onClick={() => setI((n) => Math.min(items.length - 1, n + 1))}
              disabled={!cur}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </>
      }
    >
      {!cur ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Thumbnail strip — jump between images, see upload status */}
          {items.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scroll-slim">
              {items.map((it, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setI(k)}
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition",
                    k === i
                      ? "border-brand-fuchsia ring-2 ring-brand-fuchsia"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.preview} alt="" className="h-full w-full object-cover" />
                  {!it.url && !it.failed && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </span>
                  )}
                  {it.failed && (
                    <span className="absolute inset-0 flex items-center justify-center bg-red-950/60">
                      <AlertTriangle className="h-4 w-4 text-red-300" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className="relative mx-auto flex max-h-[40vh] items-center justify-center overflow-hidden rounded-2xl bg-ink-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cur.preview}
              alt={cur.title}
              className="max-h-[40vh] w-auto object-contain"
            />
            {!cur.url && !cur.failed && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
              </span>
            )}
            {cur.failed && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-950/80 px-2 py-0.5 text-[11px] text-red-200 backdrop-blur">
                <AlertTriangle className="h-3 w-3" /> Upload failed — will be skipped
              </span>
            )}
          </div>

          {/* Name */}
          <Field
            label="Name"
            hint="(used as the image's alt text for SEO)"
          >
            <Input
              value={cur.title}
              onChange={(e) => set({ title: e.target.value })}
            />
          </Field>

          {/* Orientation */}
          <Field label="Orientation">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { v: "landscape", label: "Landscape", Icon: RectangleHorizontal },
                  { v: "portrait", label: "Portrait", Icon: RectangleVertical },
                ] as const
              ).map(({ v, label, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set({ orientation: v, touched: true })}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    cur.orientation === v
                      ? "border-brand-fuchsia/50 bg-brand-gradient-soft text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Show name */}
          <button
            type="button"
            onClick={() => set({ showName: !cur.showName })}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
              cur.showName
                ? "border-brand-fuchsia/40 bg-brand-fuchsia/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
            )}
          >
            <span className="flex items-center gap-3">
              <Eye
                className={cn(
                  "h-5 w-5",
                  cur.showName ? "text-brand-fuchsia" : "text-slate-500"
                )}
              />
              <span className="text-sm font-medium text-white">
                Show name on the site
              </span>
            </span>
            <span
              className={cn(
                "relative h-6 w-11 rounded-full transition",
                cur.showName ? "bg-brand-fuchsia" : "bg-white/15"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                  cur.showName ? "left-[22px]" : "left-0.5"
                )}
              />
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
}
