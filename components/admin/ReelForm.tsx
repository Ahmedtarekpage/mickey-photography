"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ImageInput } from "@/components/ui/ImageInput";
import { VideoInput } from "@/components/ui/VideoInput";
import type { Reel } from "@/lib/types";

export type ReelDraft = {
  title: string;
  videoUrl: string;
  thumbnail: string;
  durationSec: string;
};

const empty: ReelDraft = {
  title: "",
  videoUrl: "",
  thumbnail: "",
  durationSec: "",
};

export function ReelForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: ReelDraft) => void;
  initial?: Reel | null;
}) {
  const [draft, setDraft] = useState<ReelDraft>(empty);

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              title: initial.title,
              videoUrl: initial.videoUrl,
              thumbnail: initial.thumbnail,
              durationSec: initial.durationSec?.toString() ?? "",
            }
          : empty
      );
    }
  }, [open, initial]);

  const set = <K extends keyof ReelDraft>(k: K, v: ReelDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = draft.title.trim().length > 0 && draft.videoUrl.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit reel" : "Add BTS reel"}
      subtitle="A behind-the-scenes vertical video for this brand."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            {initial ? "Save changes" : "Add reel"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Video" hint="(upload or paste a link)">
          <VideoInput
            value={draft.videoUrl}
            onChange={(v) => set("videoUrl", v)}
            onMeta={(m) => {
              if (m.poster && !draft.thumbnail) set("thumbnail", m.poster);
              if (m.durationSec && !draft.durationSec)
                set("durationSec", String(m.durationSec));
            }}
          />
        </Field>
        <Field label="Title">
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. BTS — studio lighting setup"
            autoFocus
          />
        </Field>
        <Field label="Cover / thumbnail" hint="(auto-filled from the video)">
          <ImageInput
            value={draft.thumbnail}
            onChange={(v) => set("thumbnail", v)}
            aspect="portrait"
          />
        </Field>
        <Field label="Duration (seconds)" hint="(optional)">
          <Input
            type="number"
            min={0}
            value={draft.durationSec}
            onChange={(e) => set("durationSec", e.target.value)}
            placeholder="e.g. 38"
          />
        </Field>
      </div>
    </Modal>
  );
}
