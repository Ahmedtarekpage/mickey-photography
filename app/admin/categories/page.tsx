"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Aperture,
  ArrowRight,
  Camera,
  Video,
  GripVertical,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardMenu } from "@/components/ui/CardMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryForm, type CategoryDraft } from "@/components/admin/CategoryForm";
import { cn } from "@/lib/cn";
import type { Category, Medium } from "@/lib/types";

function CategoriesInner() {
  const searchParams = useSearchParams();
  const initialMedium: Medium =
    searchParams.get("medium") === "videography" ? "videography" : "photography";

  const {
    categories,
    brands,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useStore();
  const [medium, setMedium] = useState<Medium>(initialMedium);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // Drag-and-drop reordering (native HTML5 DnD).
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // A drag doesn't fire a click in HTML5 DnD, but guard navigation just in case
  // a stray click follows a drop.
  const dragEndedAt = useRef(0);

  const mediumCategories = categories.filter((c) => c.medium === medium);

  const moveCategory = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = mediumCategories.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderCategories(ids);
  };

  const mediums: {
    id: Medium;
    label: string;
    icon: typeof Camera;
    count: number;
  }[] = [
    {
      id: "photography",
      label: "Photography",
      icon: Camera,
      count: categories.filter((c) => c.medium === "photography").length,
    },
    {
      id: "videography",
      label: "Videography",
      icon: Video,
      count: categories.filter((c) => c.medium === "videography").length,
    },
  ];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSubmit = (draft: CategoryDraft) => {
    if (editing) updateCategory(editing.id, draft);
    else addCategory({ ...draft, medium });
    setFormOpen(false);
  };

  const isVideo = medium === "videography";

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
        title="Categories"
        description="Organized by discipline. Each category holds brands, and each brand holds work and BTS."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New category
          </Button>
        }
      />

      {/* Medium tabs */}
      <div className="mb-7 inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        {mediums.map((m) => (
          <button
            key={m.id}
            onClick={() => setMedium(m.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
              medium === m.id
                ? "bg-brand-gradient text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            )}
          >
            <m.icon className="h-4 w-4" /> {m.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                medium === m.id ? "bg-white/20" : "bg-white/10"
              )}
            >
              {m.count}
            </span>
          </button>
        ))}
      </div>

      {mediumCategories.length === 0 ? (
        <EmptyState
          icon={isVideo ? Video : Camera}
          title={`No ${medium} categories yet`}
          description={
            isVideo
              ? "Create your first videography category to start organizing brands and video work."
              : "Create your first photography category to start organizing brands and photos."
          }
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New category
            </Button>
          }
        />
      ) : (
        <>
          {mediumCategories.length > 1 && (
            <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
              <GripVertical className="h-3.5 w-3.5" />
              Drag cards to reorder — this is the order shown on your site.
            </p>
          )}
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {mediumCategories.map((c) => {
            const brandCount = brands.filter((b) =>
              b.categoryIds.includes(c.id)
            ).length;
            return (
              <Link
                key={c.id}
                href={`/admin/categories/${c.id}`}
                draggable
                onDragStart={(e) => {
                  setDragId(c.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", c.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== c.id) setOverId(c.id);
                }}
                onDragLeave={() => {
                  if (overId === c.id) setOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  moveCategory(c.id);
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
                  "card-3d group relative flex flex-col items-center p-6 text-center",
                  "cursor-grab active:cursor-grabbing",
                  dragId === c.id && "opacity-40",
                  overId === c.id &&
                    dragId !== c.id &&
                    "ring-2 ring-brand-fuchsia ring-offset-2 ring-offset-ink-900"
                )}
              >
                <div className="absolute right-3 top-3">
                  <CardMenu
                    onEdit={() => openEdit(c)}
                    onDelete={() => setDeleting(c)}
                  />
                </div>

                {/* Drag affordance */}
                <div className="absolute left-3 top-3 text-slate-500 opacity-0 transition group-hover:opacity-100">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Circular logo */}
                <div className="relative mb-4 mt-2">
                  <div
                    className="absolute -inset-1 rounded-full opacity-60 blur-md transition group-hover:opacity-90"
                    style={{ backgroundColor: c.accent }}
                  />
                  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/15 ring-offset-4 ring-offset-ink-900 transition group-hover:ring-white/30">
                    {c.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.coverImage}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: `${c.accent}33` }}
                      >
                        {c.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.accent }}
                  />
                  {c.name}
                </h3>
                {c.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
                    {c.description}
                  </p>
                )}

                <div className="mt-3">
                  <Badge tone="violet">
                    <Aperture className="h-3 w-3" /> {brandCount} brand
                    {brandCount === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-fuchsia opacity-0 transition group-hover:opacity-100">
                  Manage brands
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
          </div>
        </>
      )}

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        medium={medium}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete "${deleting?.name}"?`}
        message="This permanently removes the category along with all of its brands and media. This cannot be undone."
        onConfirm={() => {
          if (deleting) deleteCategory(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesInner />
    </Suspense>
  );
}
