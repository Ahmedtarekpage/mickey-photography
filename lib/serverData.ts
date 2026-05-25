import { getDataJson, r2Configured } from "@/lib/r2";
import type { DataShape } from "@/lib/types";

/**
 * Server-side read of the full content document, so the public site can be
 * rendered with the live admin data on first paint — no flash of the bundled
 * seed (default logo/reel) before the client fetch lands.
 *
 * Returns null when R2 is unset/empty or on any error; the client store then
 * falls back to fetching `/api/data` (and ultimately the seed) as before.
 */
export async function getInitialData(): Promise<Partial<DataShape> | null> {
  if (!r2Configured()) return null;
  try {
    const json = await getDataJson();
    if (!json) return null;
    return JSON.parse(json) as Partial<DataShape>;
  } catch {
    return null;
  }
}
