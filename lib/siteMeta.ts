import { getDataJson, r2Configured } from "@/lib/r2";
import { SEED } from "@/lib/seed";

/**
 * Server-side read of the bits needed for <head> metadata (title + favicon).
 * Reads the live content document from R2 so the browser tab reflects the
 * name/logo set in admin; falls back to the seed when R2 is unset or empty.
 */
export async function getSiteMeta(): Promise<{
  siteName: string;
  logo: string;
  tagline: string;
}> {
  const fallback = {
    siteName: SEED.settings.siteName,
    logo: SEED.settings.logo,
    tagline: SEED.settings.tagline,
  };
  if (!r2Configured()) return fallback;
  try {
    const json = await getDataJson();
    if (!json) return fallback;
    const s = (JSON.parse(json)?.settings ?? {}) as Partial<typeof fallback>;
    return {
      siteName: (s.siteName || fallback.siteName).trim(),
      logo: s.logo || fallback.logo,
      tagline: s.tagline || fallback.tagline,
    };
  } catch {
    return fallback;
  }
}
