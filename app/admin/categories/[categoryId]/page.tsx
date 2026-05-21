"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Aperture,
  Plus,
  Star,
  Images,
  Film,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useStore, useCategory } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
            const photoCount = photos.filter((p) => p.brandId === b.id).length;
            const reelCount = reels.filter((r) => r.brandId === b.id).length;
            return (
              <Link
                key={b.id}
                href={`/admin/categories/${categoryId}/brands/${b.id}`}
                className="card-3d group relative flex flex-col items-center p-6 text-center"
              >
                <div className="absolute right-3 top-3">
                  <CardMenu
                    onEdit={() => openEdit(b)}
                    onDelete={() => setDeleting(b)}
                  />
                </div>
                {b.featured && (
                  <div className="absolute left-3 top-3">
                    <Star className="h-4 w-4 fill-brand-amber text-brand-amber" />
                  </div>
                )}

                {/* Circular logo */}
                <div className="relative mb-4 mt-2">
                  <div className="absolute -inset-1 rounded-full bg-brand-gradient opacity-60 blur-md transition group-hover:opacity-90" />
                  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/15 ring-offset-4 ring-offset-ink-900 transition group-hover:ring-white/30">
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-ink-700 text-2xl font-bold text-white">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-white">{b.name}</h3>
                {b.website && (
                  <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Globe className="h-3 w-3" /> Website
                  </span>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge tone="pink">
                    <Images className="h-3 w-3" /> {photoCount}
                  </Badge>
                  <Badge tone="lime">
                    <Film className="h-3 w-3" /> {reelCount}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brand-fuchsia opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
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
