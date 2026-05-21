"use client";

import { useRef, useState } from "react";
import { Upload, Link2, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { isIdbRef } from "@/lib/mediaStore";
import { useMediaSrc } from "@/lib/useMediaSrc";
import { uploadFile, uploadDataUrl } from "@/lib/uploadMedia";

export interface VideoMeta {
  poster?: string;
  durationSec?: number;
}

interface VideoInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called after an upload with an auto-extracted poster frame + duration. */
  onMeta?: (meta: VideoMeta) => void;
}

/** Pulls a poster frame (data URL) and duration out of an uploaded video file. */
function extractMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (meta: VideoMeta) => {
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    video.preload = "metadata";
    video.muted = true;
    video.src = url;
    video.onloadedmetadata = () => {
      const durationSec =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration)
          : undefined;
      // Seek a touch in to grab a representative frame.
      video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
      video.onseeked = () => {
        try {
          const w = 640;
          const ratio = video.videoHeight / video.videoWidth || 0.5625;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = Math.round(w * ratio);
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          done({ poster: canvas.toDataURL("image/jpeg", 0.7), durationSec });
        } catch {
          done({ durationSec });
        }
      };
    };
    video.onerror = () => done({});
  });
}

export function VideoInput({ value, onChange, onMeta }: VideoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const resolved = useMediaSrc(value);

  const [err, setErr] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setErr("");
    try {
      const meta = await extractMeta(file).catch(() => ({} as VideoMeta));
      // Upload the auto-extracted poster frame too, so it persists in R2.
      let poster = meta.poster;
      if (poster) {
        poster = await uploadDataUrl(poster).catch(() => undefined);
      }
      const url = await uploadFile(file);
      onChange(url);
      if (onMeta) onMeta({ ...meta, poster });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition hover:border-brand-fuchsia/40"
      >
        {resolved ? (
          <video
            src={resolved}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-500">
            <Film className="h-6 w-6" />
            <span className="px-2 text-center text-xs">Click to upload a video</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          {loading ? (
            <span className="flex items-center gap-2 text-xs font-medium text-white">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Upload className="h-4 w-4" /> {value ? "Replace video" : "Upload video"}
            </span>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {err && <p className="text-center text-xs text-red-400">{err}</p>}

      <div className="relative">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={isIdbRef(value) ? "" : value}
          placeholder={isIdbRef(value) ? "Uploaded video" : "or paste video URL"}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none transition focus:border-brand-fuchsia/50"
          )}
        />
      </div>
    </div>
  );
}
