"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Globe,
  Star,
  Images,
  Film,
  Clapperboard,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Footer } from "@/components/public/Footer";
import { PhotoLightbox } from "@/components/public/PhotoLightbox";
import { VideoModal } from "@/components/ui/VideoModal";
import type { Photo, Reel } from "@/lib/types";

type Tab = "gallery" | "bts";
type Player = { src: string; title: string; aspect: "vertical" | "wide" };

/**
 * A portrait, Instagram-style media tile (photo, before/after, or video). The
 * thumbnail is cropped to a 4:5 vertical frame (landscape shots fill it, so
 * they're cropped; portraits fit naturally); the full image / interactive
 * before-after / playable video opens uncropped in the lightbox on tap.
 */
function MediaCard({ item, onOpen }: { item: Photo; onOpen: () => void }) {
  const isVideo = !!item.videoUrl;
  const hasBA = !isVideo && !!(item.beforeUrl && item.afterUrl);
  // For B/A items `url` may be unset, so fall back to the "after" frame.
  const cover = hasBA ? item.afterUrl! : item.url;
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-white/[0.03] sm:rounded-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      {/* darken on hover, like Instagram's grid */}
      <div className="pointer-events-none absolute inset-0 bg-ink-950/0 transition group-hover:bg-ink-950/25" />

      {/* caption on hover (name shown only when enabled; alt always set above) */}
      {item.showName && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-ink-950/90 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
          <span className="truncate text-xs font-medium text-white">
            {item.title}
          </span>
        </div>
      )}

      {/* corner badge */}
      {isVideo ? (
        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/55 text-white backdrop-blur">
          <Play className="h-3.5 w-3.5 translate-x-px fill-current" />
        </span>
      ) : hasBA ? (
        <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-ink-950/55 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur">
          <SlidersHorizontal className="h-2.5 w-2.5" /> B/A
        </span>
      ) : null}
    </button>
  );
}

export default function BrandGalleryPage() {
  const { categoryId, brandId } = useParams<{
    categoryId: string;
    brandId: string;
  }>();
  const store = useStore();
  const category = store.categories.find((c) => c.id === categoryId);
  const brand = store.brands.find((b) => b.id === brandId);

  const [tab, setTab] = useState<Tab>("gallery");
  const [lightbox, setLightbox] = useState<{ list: Photo[]; index: number } | null>(
    null
  );
  const [player, setPlayer] = useState<Player | null>(null);

  if (store.ready && (!brand || !category)) notFound();

  const isVideo = category?.medium === "videography";
  const items = store.photos.filter((p) => p.brandId === brandId);
  const gallery = items.filter((p) => p.section === "gallery");
  const btsPhotos = items.filter((p) => p.section === "bts");
  const reels = store.reels.filter((r) => r.brandId === brandId);

  const openItem = (list: Photo[], item: Photo) => {
    // Videos in the gallery play in the lightbox too (it handles <video>).
    setLightbox({ list, index: list.indexOf(item) });
  };

  const tabs: { id: Tab; label: string; icon: typeof Images; count: number }[] = [
    { id: "gallery", label: "Gallery", icon: Images, count: gallery.length },
    {
      id: "bts",
      label: "Behind the scenes",
      icon: Clapperboard,
      count: reels.length + btsPhotos.length,
    },
  ];

  return (
    <div>
      <SiteHeader settings={store.settings} />

      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
          <Link href="/#work" className="transition hover:text-white">
            Work
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <Link
            href={`/work/${categoryId}`}
            className="transition hover:text-white"
          >
            {category?.name ?? "…"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-slate-200">{brand?.name ?? "…"}</span>
        </nav>

        {/* Brand hero */}
        {brand && (
          <div className="mt-6 flex flex-col items-center gap-6 border-b border-white/10 pb-10 text-center sm:flex-row sm:items-end sm:text-left">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-brand-gradient opacity-70 blur-md" />
              <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/20 ring-offset-4 ring-offset-ink-950">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-ink-700 text-3xl font-bold text-white">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {brand.name}
                </h1>
                {brand.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-amber/30 bg-brand-amber/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
              </div>
              {brand.description && (
                <p className="mt-2 max-w-2xl text-slate-400">{brand.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Images className="h-4 w-4" /> {gallery.length}{" "}
                  {isVideo ? "videos" : "photos"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Film className="h-4 w-4" /> {reels.length} reels
                </span>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-fuchsia transition hover:text-white"
                  >
                    <Globe className="h-4 w-4" /> Visit site
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  tab === t.id ? "bg-white/20" : "bg-white/10"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Gallery */}
        {tab === "gallery" && (
          <div className="mt-8">
            {gallery.length === 0 ? (
              <p className="py-16 text-center text-slate-500">
                No published work yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5">
                {gallery.map((p) => (
                  <MediaCard
                    key={p.id}
                    item={p}
                    onOpen={() => openItem(gallery, p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Behind the scenes */}
        {tab === "bts" && (
          <div className="mt-8 space-y-12">
            {reels.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Film className="h-5 w-5 text-brand-lime" /> Reels
                </h2>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {reels.map((r: Reel) => (
                    <button
                      key={r.id}
                      onClick={() =>
                        setPlayer({
                          src: r.videoUrl,
                          title: r.title,
                          aspect: "vertical",
                        })
                      }
                      className="group relative block aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
                    >
                      {r.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.thumbnail}
                          alt={r.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-white shadow-3d transition group-hover:scale-110">
                        <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate p-3 text-sm font-medium text-white">
                        {r.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {btsPhotos.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Clapperboard className="h-5 w-5 text-brand-cyan" /> On set
                </h2>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5">
                  {btsPhotos.map((p) => (
                    <MediaCard
                      key={p.id}
                      item={p}
                      onOpen={() => openItem(btsPhotos, p)}
                    />
                  ))}
                </div>
              </div>
            )}

            {reels.length === 0 && btsPhotos.length === 0 && (
              <p className="py-16 text-center text-slate-500">
                No behind-the-scenes content yet.
              </p>
            )}
          </div>
        )}

        <div className="mt-14">
          <Link
            href={`/work/${categoryId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {category?.name ?? "category"}
          </Link>
        </div>
      </main>

      <Footer settings={store.settings} />

      <PhotoLightbox
        items={lightbox?.list ?? []}
        index={lightbox?.index ?? -1}
        onClose={() => setLightbox(null)}
        onIndex={(i) => setLightbox((lb) => (lb ? { ...lb, index: i } : lb))}
      />
      <VideoModal
        open={!!player}
        src={player?.src ?? ""}
        title={player?.title ?? ""}
        aspect={player?.aspect}
        onClose={() => setPlayer(null)}
      />
    </div>
  );
}
