"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Images,
  Film,
  Plus,
  Globe,
  Star,
  Pencil,
  Clapperboard,
  GalleryHorizontalEnd,
  Video,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { useStore, useBrand, useCategory } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VideoModal } from "@/components/ui/VideoModal";
import { cn } from "@/lib/cn";
import { BrandForm, type BrandDraft } from "@/components/admin/BrandForm";
import { PhotoForm, type PhotoDraft } from "@/components/admin/PhotoForm";
import { ReelForm, type ReelDraft } from "@/components/admin/ReelForm";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { ReelGrid } from "@/components/admin/ReelGrid";
import { ArrangeMenu } from "@/components/admin/ArrangeMenu";
import { BulkPhotoWizard, type BulkItem } from "@/components/admin/BulkPhotoWizard";
import { deleteBlob } from "@/lib/mediaStore";
import type { Photo, PhotoSection, Reel } from "@/lib/types";

type Tab = "gallery" | "bts";
type BtsTab = "reels" | "gallery";
type PlayerState = { src: string; title: string; aspect: "vertical" | "wide" };

export default function BrandDetailPage() {
  const { categoryId, brandId } = useParams<{
    categoryId: string;
    brandId: string;
  }>();
  const store = useStore();
  const toast = useToast();
  const brand = useBrand(brandId);
  const category = useCategory(categoryId);

  const medium = category?.medium ?? "photography";
  const isVideo = medium === "videography";
  const noun = isVideo ? "video" : "photo";

  const [tab, setTab] = useState<Tab>("gallery");
  const [btsTab, setBtsTab] = useState<BtsTab>("reels");

  // Brand edit
  const [brandFormOpen, setBrandFormOpen] = useState(false);

  // Media (photo/video) state
  const [photoFormOpen, setPhotoFormOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [newPhotoSection, setNewPhotoSection] = useState<PhotoSection>("gallery");
  const [deletingPhoto, setDeletingPhoto] = useState<Photo | null>(null);

  // Bulk image upload — select many files, then a wizard steps through each.
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const bulkSectionRef = useRef<PhotoSection>("gallery");
  const [bulk, setBulk] = useState<{ files: File[]; section: PhotoSection } | null>(
    null
  );

  // Reel state
  const [reelFormOpen, setReelFormOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [deletingReel, setDeletingReel] = useState<Reel | null>(null);

  // Unified video player (reels + gallery videos)
  const [player, setPlayer] = useState<PlayerState | null>(null);

  // Multi-select for bulk photo delete (cleared when switching tabs).
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  useEffect(() => {
    setSelected(new Set());
  }, [tab, btsTab]);
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (store.ready && !brand) notFound();

  const brandPhotos = store.photos.filter((p) => p.brandId === brandId);
  const galleryPhotos = brandPhotos.filter((p) => p.section === "gallery");
  const btsPhotos = brandPhotos.filter((p) => p.section === "bts");
  const reels = store.reels.filter((r) => r.brandId === brandId);

  // ---- handlers ----
  const submitBrand = (draft: BrandDraft) => {
    store.updateBrand(brandId, {
      ...draft,
      website: draft.website.trim() || undefined,
      thumbnail: draft.thumbnail.trim() || undefined,
    });
    setBrandFormOpen(false);
  };

  const openAddPhoto = (section: PhotoSection) => {
    setEditingPhoto(null);
    setNewPhotoSection(section);
    setPhotoFormOpen(true);
  };

  // Open the file picker; selecting files opens the step-through wizard.
  const openBulkUpload = (section: PhotoSection) => {
    bulkSectionRef.current = section;
    bulkInputRef.current?.click();
  };
  // Commit the wizard's photos (in picked order) into the chosen section.
  const saveBulk = (photos: BulkItem[]) => {
    const section = bulk?.section ?? "gallery";
    // addPhoto prepends, so add in reverse to keep the picked order at the top.
    for (let i = photos.length - 1; i >= 0; i--) {
      store.addPhoto({
        brandId,
        section,
        title: photos[i].title,
        showName: photos[i].showName,
        orientation: photos[i].orientation,
        url: photos[i].url,
      });
    }
    setBulk(null);
    if (photos.length)
      toast.success(
        `${photos.length} photo${photos.length === 1 ? "" : "s"} uploaded`
      );
  };

  const confirmBulkDelete = () => {
    const ids = Array.from(selected);
    store.deletePhotos(ids);
    setSelected(new Set());
    setBulkDeleteOpen(false);
    toast.success(`${ids.length} photo${ids.length === 1 ? "" : "s"} deleted`);
  };
  const openEditPhoto = (p: Photo) => {
    setEditingPhoto(p);
    setPhotoFormOpen(true);
  };
  const submitPhoto = (draft: PhotoDraft) => {
    const payload = {
      brandId,
      section: editingPhoto ? editingPhoto.section : newPhotoSection,
      title: draft.title,
      showName: draft.showName,
      orientation: draft.orientation,
      url: draft.url,
      videoUrl: isVideo ? draft.videoUrl.trim() || undefined : undefined,
      durationSec:
        isVideo && draft.durationSec ? Number(draft.durationSec) : undefined,
      beforeUrl: !isVideo && draft.hasComparison ? draft.beforeUrl : undefined,
      afterUrl: !isVideo && draft.hasComparison ? draft.afterUrl : undefined,
    };
    if (editingPhoto) {
      store.updatePhoto(editingPhoto.id, payload);
      toast.success(`${noun === "video" ? "Video" : "Photo"} updated`);
    } else {
      store.addPhoto(payload);
      toast.success(`${noun === "video" ? "Video" : "Photo"} added`);
    }
    setPhotoFormOpen(false);
  };

  const playVideoItem = (p: Photo) =>
    setPlayer({
      src: p.videoUrl ?? "",
      title: p.title,
      aspect: p.orientation === "landscape" ? "wide" : "vertical",
    });

  const openAddReel = () => {
    setEditingReel(null);
    setReelFormOpen(true);
  };
  const submitReel = (draft: ReelDraft) => {
    const payload = {
      brandId,
      title: draft.title,
      videoUrl: draft.videoUrl,
      thumbnail: draft.thumbnail,
      durationSec: draft.durationSec ? Number(draft.durationSec) : undefined,
    };
    if (editingReel) store.updateReel(editingReel.id, payload);
    else store.addReel(payload);
    setReelFormOpen(false);
  };

  const topTabs: { id: Tab; label: string; icon: typeof Images; count: number }[] =
    [
      {
        id: "gallery",
        label: "Gallery",
        icon: isVideo ? Video : Images,
        count: galleryPhotos.length,
      },
      {
        id: "bts",
        label: "BTS",
        icon: Clapperboard,
        count: btsPhotos.length + reels.length,
      },
    ];

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          {
            label: isVideo ? "Videography" : "Photography",
            href: `/admin/categories?medium=${medium}`,
          },
          { label: category?.name ?? "…", href: `/admin/categories/${categoryId}` },
          { label: brand?.name ?? "…" },
        ]}
        title={brand?.name ?? "Brand"}
        description={brand?.description}
      />

      {/* Brand banner */}
      {brand && (
        <div className="surface-raised mb-8 flex flex-col items-center gap-5 rounded-3xl p-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-brand-gradient opacity-70 blur-md" />
            <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/20 ring-offset-4 ring-offset-ink-850">
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
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold text-white">{brand.name}</h2>
              <Badge tone={isVideo ? "amber" : "cyan"}>
                {isVideo ? <Video className="h-3 w-3" /> : <Images className="h-3 w-3" />}
                {isVideo ? "Videography" : "Photography"}
              </Badge>
              {brand.featured && (
                <Badge tone="amber">
                  <Star className="h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
            </div>
            {brand.description && (
              <p className="mt-1 text-sm text-slate-400">{brand.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge tone="violet">
                <Images className="h-3 w-3" /> {galleryPhotos.length} gallery
              </Badge>
              <Badge tone="pink">
                <GalleryHorizontalEnd className="h-3 w-3" /> {btsPhotos.length} BTS{" "}
                {noun}s
              </Badge>
              <Badge tone="lime">
                <Film className="h-3 w-3" /> {reels.length} reels
              </Badge>
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300 transition hover:text-white"
                >
                  <Globe className="h-3 w-3" /> Visit site
                </a>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => setBrandFormOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit brand
          </Button>
        </div>
      )}

      {/* Top-level tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {topTabs.map((t) => (
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
        {tab === "gallery" && (
          <div className="flex items-center gap-2">
            {galleryPhotos.length > 1 && (
              <ArrangeMenu
                items={galleryPhotos}
                onReorder={store.reorderPhotos}
              />
            )}
            {isVideo ? (
              <Button onClick={() => openAddPhoto("gallery")}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add {noun}</span>
              </Button>
            ) : (
              <Button onClick={() => openBulkUpload("gallery")}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload images</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Multi-select action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-brand-fuchsia/30 bg-brand-fuchsia/10 px-4 py-2.5 animate-fade-in">
          <span className="text-sm font-medium text-white">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              <X className="h-4 w-4" /> Clear
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {tab === "gallery" &&
        (galleryPhotos.length === 0 ? (
          <EmptyState
            icon={isVideo ? Video : Images}
            title={`No gallery ${noun}s yet`}
            description={
              isVideo
                ? "Add finished portfolio videos — portrait or landscape."
                : "Add finished portfolio shots — portrait or landscape."
            }
            action={
              isVideo ? (
                <Button onClick={() => openAddPhoto("gallery")}>
                  <Plus className="h-4 w-4" /> Add {noun}
                </Button>
              ) : (
                <Button onClick={() => openBulkUpload("gallery")}>
                  <Upload className="h-4 w-4" /> Upload images
                </Button>
              )
            }
          />
        ) : (
          <PhotoGrid
            photos={galleryPhotos}
            onEdit={openEditPhoto}
            onDelete={setDeletingPhoto}
            onPlay={playVideoItem}
            onReorder={store.reorderPhotos}
            onToggleName={(p) =>
              store.updatePhoto(p.id, { showName: !p.showName })
            }
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        ))}

      {/* BTS TAB */}
      {tab === "bts" && (
        <div>
          {/* BTS sub-tabs */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              {(
                [
                  { id: "reels", label: "Reels", icon: Film, count: reels.length },
                  {
                    id: "gallery",
                    label: "Gallery",
                    icon: GalleryHorizontalEnd,
                    count: btsPhotos.length,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBtsTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                    btsTab === t.id
                      ? "bg-brand-cyan/20 text-white shadow-glow-cyan"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs",
                      btsTab === t.id ? "bg-white/20" : "bg-white/10"
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            {btsTab === "reels" ? (
              <Button onClick={openAddReel}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add reel</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {btsPhotos.length > 1 && (
                  <ArrangeMenu
                    items={btsPhotos}
                    onReorder={store.reorderPhotos}
                  />
                )}
                {isVideo ? (
                  <Button onClick={() => openAddPhoto("bts")}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add BTS {noun}</span>
                  </Button>
                ) : (
                  <Button onClick={() => openBulkUpload("bts")}>
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload images</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* BTS → Reels */}
          {btsTab === "reels" &&
            (reels.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No BTS reels yet"
                description="Add behind-the-scenes vertical videos for this brand."
                action={
                  <Button onClick={openAddReel}>
                    <Plus className="h-4 w-4" /> Add reel
                  </Button>
                }
              />
            ) : (
              <ReelGrid
                reels={reels}
                onEdit={(r) => {
                  setEditingReel(r);
                  setReelFormOpen(true);
                }}
                onDelete={setDeletingReel}
                onPlay={(r) =>
                  setPlayer({
                    src: r.videoUrl,
                    title: r.title,
                    aspect: "vertical",
                  })
                }
              />
            ))}

          {/* BTS → Gallery */}
          {btsTab === "gallery" &&
            (btsPhotos.length === 0 ? (
              <EmptyState
                icon={GalleryHorizontalEnd}
                title={`No BTS ${noun}s yet`}
                description={
                  isVideo
                    ? "Add behind-the-scenes video clips for this brand."
                    : "Upload behind-the-scenes images. Edit one afterwards to turn it into a before/after comparison slider."
                }
                action={
                  isVideo ? (
                    <Button onClick={() => openAddPhoto("bts")}>
                      <Plus className="h-4 w-4" /> Add BTS {noun}
                    </Button>
                  ) : (
                    <Button onClick={() => openBulkUpload("bts")}>
                      <Upload className="h-4 w-4" /> Upload images
                    </Button>
                  )
                }
              />
            ) : (
              <PhotoGrid
                photos={btsPhotos}
                onEdit={openEditPhoto}
                onDelete={setDeletingPhoto}
                onPlay={playVideoItem}
                onReorder={store.reorderPhotos}
                onToggleName={(p) =>
                  store.updatePhoto(p.id, { showName: !p.showName })
                }
                selected={selected}
                onToggleSelect={toggleSelect}
              />
            ))}
        </div>
      )}

      {/* Hidden input for bulk image upload */}
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) setBulk({ files, section: bulkSectionRef.current });
          e.target.value = ""; // allow re-selecting the same files
        }}
      />

      <BulkPhotoWizard
        open={!!bulk}
        files={bulk?.files ?? []}
        onClose={() => setBulk(null)}
        onSave={saveBulk}
      />

      {/* Modals */}
      <BrandForm
        open={brandFormOpen}
        onClose={() => setBrandFormOpen(false)}
        onSubmit={submitBrand}
        initial={brand}
      />
      <PhotoForm
        open={photoFormOpen}
        onClose={() => setPhotoFormOpen(false)}
        onSubmit={submitPhoto}
        initial={editingPhoto}
        mode={isVideo ? "video" : "photo"}
        allowComparison={
          !isVideo &&
          (editingPhoto ? editingPhoto.section === "bts" : newPhotoSection === "bts")
        }
      />
      <ReelForm
        open={reelFormOpen}
        onClose={() => setReelFormOpen(false)}
        onSubmit={submitReel}
        initial={editingReel}
      />

      <ConfirmDialog
        open={!!deletingPhoto}
        title={`Delete ${noun}?`}
        message={`"${deletingPhoto?.title}" will be permanently removed.`}
        onConfirm={() => {
          if (deletingPhoto) {
            void deleteBlob(deletingPhoto.videoUrl);
            store.deletePhoto(deletingPhoto.id);
            toast.success(`${noun === "video" ? "Video" : "Photo"} deleted`);
          }
          setDeletingPhoto(null);
        }}
        onCancel={() => setDeletingPhoto(null)}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.size} ${
          selected.size === 1 ? "photo" : "photos"
        }?`}
        message="The selected items will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
      <ConfirmDialog
        open={!!deletingReel}
        title="Delete reel?"
        message={`"${deletingReel?.title}" will be permanently removed.`}
        onConfirm={() => {
          if (deletingReel) {
            void deleteBlob(deletingReel.videoUrl);
            store.deleteReel(deletingReel.id);
          }
          setDeletingReel(null);
        }}
        onCancel={() => setDeletingReel(null)}
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
