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
 * The corners — and any area not covered by the image when zoomed out — are
 * left transparent, so the result is a true circular asset. Output is capped
 * to `size`px to keep data URLs small.
 */
export async function getCroppedCircle(
  src: string,
  area: CropArea,
  size = 512
): Promise<string> {
  const image = await loadImage(src);
  const target = Math.min(size, Math.max(1, Math.round(area.width)));
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Clip to a circle (the canvas starts fully transparent).
  ctx.beginPath();
  ctx.arc(target / 2, target / 2, target / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw the WHOLE image, scaled and offset so the crop area maps onto the
  // canvas. This works whether zoomed in (crop inside the image) or zoomed
  // out (crop larger than the image — the gaps stay transparent), which the
  // source-rectangle form of drawImage can't represent.
  const scale = target / area.width;
  ctx.drawImage(
    image,
    -area.x * scale,
    -area.y * scale,
    image.width * scale,
    image.height * scale
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
