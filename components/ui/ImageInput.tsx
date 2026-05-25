"use client";

import { useRef, useState } from "react";
import { Upload, Link2, ImageIcon, Loader2, Crop } from "lucide-react";
import { cn } from "@/lib/cn";
import { uploadDataUrl } from "@/lib/uploadMedia";
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
 * are cropped before upload; rectangular images can be re-cropped in the same
 * session via the Crop button. Selected/cropped images are uploaded to R2 and
 * the stored value is the resulting public URL (not a data URL).
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
  const [err, setErr] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  // The data URL of the current image, kept so it can be re-cropped this
  // session (the saved value is a remote URL, which a canvas can't read).
  const [localData, setLocalData] = useState<string | null>(null);
  const isCircle = shape === "circle";
  const cropShape = isCircle ? "round" : "rect";
  const cropAspect = isCircle ? 1 : aspectRatio[aspect];

  // Any selected image can be cropped — uploads use their local data URL,
  // remote images (e.g. a picked brand photo) are loaded cross-origin.
  const canCrop = !!value;

  // Upload a data URL to R2 and store the returned public URL.
  const commit = async (dataUrl: string) => {
    setLoading(true);
    setErr("");
    try {
      const url = await uploadDataUrl(dataUrl);
      setLocalData(dataUrl);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // Logos always go through the crop step; other images upload directly
      // and can be re-cropped afterwards with the Crop button.
      if (isCircle) {
        setLocalData(dataUrl);
        setCropSrc(dataUrl);
      } else {
        commit(dataUrl);
      }
    };
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

      {err && <p className="text-center text-xs text-red-400">{err}</p>}

      {/* Crop / re-crop the current image (only while we still hold its data). */}
      {canCrop && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCropSrc(localData ?? value)}
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
          onChange={(e) => {
            setLocalData(null);
            onChange(e.target.value);
          }}
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
          setCropSrc(null);
          commit(dataUrl);
        }}
      />
    </div>
  );
}
