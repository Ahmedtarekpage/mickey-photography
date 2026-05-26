"use client";

import { useEffect, useState } from "react";
import { Star, Check, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ImageInput } from "@/components/ui/ImageInput";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { Brand } from "@/lib/types";

export type BrandDraft = {
  name: string;
  logo: string;
  thumbnail: string;
  description: string;
  website: string;
  featured: boolean;
  showInMarquee: boolean;
};

const empty: BrandDraft = {
  name: "",
  logo: "",
  thumbnail: "",
  description: "",
  website: "",
  featured: false,
  showInMarquee: true,
};

export function BrandForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: BrandDraft) => void;
  initial?: Brand | null;
}) {
  const [draft, setDraft] = useState<BrandDraft>(empty);

  // Photos already uploaded to this brand — offered as ready-made thumbnails.
  const { photos } = useStore();
  const brandPhotos = initial
    ? photos.filter((p) => p.brandId === initial.id && p.url)
    : [];

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              name: initial.name,
              logo: initial.logo,
              thumbnail: initial.thumbnail ?? "",
              description: initial.description,
              website: initial.website ?? "",
              featured: initial.featured,
              showInMarquee: initial.showInMarquee ?? true,
            }
          : empty
      );
    }
  }, [open, initial]);

  const set = <K extends keyof BrandDraft>(k: K, v: BrandDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = draft.name.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit brand" : "New brand"}
      subtitle="Brands display as circular logos inside the category."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            {initial ? "Save changes" : "Create brand"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Logo" hint="(shown in a circle)">
          <ImageInput
            value={draft.logo}
            onChange={(v) => set("logo", v)}
            shape="circle"
          />
        </Field>
        <Field
          label="Card thumbnail"
          hint="(public work page — upload & crop, or pick a brand photo below)"
        >
          <ImageInput
            value={draft.thumbnail}
            onChange={(v) => set("thumbnail", v)}
            shape="rect"
            aspect="landscape"
            label="Thumbnail"
          />

          {brandPhotos.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs text-slate-400">
                Or choose from this brand&apos;s photos
              </p>
              <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto pr-1 scroll-slim">
                {brandPhotos.map((p) => {
                  const selected = draft.thumbnail === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set("thumbnail", selected ? "" : p.url)}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border transition",
                        selected
                          ? "border-brand-fuchsia ring-2 ring-brand-fuchsia"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.title || "Brand photo"}
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center bg-brand-fuchsia/25">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-fuchsia text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Field>
        <Field label="Brand name">
          <Input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Velocity Motors"
            autoFocus
          />
        </Field>
        <Field label="Description" hint="(optional)">
          <Textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What is this brand / campaign about?"
          />
        </Field>
        <Field label="Website" hint="(optional)">
          <Input
            value={draft.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <button
          type="button"
          onClick={() => set("featured", !draft.featured)}
          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
            draft.featured
              ? "border-brand-amber/40 bg-brand-amber/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <span className="flex items-center gap-3">
            <Star
              className={`h-5 w-5 ${
                draft.featured ? "fill-brand-amber text-brand-amber" : "text-slate-500"
              }`}
            />
            <span>
              <span className="block text-sm font-medium text-white">
                Featured brand
              </span>
              <span className="block text-xs text-slate-400">
                Highlight on the dashboard overview.
              </span>
            </span>
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition ${
              draft.featured ? "bg-brand-amber" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                draft.featured ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={() => set("showInMarquee", !draft.showInMarquee)}
          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
            draft.showInMarquee
              ? "border-brand-cyan/40 bg-brand-cyan/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <span className="flex items-center gap-3">
            <Eye
              className={`h-5 w-5 ${
                draft.showInMarquee ? "text-brand-cyan" : "text-slate-500"
              }`}
            />
            <span>
              <span className="block text-sm font-medium text-white">
                Show in brands strip
              </span>
              <span className="block text-xs text-slate-400">
                The scrolling logos on the home page (&ldquo;Brands we&apos;ve
                created for&rdquo;).
              </span>
            </span>
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition ${
              draft.showInMarquee ? "bg-brand-cyan" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                draft.showInMarquee ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    </Modal>
  );
}
