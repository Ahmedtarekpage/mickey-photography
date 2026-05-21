"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import {
  getCroppedCircle,
  getCroppedRect,
  type CropArea,
} from "@/lib/cropImage";

export function CropModal({
  open,
  src,
  shape = "round",
  aspect = 1,
  onCancel,
  onCropped,
}: {
  open: boolean;
  /** Source image (data URL). */
  src: string;
  /** "round" for circular logos, "rect" for thumbnails/photos. */
  shape?: "round" | "rect";
  /** Crop box aspect ratio (width / height). */
  aspect?: number;
  onCancel: () => void;
  onCropped: (dataUrl: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: unknown, px: CropArea) => {
    setArea(px);
  }, []);

  const isRound = shape === "round";

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const out = isRound
        ? await getCroppedCircle(src, area)
        : await getCroppedRect(src, area);
      onCropped(out);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isRound ? "Crop logo" : "Crop image"}
      subtitle={
        isRound
          ? "Drag to reposition, zoom to fit. The logo is cropped to a circle."
          : "Drag to reposition, zoom to fit the frame."
      }
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button loading={busy} onClick={apply}>
            Apply crop
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-ink-950">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={isRound ? "round" : "rect"}
            showGrid={!isRound}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-brand-fuchsia"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
      </div>
    </Modal>
  );
}
