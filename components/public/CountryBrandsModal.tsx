"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { flagUrl } from "@/lib/countries";
import { useStore } from "@/lib/store";
import type { Brand, Country } from "@/lib/types";

/**
 * Shown when a country marker on the globe is clicked: its brands, so visitors
 * can pick one. Each brand links to its work page.
 */
export function CountryBrandsModal({
  country,
  onClose,
}: {
  country: Country | null;
  onClose: () => void;
}) {
  const { brands } = useStore();

  useEffect(() => {
    if (!country) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [country, onClose]);

  if (!country || typeof document === "undefined") return null;

  const list = (country.brandIds ?? [])
    .map((id) => brands.find((b) => b.id === id))
    .filter((b): b is Brand => !!b);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-ink-950/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="surface-raised relative z-10 w-full max-w-lg rounded-3xl animate-scale-in">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagUrl(country.code, 80)}
              alt={country.name}
              className="h-7 w-10 shrink-0 rounded object-cover ring-1 ring-white/15"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{country.name}</h3>
              <p className="text-xs text-slate-400">
                {list.length
                  ? `${list.length} brand${list.length === 1 ? "" : "s"}`
                  : "Brands"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scroll-slim p-5 sm:p-6">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No brands listed for {country.name} yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {list.map((b) => (
                <Link
                  key={b.id}
                  href={`/work/${b.categoryIds[0] ?? ""}/${b.id}`}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-brand-fuchsia/40 hover:bg-white/[0.06]"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink-700 ring-2 ring-white/10">
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {b.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate font-medium text-white">
                    {b.name}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-fuchsia opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
