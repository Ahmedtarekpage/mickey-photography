"use client";

import Link from "next/link";
import {
  FolderKanban,
  Aperture,
  Images,
  Film,
  ArrowRight,
  Star,
  Plus,
  TrendingUp,
  Camera,
  Video,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function OverviewPage() {
  const { categories, brands, photos, reels, ready } = useStore();

  const stats = [
    {
      label: "Categories",
      value: categories.length,
      icon: FolderKanban,
      tone: "from-brand-violet to-brand-fuchsia",
      href: "/admin/categories",
    },
    {
      label: "Brands",
      value: brands.length,
      icon: Aperture,
      tone: "from-brand-cyan to-blue-500",
      href: "/admin/categories",
    },
    {
      label: "Photos & videos",
      value: photos.length,
      icon: Images,
      tone: "from-brand-pink to-rose-500",
      href: "/admin/categories",
    },
    {
      label: "BTS Reels",
      value: reels.length,
      icon: Film,
      tone: "from-brand-lime to-emerald-500",
      href: "/admin/categories",
    },
  ];

  const featured = brands.filter((b) => b.featured).slice(0, 4);

  return (
    <div>
      <PageHeader
        title={
          <>
            Welcome back, <span className="text-gradient">Studio</span>
          </>
        }
        description="Manage the full content library — categories, brands, gallery photos and behind-the-scenes reels."
        actions={
          <Link href="/admin/categories">
            <Button>
              <Plus className="h-4 w-4" /> New category
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-3d group p-5">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-3d`}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">
              {ready ? s.value : "—"}
            </p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Featured + content split */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Featured brands */}
        <section className="surface-raised rounded-3xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Star className="h-5 w-5 text-brand-amber" /> Featured brands
            </h2>
            <Link
              href="/admin/categories"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              View all
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No featured brands yet. Mark a brand as featured to highlight it here.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((b) => {
                const cat = categories.find((c) => c.id === b.categoryId);
                const count = photos.filter((p) => p.brandId === b.id).length;
                return (
                  <Link
                    key={b.id}
                    href={`/admin/categories/${b.categoryId}/brands/${b.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-brand-fuchsia/30 hover:bg-white/[0.06]"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-ink-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{b.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        {cat?.name} · {count} photo{count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Categories quick list */}
        <section className="surface-raised rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-brand-cyan" /> By category
            </h2>
          </div>
          <div className="space-y-3">
            {categories.map((c) => {
              const brandCount = brands.filter(
                (b) => b.categoryId === c.id
              ).length;
              return (
                <Link
                  key={c.id}
                  href={`/admin/categories/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.accent }}
                    />
                    <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                      {c.medium === "videography" ? (
                        <Video className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {c.name}
                    </span>
                  </div>
                  <Badge tone="violet">{brandCount} brands</Badge>
                </Link>
              );
            })}
            {categories.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No categories yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
