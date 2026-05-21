import { NextResponse } from "next/server";
import { getDataJson, sweepOrphans, r2Configured } from "@/lib/r2";
import { isAdmin } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin only. Deletes media in R2 that the current content no longer references. */
export async function POST() {
  if (!isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { ok: false, error: "R2 storage is not configured" },
      { status: 503 }
    );
  }
  const json = await getDataJson();
  const data = json ? JSON.parse(json) : {};
  const { deleted, kept } = await sweepOrphans(data);
  return NextResponse.json({ ok: true, deleted, kept });
}
