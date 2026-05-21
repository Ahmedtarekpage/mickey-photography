"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Video, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { Medium } from "@/lib/types";

export function CategoriesSection() {
  const { categories, brands } = useStore();
  const [medium, setMedium] = useState<Medium>("photography");

  const hasVideography = categories.some((c) => c.medium === "videography");
  const list = categories.filter((c) => c.medium === medium);

  return (
    <section id="work" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-fuchsia">
            Portfolio
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Browse the work
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Pick a category, choose a brand, and explore its photos and videos.
          </p>
        </div>

        {hasVideography && (
          <div className="inline-flex shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            {(
              [
                { id: "photography", label: "Photography", icon: Camera },
                { id: "videography", label: "Videography", icon: Video },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMedium(m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                  medium === m.id
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <m.icon className="h-4 w-4" /> {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => {
            const count = brands.filter((b) => b.categoryId === c.id).length;
            return (
              <Link
                key={c.id}
                href={`/work/${c.id}`}
                className="card-3d group relative flex flex-col items-center p-6 text-center"
              >
                <div className="relative mb-4 mt-2">
                  <div
                    className="absolute -inset-1 rounded-full opacity-50 blur-md transition group-hover:opacity-90"
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
                <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {count} brand{count === 1 ? "" : "s"}
                </p>
                <span className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-fuchsia opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
