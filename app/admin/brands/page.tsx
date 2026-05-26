"use client";

import { useRef, useState } from "react";
import { GripVertical, Eye, EyeOff, Gauge, Aperture } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { BrandsMarquee } from "@/components/public/BrandsMarquee";
import { cn } from "@/lib/cn";

export default function BrandsStripPage() {
  const {
    brands,
    settings,
    updateBrand,
    reorderBrands,
    updateSettings,
    setAllBrandsMarquee,
  } = useStore();

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragEndedAt = useRef(0);

  const visibleBrands = brands.filter((b) => b.showInMarquee !== false);

  const moveOrder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = brands.map((b) => b.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderBrands(ids);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Brands strip" }]}
        title="Brands strip"
        description="Choose which brand logos scroll in the home page “Brands we've created for” section, set their order, and control the speed."
      />

      {/* Speed */}
      <section className="surface-raised mb-6 rounded-3xl p-6">
        <div className="mb-3 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-brand-fuchsia" />
          <h2 className="text-base font-semibold text-white">Scroll speed</h2>
          <span className="ml-auto text-sm text-slate-400">
            {settings.brandsSpeed}/10
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Slow</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={settings.brandsSpeed}
            onChange={(e) =>
              updateSettings({ brandsSpeed: Number(e.target.value) })
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-brand-fuchsia"
          />
          <span className="text-xs text-slate-400">Fast</span>
        </div>
      </section>

      {/* Live preview */}
      {visibleBrands.length > 0 && (
        <section className="surface-raised mb-6 overflow-hidden rounded-3xl">
          <p className="border-b border-white/10 px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Live preview
          </p>
          <BrandsMarquee brands={visibleBrands} speed={settings.brandsSpeed} />
        </section>
      )}

      {/* Brand list */}
      {brands.length === 0 ? (
        <EmptyState
          icon={Aperture}
          title="No brands yet"
          description="Add brands inside your categories first — they'll appear here to pick from."
        />
      ) : (
        <section className="surface-raised rounded-3xl p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <GripVertical className="h-3.5 w-3.5" />
              {visibleBrands.length} of {brands.length} shown · drag to reorder.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllBrandsMarquee(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <Eye className="h-4 w-4" /> Show all
              </button>
              <button
                type="button"
                onClick={() => setAllBrandsMarquee(false)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <EyeOff className="h-4 w-4" /> Hide all
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {brands.map((b) => {
              const visible = b.showInMarquee !== false;
              return (
                <div
                  key={b.id}
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
                    moveOrder(b.id);
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                    dragEndedAt.current = Date.now();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 transition",
                    "cursor-grab active:cursor-grabbing",
                    dragId === b.id && "opacity-40",
                    overId === b.id && dragId !== b.id
                      ? "border-brand-fuchsia"
                      : "border-white/10",
                    !visible && "opacity-60"
                  )}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-500" />
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink-700 ring-2 ring-white/10">
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logo}
                        alt={b.name}
                        draggable={false}
                        className={cn(
                          "h-full w-full object-cover",
                          !visible && "grayscale"
                        )}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate font-medium text-white">
                    {b.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateBrand(b.id, { showInMarquee: !visible })}
                    title={visible ? "Showing in strip — hide" : "Hidden — show"}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                      visible
                        ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    {visible ? "Shown" : "Hidden"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
