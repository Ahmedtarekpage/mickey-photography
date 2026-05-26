"use client";

import { useEffect, useState } from "react";
import {
  RectangleHorizontal,
  RectangleVertical,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ImageInput } from "@/components/ui/ImageInput";
import { VideoInput } from "@/components/ui/VideoInput";
import { cn } from "@/lib/cn";
import type { Orientation, Photo } from "@/lib/types";

export type PhotoDraft = {
  title: string;
  showName: boolean;
  orientation: Orientation;
  url: string;
  videoUrl: string;
  durationSec: string;
  beforeUrl: string;
  afterUrl: string;
  hasComparison: boolean;
};

const empty: PhotoDraft = {
  title: "",
  showName: false,
  orientation: "landscape",
  url: "",
  videoUrl: "",
  durationSec: "",
  beforeUrl: "",
  afterUrl: "",
  hasComparison: false,
};

export function PhotoForm({
  open,
  onClose,
  onSubmit,
  initial,
  mode = "photo",
  allowComparison = true,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: PhotoDraft) => void;
  initial?: Photo | null;
  /** "photo" = image item, "video" = video item (videography). */
  mode?: "photo" | "video";
  /** Whether the before/after option is offered (photography BTS gallery only). */
  allowComparison?: boolean;
}) {
  const [draft, setDraft] = useState<PhotoDraft>(empty);
  const isVideo = mode === "video";

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              title: initial.title,
              showName: initial.showName ?? false,
              orientation: initial.orientation,
              url: initial.url,
              videoUrl: initial.videoUrl ?? "",
              durationSec: initial.durationSec?.toString() ?? "",
              beforeUrl: initial.beforeUrl ?? "",
              afterUrl: initial.afterUrl ?? "",
              hasComparison: !!(initial.beforeUrl && initial.afterUrl),
            }
          : empty
      );
    }
  }, [open, initial]);

  const set = <K extends keyof PhotoDraft>(k: K, v: PhotoDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = isVideo
    ? draft.title.trim().length > 0 && draft.videoUrl.trim().length > 0
    : draft.title.trim().length > 0 &&
      draft.url.trim().length > 0 &&
      (!draft.hasComparison ||
        (draft.beforeUrl.trim().length > 0 && draft.afterUrl.trim().length > 0));

  const aspect = draft.orientation === "portrait" ? "portrait" : "landscape";

  const noun = isVideo ? "video" : "photo";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${initial ? "Edit" : "Add"} ${noun}`}
      subtitle={
        isVideo
          ? "Video item with a poster thumbnail."
          : "Gallery image with optional before/after comparison."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            {initial ? "Save changes" : `Add ${noun}`}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field
          label="Name"
          hint="(used as the image's alt text for SEO — search engines read it)"
        >
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={
              isVideo ? "e.g. Hero spot — 30s cut" : "e.g. Hero — front three-quarter"
            }
            autoFocus
          />
        </Field>

        <button
          type="button"
          onClick={() => set("showName", !draft.showName)}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
            draft.showName
              ? "border-brand-fuchsia/40 bg-brand-fuchsia/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          )}
        >
          <span className="flex items-center gap-3">
            <Eye
              className={cn(
                "h-5 w-5",
                draft.showName ? "text-brand-fuchsia" : "text-slate-500"
              )}
            />
            <span>
              <span className="block text-sm font-medium text-white">
                Show name on the site
              </span>
              <span className="block text-xs text-slate-400">
                Display the name as a caption. Off = used for SEO only (hidden).
              </span>
            </span>
          </span>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              draft.showName ? "bg-brand-fuchsia" : "bg-white/15"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                draft.showName ? "left-[22px]" : "left-0.5"
              )}
            />
          </span>
        </button>

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
                onClick={() => set("orientation", v)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  draft.orientation === v
                    ? "border-brand-fuchsia/50 bg-brand-gradient-soft text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </Field>

        {isVideo ? (
          <>
            <Field label="Video" hint="(upload or paste a link)">
              <VideoInput
                value={draft.videoUrl}
                onChange={(v) => set("videoUrl", v)}
                onMeta={(m) => {
                  if (m.poster && !draft.url) set("url", m.poster);
                  if (m.durationSec && !draft.durationSec)
                    set("durationSec", String(m.durationSec));
                }}
              />
            </Field>
            <Field label="Poster / thumbnail" hint="(auto-filled from the video)">
              <ImageInput
                value={draft.url}
                onChange={(v) => set("url", v)}
                aspect={aspect}
              />
            </Field>
            <Field label="Duration (seconds)" hint="(optional)">
              <Input
                type="number"
                min={0}
                value={draft.durationSec}
                onChange={(e) => set("durationSec", e.target.value)}
                placeholder="e.g. 30"
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Photo">
              <ImageInput
                value={draft.url}
                onChange={(v) => set("url", v)}
                aspect={aspect}
              />
            </Field>

            {/* Before/After toggle (photography BTS gallery only) */}
            {allowComparison && (
              <>
                <button
                  type="button"
                  onClick={() => set("hasComparison", !draft.hasComparison)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                    draft.hasComparison
                      ? "border-brand-cyan/40 bg-brand-cyan/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <SlidersHorizontal
                      className={cn(
                        "h-5 w-5",
                        draft.hasComparison ? "text-brand-cyan" : "text-slate-500"
                      )}
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Before / after comparison
                      </span>
                      <span className="block text-xs text-slate-400">
                        Adds a draggable slider between two images.
                      </span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      "relative h-6 w-11 rounded-full transition",
                      draft.hasComparison ? "bg-brand-cyan" : "bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                        draft.hasComparison ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </span>
                </button>

                {draft.hasComparison && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
                    <Field label="Before image">
                      <ImageInput
                        value={draft.beforeUrl}
                        onChange={(v) => set("beforeUrl", v)}
                        aspect={aspect}
                      />
                    </Field>
                    <Field label="After image">
                      <ImageInput
                        value={draft.afterUrl}
                        onChange={(v) => set("afterUrl", v)}
                        aspect={aspect}
                      />
                    </Field>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
