"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ImageInput } from "@/components/ui/ImageInput";
import type { Category, Medium } from "@/lib/types";

const ACCENTS = [
  "#d946ef",
  "#22d3ee",
  "#a3e635",
  "#fbbf24",
  "#ec4899",
  "#7c3aed",
  "#f97316",
  "#10b981",
];

export type CategoryDraft = {
  name: string;
  description: string;
  coverImage: string;
  accent: string;
};

const empty: CategoryDraft = {
  name: "",
  description: "",
  coverImage: "",
  accent: ACCENTS[0],
};

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  initial,
  medium,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: CategoryDraft) => void;
  initial?: Category | null;
  medium?: Medium;
}) {
  const [draft, setDraft] = useState<CategoryDraft>(empty);

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              name: initial.name,
              description: initial.description,
              coverImage: initial.coverImage,
              accent: initial.accent,
            }
          : empty
      );
    }
  }, [open, initial]);

  const set = <K extends keyof CategoryDraft>(k: K, v: CategoryDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = draft.name.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit category" : "New category"}
      subtitle={
        medium
          ? `${medium === "videography" ? "Videography" : "Photography"} category — holds brands.`
          : "Top-level grouping that holds brands."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            {initial ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Logo" hint="(circular)">
          <ImageInput
            value={draft.coverImage}
            onChange={(v) => set("coverImage", v)}
            shape="circle"
          />
        </Field>
        <Field label="Name">
          <Input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Automotive"
            autoFocus
          />
        </Field>
        <Field label="Description" hint="(optional)">
          <Textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short summary shown on the category card."
          />
        </Field>
        <Field label="Accent color">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("accent", c)}
                style={{ backgroundColor: c }}
                className={`h-9 w-9 rounded-full transition ${
                  draft.accent === c
                    ? "ring-2 ring-white ring-offset-2 ring-offset-ink-850"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
