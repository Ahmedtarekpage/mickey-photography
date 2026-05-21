"use client";

import { useRef, useState } from "react";
import { Upload, Link2, ImageIcon, Loader2, Crop } from "lucide-react";
import { cn } from "@/lib/cn";
import { CropModal } from "./CropModal";

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
  shape?: "circle" | "rect";
  /** aspect for rect previews, e.g. "video", "portrait", "landscape" */
  aspect?: "video" | "portrait" | "landscape" | "square";
  label?: string;
}

const aspectClass: Record<string, string> = {
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

const aspectRatio: Record<string, number> = {
  video: 16 / 9,
  portrait: 3 / 4,
  landscape: 4 / 3,
  square: 1,
};

/**
 * Lets the user provide an image by URL or by uploading a file. Circular images
 * are cropped on upload; rectangular images can be cropped after upload via the
 * Crop button. Uploaded files are read into a data URL (prototype-friendly).
 */
export function ImageInput({
  value,
  onChange,
  shape = "rect",
  aspect = "landscape",
  label = "Image",
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const isCircle = shape === "circle";
  const cropShape = isCircle ? "round" : "rect";
  const cropAspect = isCircle ? 1 : aspectRatio[aspect];

  // Only data: URLs are safe to crop on a canvas (remote URLs taint it).
  const canCrop = value.startsWith("data:");

  const handleFile = (file?: File) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setLoading(false);
      // Logos always go through the crop step; other images upload directly
      // and can be cropped afterwards with the Crop button.
      if (isCircle) setCropSrc(dataUrl);
      else onChange(dataUrl);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2.5">
      {/* Trigger — a button, with the file input kept OUTSIDE so the
          programmatic click can't bubble back and re-open the dialog. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative block cursor-pointer overflow-hidden border border-white/10 bg-white/[0.04] transition hover:border-brand-fuchsia/40",
          isCircle
            ? "mx-auto aspect-square w-28 rounded-full"
            : cn("w-full rounded-2xl", aspectClass[aspect])
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-500">
            <ImageIcon className="h-6 w-6" />
            <span className="px-2 text-center text-xs">Click to upload</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              {isCircle ? (
                <Crop className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {value ? "Replace" : isCircle ? "Upload & crop" : "Upload"}
            </span>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          // Reset so selecting the same file again still fires onChange.
          e.target.value = "";
        }}
      />

      {/* Crop / re-crop the current image (only possible for uploaded images). */}
      {canCrop && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCropSrc(value)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Crop className="h-3.5 w-3.5" /> Crop image
          </button>
        </div>
      )}

      <div className="relative">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={value.startsWith("data:") ? "" : value}
          placeholder={
            value.startsWith("data:") ? "Uploaded image" : "or paste image URL"
          }
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none transition focus:border-brand-fuchsia/50"
        />
      </div>

      <CropModal
        open={!!cropSrc}
        src={cropSrc ?? ""}
        shape={cropShape}
        aspect={cropAspect}
        onCancel={() => setCropSrc(null)}
        onCropped={(dataUrl) => {
          onChange(dataUrl);
          setCropSrc(null);
        }}
      />
    </div>
  );
}
