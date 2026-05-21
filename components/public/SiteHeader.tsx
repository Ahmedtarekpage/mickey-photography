"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, CalendarCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const LINKS = [
  { href: "/#about", label: "Studio" },
  { href: "/#brands", label: "Brands" },
  { href: "/#work", label: "Work" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      {/* Section 1 — header: name (left) · logo (center) · menu (right) */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="flex-1 text-sm font-bold uppercase tracking-[0.3em] text-white"
        >
          {settings.siteName}
        </Link>

        {/* Full logo — shown as-is, not constrained to a circle */}
        <Link href="/" className="flex shrink-0 items-center justify-center">
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo}
              alt={settings.siteName}
              className="h-12 w-auto max-w-[160px] object-contain"
            />
          ) : null}
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#book"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(217,70,239,0.6)] transition hover:-translate-y-0.5"
          >
            <CalendarCheck className="h-4 w-4" /> Book
          </a>
        </div>

        <button
          className="flex flex-1 justify-end text-white md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-ink-950/90 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-slate-200"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/#book"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white"
            >
              <CalendarCheck className="h-4 w-4" /> Book with us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
