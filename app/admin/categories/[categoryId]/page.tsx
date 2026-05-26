"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Aperture,
  Plus,
  Star,
  Images,
  Film,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore, useCategory } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardMenu } from "@/components/ui/CardMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BrandForm, type BrandDraft } from "@/components/admin/BrandForm";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import type { Brand } from "@/lib/types";

export default function CategoryBrandsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const {
    brands,
    photos,
    reels,
    ready,
    addBrand,
    updateBrand,
    deleteBrand,
    reorderBrands,
    moveBrand,
    linkBrandToCategory,
    unlinkBrandFromCategory,
  } = useStore();
  const category = useCategory(categoryId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState<Brand | null>(null);
  // Move / add-to-category picker.
  const [picker, setPicker] = useState<{ brand: Brand; mode: "move" | "link" } | null>(
    null
  );
  // Drag-and-drop reordering (native HTML5 DnD).
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragEndedAt = useRef(0);

  if (ready && !category) notFound();

  const catBrands = brands.filter((b) => b.categoryIds.includes(categoryId));

  const moveBrandOrder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = catBrands.map((b) => b.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderBrands(ids);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    setFormOpen(true);
  };
  const handleSubmit = (draft: BrandDraft) => {
    const payload = {
      ...draft,
      website: draft.website.trim() || undefined,
      thumbnail: draft.thumbnail.trim() || undefined,
    };
    // Editing leaves category membership untouched; creating drops the new
    // brand into the current category.
    if (editing) updateBrand(editing.id, payload);
    else addBrand({ ...payload, categoryIds: [categoryId] });
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category?.name ?? "…" },
        ]}
        title={
          <span className="flex items-center gap-3">
            {category && (
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.accent }}
              />
            )}
            {category?.name ?? "Category"}
          </span>
        }
        description={category?.description || "Brands inside this category."}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New brand
          </Button>
        }
      />

      {catBrands.length === 0 ? (
        <EmptyState
          icon={Aperture}
          title="No brands yet"
          description="Add the first brand to this category. Brands appear as circular logos."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New brand
            </Button>
          }
        />
      ) : (
        <>
          {catBrands.length > 1 && (
            <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
              <GripVertical className="h-3.5 w-3.5" />
              Drag cards to reorder — this sets the order shown on your site.
            </p>
          )}
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {catBrands.map((b) => {
            const brandPhotos = photos.filter((p) => p.brandId === b.id);
            const photoCount = brandPhotos.length;
            const reelCount = reels.filter((r) => r.brandId === b.id).length;
            // Same thumbnail rule as the public card, so admin previews match.
            const thumb =
              b.thumbnail ||
              brandPhotos.find((p) => p.section === "gallery")?.url ||
              brandPhotos[0]?.url ||
              b.logo ||
              "";
            return (
              <Link
                key={b.id}
                href={`/admin/categories/${categoryId}/brands/${b.id}`}
                draggable
                onDragStart={(e) => {
                  setDragId(b.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", b.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== b.id) setOverId(b.id);
                }}
                onDragLeave={() => {
                  if (overId === b.id) setOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  moveBrandOrder(b.id);
                  setDragId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                  dragEndedAt.current = Date.now();
                }}
                onClick={(e) => {
                  // Suppress the navigation that may follow a drop.
                  if (Date.now() - dragEndedAt.current < 120) e.preventDefault();
                }}
                className={cn(
                  "card-3d group relative flex flex-col overflow-hidden",
                  "cursor-grab active:cursor-grabbing",
                  dragId === b.id && "opacity-40",
                  overId === b.id &&
                    dragId !== b.id &&
                    "ring-2 ring-brand-fuchsia ring-offset-2 ring-offset-ink-900"
                )}
              >
                <div className="absolute right-3 top-3 z-10">
                  <CardMenu
                    onEdit={() => openEdit(b)}
                    onMove={() => setPicker({ brand: b, mode: "move" })}
                    onLink={() => setPicker({ brand: b, mode: "link" })}
                    onDelete={() => setDeleting(b)}
                    deleteLabel={
                      b.categoryIds.length > 1 ? "Remove from category" : "Delete"
                    }
                  />
                </div>
                {b.featured && (
                  <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-brand-amber/30 bg-ink-950/60 px-2.5 py-1.5 text-xs font-medium text-brand-amber backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-brand-amber" /> Featured
                  </div>
                )}

                {/* Thumbnail — matches the public work page */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-800">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={b.name}
                      draggable={false}
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
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="truncate font-semibold text-white">{b.name}</h3>
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
        </>
      )}

      <BrandForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title={
          deleting && deleting.categoryIds.length > 1
            ? `Remove "${deleting.name}" from ${category?.name}?`
            : `Delete "${deleting?.name}"?`
        }
        message={
          deleting && deleting.categoryIds.length > 1
            ? `It stays in ${deleting.categoryIds.length - 1} other categor${
                deleting.categoryIds.length - 1 === 1 ? "y" : "ies"
              }, with all of its photos and reels intact.`
            : "This removes the brand and all of its photos and reels. This cannot be undone."
        }
        confirmLabel={
          deleting && deleting.categoryIds.length > 1 ? "Remove" : "Delete"
        }
        onConfirm={() => {
          if (deleting) {
            if (deleting.categoryIds.length > 1)
              unlinkBrandFromCategory(deleting.id, categoryId);
            else deleteBrand(deleting.id);
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />

      <CategoryPicker
        open={!!picker}
        mode={picker?.mode ?? "move"}
        brandName={picker?.brand.name ?? ""}
        currentIds={picker?.brand.categoryIds ?? []}
        sourceCategoryId={categoryId}
        onClose={() => setPicker(null)}
        onPick={(targetId) => {
          if (!picker) return;
          if (picker.mode === "move")
            moveBrand(picker.brand.id, categoryId, targetId);
          else linkBrandToCategory(picker.brand.id, targetId);
          setPicker(null);
        }}
      />
    </div>
  );
}
