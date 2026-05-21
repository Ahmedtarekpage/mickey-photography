"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Aperture,
  Film,
  Settings,
  Sparkles,
  ExternalLink,
  BarChart3,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
  { href: "/admin/countries", label: "Countries", icon: Globe },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { categories, brands, photos, reels } = useStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-72 flex-col gap-6 border-r border-white/10 bg-ink-900/60 px-4 py-6 backdrop-blur-xl">
      {/* Brand */}
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 px-2"
      >
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
          <Aperture className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-white">Lumen</p>
          <p className="text-xs text-slate-400">3D Photography</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-gradient-soft text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "bg-white/5 text-slate-400 group-hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Live counts */}
      <div className="surface space-y-3 rounded-3xl p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-brand-amber" /> Library
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <Stat label="Categories" value={categories.length} icon={FolderKanban} />
          <Stat label="Brands" value={brands.length} icon={Aperture} />
          <Stat label="Media" value={photos.length} icon={LayoutDashboard} />
          <Stat label="Reels" value={reels.length} icon={Film} />
        </div>
      </div>

      <div className="mt-auto px-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">View live site</span>
        </a>
      </div>
    </aside>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Aperture;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] px-2 py-2.5">
      <Icon className="mx-auto mb-1 h-4 w-4 text-brand-fuchsia" />
      <p className="text-lg font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}
