export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

/**
 * Produces a circular logo from a source image and a square crop area.
 * The corners are made transparent so the result is a true circular asset.
 * Output is capped to `size`px to keep data URLs small for localStorage.
 */
export async function getCroppedCircle(
  src: string,
  area: CropArea,
  size = 512
): Promise<string> {
  const image = await loadImage(src);
  const target = Math.min(size, Math.round(area.width));
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Clip to a circle, then draw the cropped square scaled to the canvas.
  ctx.beginPath();
  ctx.arc(target / 2, target / 2, target / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    target,
    target
  );

  return canvas.toDataURL("image/png");
}

/**
 * Produces a rectangular crop. Capped to `maxWidth`px and encoded as JPEG to
 * keep the resulting data URL small enough for localStorage.
 */
export async function getCroppedRect(
  src: string,
  area: CropArea,
  maxWidth = 1280
): Promise<string> {
  const image = await loadImage(src);
  const scale = Math.min(1, maxWidth / area.width);
  const w = Math.max(1, Math.round(area.width * scale));
  const h = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}
