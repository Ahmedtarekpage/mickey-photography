"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Camera,
  Video,
  Images,
  Film,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/public/Footer";

export default function CategoryBrandsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { settings, categories, brands, photos, reels, ready } = useStore();

  const category = categories.find((c) => c.id === categoryId);
  if (ready && !category) notFound();

  const isVideo = category?.medium === "videography";
  const catBrands = brands.filter((b) => b.categoryId === categoryId);

  return (
    <div>
      <SiteHeader settings={settings} />

      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
          <Link href="/#work" className="transition hover:text-white">
            Work
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-slate-200">{category?.name ?? "…"}</span>
        </nav>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {isVideo ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {isVideo ? "Videography" : "Photography"}
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {category && (
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.accent }}
                />
              )}
              {category?.name ?? "Category"}
            </h1>
            {category?.description && (
              <p className="mt-2 max-w-2xl text-slate-400">
                {category.description}
              </p>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {catBrands.length} brand{catBrands.length === 1 ? "" : "s"} · choose one
            to view its work
          </p>
        </div>

        {/* Brands grid */}
        {catBrands.length === 0 ? (
          <p className="py-20 text-center text-slate-500">
            No brands in this category yet.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {catBrands.map((b) => {
              const brandPhotos = photos.filter((p) => p.brandId === b.id);
              const photoCount = brandPhotos.length;
              const reelCount = reels.filter((r) => r.brandId === b.id).length;
              // Lead with a gallery image from this brand (videos use their
              // poster); fall back to the brand logo, then nothing.
              const thumb =
                brandPhotos.find((p) => p.section === "gallery")?.url ||
                brandPhotos[0]?.url ||
                b.logo ||
                "";
              return (
                <Link
                  key={b.id}
                  href={`/work/${categoryId}/${b.id}`}
                  className="card-3d group relative flex flex-col overflow-hidden"
                >
                  {/* Thumbnail from the brand's gallery */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-800">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={b.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-600">
                        <Images className="h-8 w-8" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/70 to-transparent" />
                  </div>

                  {/* Footer: logo on the left, then name + counts */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink-700 ring-2 ring-white/15 transition group-hover:ring-white/30">
                      {b.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                          {b.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="truncate font-semibold text-white">
                        {b.name}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Images className="h-3 w-3" /> {photoCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Film className="h-3 w-3" /> {reelCount}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-fuchsia opacity-0 transition group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all categories
          </Link>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
