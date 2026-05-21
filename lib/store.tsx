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
    brands: parsed.brands ?? [],
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
  // Brands
  addBrand: (b: NewBrand) => Brand;
  updateBrand: (id: string, patch: Partial<NewBrand>) => void;
  deleteBrand: (id: string) => void;
  // Photos
  addPhoto: (p: NewPhoto) => Photo;
  updatePhoto: (id: string, patch: Partial<NewPhoto>) => void;
  deletePhoto: (id: string) => void;
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataShape>(SEED);
  const [ready, setReady] = useState(false);

  // Load the shared content document from R2 (via the API) once on mount.
  useEffect(() => {
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
  }, []);

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
      const brandIds = d.brands.filter((b) => b.categoryId === id).map((b) => b.id);
      return {
        ...d,
        categories: d.categories.filter((c) => c.id !== id),
        brands: d.brands.filter((b) => b.categoryId !== id),
        photos: d.photos.filter((p) => !brandIds.includes(p.brandId)),
        reels: d.reels.filter((r) => !brandIds.includes(r.brandId)),
      };
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
      addBrand,
      updateBrand,
      deleteBrand,
      addPhoto,
      updatePhoto,
      deletePhoto,
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
      addBrand,
      updateBrand,
      deleteBrand,
      addPhoto,
      updatePhoto,
      deletePhoto,
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
