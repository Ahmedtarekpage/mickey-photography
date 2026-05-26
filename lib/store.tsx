"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type {
  Brand,
  Category,
  Country,
  DataShape,
  Photo,
  Reel,
  SiteSettings,
  Stat,
} from "./types";
import { SEED } from "./seed";

/** Backfill fields added after older documents were saved, so the shape stays valid. */
function migrate(parsed: Partial<DataShape>): DataShape {
  return {
    settings: { ...SEED.settings, ...parsed.settings },
    stats: parsed.stats ?? SEED.stats,
    countries: parsed.countries ?? SEED.countries,
    categories: (parsed.categories ?? []).map((c) => ({
      ...c,
      medium: c.medium ?? "photography",
    })),
    brands: (parsed.brands ?? []).map((b) => {
      // Older brands carried a single `categoryId`; normalize to `categoryIds`.
      const legacy = b as Brand & { categoryId?: string };
      const categoryIds = legacy.categoryIds?.length
        ? legacy.categoryIds
        : legacy.categoryId
        ? [legacy.categoryId]
        : [];
      return { ...b, categoryIds };
    }),
    photos: (parsed.photos ?? []).map((p) => ({
      ...p,
      section: p.section ?? (p.beforeUrl && p.afterUrl ? "bts" : "gallery"),
    })),
    reels: parsed.reels ?? [],
  };
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type NewCategory = Omit<Category, "id" | "createdAt" | "slug">;
type NewBrand = Omit<Brand, "id" | "createdAt">;
type NewPhoto = Omit<Photo, "id" | "createdAt">;
type NewReel = Omit<Reel, "id" | "createdAt">;
type NewStat = Omit<Stat, "id" | "createdAt">;
type NewCountry = Omit<Country, "id" | "createdAt">;

interface StoreContextValue extends DataShape {
  ready: boolean;
  // Categories
  addCategory: (c: NewCategory) => Category;
  updateCategory: (id: string, patch: Partial<NewCategory>) => void;
  deleteCategory: (id: string) => void;
  /** Reorder the given categories (e.g. one medium's list) into `orderedIds`,
   *  leaving any categories not in that set in their existing positions. */
  reorderCategories: (orderedIds: string[]) => void;
  // Brands
  addBrand: (b: NewBrand) => Brand;
  updateBrand: (id: string, patch: Partial<NewBrand>) => void;
  deleteBrand: (id: string) => void;
  /** Reorder the given brands (e.g. one category's list) into `orderedIds`,
   *  leaving any brands not in that set in their existing positions. */
  reorderBrands: (orderedIds: string[]) => void;
  /** Move a brand from one category to another. */
  moveBrand: (id: string, fromCategoryId: string, toCategoryId: string) => void;
  /** Link a brand into an additional category (same record, shown in both). */
  linkBrandToCategory: (id: string, categoryId: string) => void;
  /** Remove a brand from one category, keeping it in any others. */
  unlinkBrandFromCategory: (id: string, categoryId: string) => void;
  // Photos
  addPhoto: (p: NewPhoto) => Photo;
  updatePhoto: (id: string, patch: Partial<NewPhoto>) => void;
  deletePhoto: (id: string) => void;
  /** Reorder the given photos (e.g. one brand section) into `orderedIds`,
   *  leaving any photos not in that set in their existing positions. */
  reorderPhotos: (orderedIds: string[]) => void;
  // Reels
  addReel: (r: NewReel) => Reel;
  updateReel: (id: string, patch: Partial<NewReel>) => void;
  deleteReel: (id: string) => void;
  // Stats
  addStat: (s: NewStat) => Stat;
  updateStat: (id: string, patch: Partial<NewStat>) => void;
  deleteStat: (id: string) => void;
  // Countries
  addCountry: (c: NewCountry) => Country;
  deleteCountry: (id: string) => void;
  // Site settings
  updateSettings: (patch: Partial<SiteSettings>) => void;
  // Maintenance
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
  initialData = null,
}: {
  children: React.ReactNode;
  /** Live content read on the server (see lib/serverData). When present, the
   *  store hydrates with it directly so there's no flash of the seed. */
  initialData?: Partial<DataShape> | null;
}) {
  const [data, setData] = useState<DataShape>(() =>
    initialData ? migrate(initialData) : SEED
  );
  // When the server already provided the live data we're ready immediately;
  // otherwise we wait for the client fetch below.
  const [ready, setReady] = useState(Boolean(initialData));

  // Fall back to fetching the content document from R2 (via the API) on the
  // client — only needed when the server didn't already provide it.
  useEffect(() => {
    if (initialData) return; // already hydrated with live data on the server
    let active = true;
    fetch("/api/data")
      .then((r) => (r.ok ? r.json() : null))
      .then((parsed: DataShape | null) => {
        if (active && parsed) setData(migrate(parsed));
      })
      .catch(() => {
        /* keep the seed already in state */
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [initialData]);

  // Persist changes back to R2 (debounced). Skip the first run after load so we
  // don't immediately re-write the document we just fetched.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const id = setTimeout(() => {
      fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {
        /* non-fatal — the next change will retry */
      });
    }, 700);
    return () => clearTimeout(id);
  }, [data, ready]);

  const now = () => new Date().toISOString();

  // ---- Categories ----
  const addCategory = useCallback((c: NewCategory) => {
    const created: Category = {
      ...c,
      id: uid("cat"),
      slug: slugify(c.name) || uid("cat"),
      createdAt: now(),
    };
    setData((d) => ({ ...d, categories: [created, ...d.categories] }));
    return created;
  }, []);

  const updateCategory = useCallback(
    (id: string, patch: Partial<NewCategory>) => {
      setData((d) => ({
        ...d,
        categories: d.categories.map((c) =>
          c.id === id
            ? { ...c, ...patch, slug: patch.name ? slugify(patch.name) : c.slug }
            : c
        ),
      }));
    },
    []
  );

  const deleteCategory = useCallback((id: string) => {
    setData((d) => {
      // A brand linked only to this category is removed outright (with its
      // media); a brand also in other categories is just unlinked from this one.
      const removedBrandIds = d.brands
        .filter((b) => b.categoryIds.includes(id) && b.categoryIds.length === 1)
        .map((b) => b.id);
      return {
        ...d,
        categories: d.categories.filter((c) => c.id !== id),
        brands: d.brands
          .filter((b) => !removedBrandIds.includes(b.id))
          .map((b) =>
            b.categoryIds.includes(id)
              ? { ...b, categoryIds: b.categoryIds.filter((c) => c !== id) }
              : b
          ),
        photos: d.photos.filter((p) => !removedBrandIds.includes(p.brandId)),
        reels: d.reels.filter((r) => !removedBrandIds.includes(r.brandId)),
      };
    });
  }, []);

  const reorderCategories = useCallback((orderedIds: string[]) => {
    setData((d) => {
      const inSet = new Set(orderedIds);
      const byId = new Map(d.categories.map((c) => [c.id, c]));
      // Walk the full list; wherever a member of the reordered set sits, drop in
      // the next id from `orderedIds`. Other categories keep their positions.
      let i = 0;
      const categories = d.categories.map((c) =>
        inSet.has(c.id) ? byId.get(orderedIds[i++]) ?? c : c
      );
      return { ...d, categories };
    });
  }, []);

  // ---- Brands ----
  const addBrand = useCallback((b: NewBrand) => {
    const created: Brand = { ...b, id: uid("brand"), createdAt: now() };
    setData((d) => ({ ...d, brands: [created, ...d.brands] }));
    return created;
  }, []);

  const updateBrand = useCallback((id: string, patch: Partial<NewBrand>) => {
    setData((d) => ({
      ...d,
      brands: d.brands.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  const deleteBrand = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      brands: d.brands.filter((b) => b.id !== id),
      photos: d.photos.filter((p) => p.brandId !== id),
      reels: d.reels.filter((r) => r.brandId !== id),
    }));
  }, []);

  const reorderBrands = useCallback((orderedIds: string[]) => {
    setData((d) => {
      const inSet = new Set(orderedIds);
      const byId = new Map(d.brands.map((b) => [b.id, b]));
      // Same approach as reorderCategories: slot the reordered set into the
      // positions it already occupied; other brands keep their place.
      let i = 0;
      const brands = d.brands.map((b) =>
        inSet.has(b.id) ? byId.get(orderedIds[i++]) ?? b : b
      );
      return { ...d, brands };
    });
  }, []);

  // Move a brand from one category to another (drops the source, adds the target).
  const moveBrand = useCallback(
    (id: string, fromCategoryId: string, toCategoryId: string) => {
      setData((d) => ({
        ...d,
        brands: d.brands.map((b) =>
          b.id === id
            ? {
                ...b,
                categoryIds: Array.from(
                  new Set([
                    ...b.categoryIds.filter((c) => c !== fromCategoryId),
                    toCategoryId,
                  ])
                ),
              }
            : b
        ),
      }));
    },
    []
  );

  // Link an existing brand into another category (same record shown in both).
  const linkBrandToCategory = useCallback((id: string, categoryId: string) => {
    setData((d) => ({
      ...d,
      brands: d.brands.map((b) =>
        b.id === id && !b.categoryIds.includes(categoryId)
          ? { ...b, categoryIds: [...b.categoryIds, categoryId] }
          : b
      ),
    }));
  }, []);

  // Remove a brand from one category only (keeps it in the others, media intact).
  const unlinkBrandFromCategory = useCallback(
    (id: string, categoryId: string) => {
      setData((d) => ({
        ...d,
        brands: d.brands.map((b) =>
          b.id === id
            ? { ...b, categoryIds: b.categoryIds.filter((c) => c !== categoryId) }
            : b
        ),
      }));
    },
    []
  );

  // ---- Photos ----
  const addPhoto = useCallback((p: NewPhoto) => {
    const created: Photo = { ...p, id: uid("photo"), createdAt: now() };
    setData((d) => ({ ...d, photos: [created, ...d.photos] }));
    return created;
  }, []);

  const updatePhoto = useCallback((id: string, patch: Partial<NewPhoto>) => {
    setData((d) => ({
      ...d,
      photos: d.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
  }, []);

  const reorderPhotos = useCallback((orderedIds: string[]) => {
    setData((d) => {
      const inSet = new Set(orderedIds);
      const byId = new Map(d.photos.map((p) => [p.id, p]));
      // Slot the reordered set into the positions it already occupied; photos
      // in other brands/sections keep their place.
      let i = 0;
      const photos = d.photos.map((p) =>
        inSet.has(p.id) ? byId.get(orderedIds[i++]) ?? p : p
      );
      return { ...d, photos };
    });
  }, []);

  // ---- Reels ----
  const addReel = useCallback((r: NewReel) => {
    const created: Reel = { ...r, id: uid("reel"), createdAt: now() };
    setData((d) => ({ ...d, reels: [created, ...d.reels] }));
    return created;
  }, []);

  const updateReel = useCallback((id: string, patch: Partial<NewReel>) => {
    setData((d) => ({
      ...d,
      reels: d.reels.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deleteReel = useCallback((id: string) => {
    setData((d) => ({ ...d, reels: d.reels.filter((r) => r.id !== id) }));
  }, []);

  // ---- Stats ----
  const addStat = useCallback((s: NewStat) => {
    const created: Stat = { ...s, id: uid("stat"), createdAt: now() };
    setData((d) => ({ ...d, stats: [...d.stats, created] }));
    return created;
  }, []);

  const updateStat = useCallback((id: string, patch: Partial<NewStat>) => {
    setData((d) => ({
      ...d,
      stats: d.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteStat = useCallback((id: string) => {
    setData((d) => ({ ...d, stats: d.stats.filter((s) => s.id !== id) }));
  }, []);

  // ---- Countries ----
  const addCountry = useCallback((c: NewCountry) => {
    const created: Country = { ...c, id: uid("country"), createdAt: now() };
    setData((d) =>
      d.countries.some((x) => x.code === c.code)
        ? d // ignore duplicates by code
        : { ...d, countries: [...d.countries, created] }
    );
    return created;
  }, []);

  const deleteCountry = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      countries: d.countries.filter((c) => c.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const resetData = useCallback(() => {
    setData(SEED);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...data,
      ready,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addBrand,
      updateBrand,
      deleteBrand,
      reorderBrands,
      moveBrand,
      linkBrandToCategory,
      unlinkBrandFromCategory,
      addPhoto,
      updatePhoto,
      deletePhoto,
      reorderPhotos,
      addReel,
      updateReel,
      deleteReel,
      addStat,
      updateStat,
      deleteStat,
      addCountry,
      deleteCountry,
      updateSettings,
      resetData,
    }),
    [
      data,
      ready,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addBrand,
      updateBrand,
      deleteBrand,
      reorderBrands,
      moveBrand,
      linkBrandToCategory,
      unlinkBrandFromCategory,
      addPhoto,
      updatePhoto,
      deletePhoto,
      reorderPhotos,
      addReel,
      updateReel,
      deleteReel,
      addStat,
      updateStat,
      deleteStat,
      addCountry,
      deleteCountry,
      updateSettings,
      resetData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

// Convenience selectors
export function useCategory(id: string | undefined) {
  const { categories } = useStore();
  return categories.find((c) => c.id === id);
}
export function useBrand(id: string | undefined) {
  const { brands } = useStore();
  return brands.find((b) => b.id === id);
}
