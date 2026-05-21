import { NextResponse } from "next/server";
import { presignMediaUpload, r2Configured } from "@/lib/r2";
import { isAdmin } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin only. Returns a short-lived presigned PUT URL so the browser can
 * upload a media file straight to R2 (bypassing the serverless body limit),
 * plus the public URL the file will live at.
 */
export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { ok: false, error: "R2 storage is not configured" },
      { status: 503 }
    );
  }

  let contentType = "application/octet-stream";
  try {
    const body = await req.json();
    if (body?.contentType) contentType = String(body.contentType);
  } catch {
    /* default content type */
  }

  const { uploadUrl, url } = await presignMediaUpload(contentType);
  return NextResponse.json({ ok: true, uploadUrl, url });
}
