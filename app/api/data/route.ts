import { NextResponse } from "next/server";
import { getDataJson, putDataJson, sweepOrphans, r2Configured } from "@/lib/r2";
import { isAdmin } from "@/lib/serverAuth";
import { SEED } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" } as const;

/** Public: returns the site content. Falls back to the seed sample when R2
 *  isn't configured or no document has been saved yet. */
export async function GET() {
  if (!r2Configured()) {
    return NextResponse.json(SEED, { headers: noStore });
  }
  try {
    const json = await getDataJson();
    if (!json) return NextResponse.json(SEED, { headers: noStore });
    return new NextResponse(json, {
      headers: { "Content-Type": "application/json", ...noStore },
    });
  } catch {
    // Never break the public site on a storage hiccup — show the sample.
    return NextResponse.json(SEED, { headers: noStore });
  }
}

/** Admin only: overwrite the whole content document. */
export async function PUT(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { ok: false, error: "R2 storage is not configured" },
      { status: 503 }
    );
  }
  const body = await req.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(body); // reject anything that isn't valid JSON
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  await putDataJson(body);

  // Prune media that's no longer referenced (best-effort — never fail the save).
  let cleaned = 0;
  try {
    const { deleted } = await sweepOrphans(parsed);
    cleaned = deleted.length;
  } catch {
    /* leave orphans for the next save */
  }
  return NextResponse.json({ ok: true, cleaned });
}
