"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Aperture, Plus, Star, Images, Film, ArrowRight } from "lucide-react";
import { useStore, useCategory } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardMenu } from "@/components/ui/CardMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BrandForm, type BrandDraft } from "@/components/admin/BrandForm";
import type { Brand } from "@/lib/types";

export default function CategoryBrandsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { brands, photos, reels, ready, addBrand, updateBrand, deleteBrand } =
    useStore();
  const category = useCategory(categoryId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState<Brand | null>(null);

  if (ready && !category) notFound();

  const catBrands = brands.filter((b) => b.categoryId === categoryId);

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
      categoryId,
    };
    if (editing) updateBrand(editing.id, payload);
    else addBrand(payload);
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
                className="card-3d group relative flex flex-col overflow-hidden"
              >
                <div className="absolute right-3 top-3 z-10">
                  <CardMenu
                    onEdit={() => openEdit(b)}
                    onDelete={() => setDeleting(b)}
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
      )}

      <BrandForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete "${deleting?.name}"?`}
        message="This removes the brand and all of its photos and reels. This cannot be undone."
        onConfirm={() => {
          if (deleting) deleteBrand(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
