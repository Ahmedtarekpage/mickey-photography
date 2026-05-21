"use client";

import { Mail, Instagram, Linkedin, Facebook } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

type Social = { label: string; Icon: typeof Instagram; href: string };

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials: Social[] = [];
  if (settings.instagram)
    socials.push({
      label: "Instagram",
      Icon: Instagram,
      href: settings.instagram.startsWith("http")
        ? settings.instagram
        : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`,
    });
  if (settings.linkedin)
    socials.push({ label: "LinkedIn", Icon: Linkedin, href: settings.linkedin });
  if (settings.facebook)
    socials.push({ label: "Facebook", Icon: Facebook, href: settings.facebook });

  return (
    <footer
      id="contact"
      className="relative mt-12 overflow-hidden border-t border-white/10"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-fuchsia/15 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-cyan">
          Get in touch
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Let&apos;s create something{" "}
          <span className="text-gradient">unforgettable</span>.
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(217,70,239,0.6)] transition hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" /> {settings.email}
            </a>
          )}
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              title={s.label}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
            >
              <s.Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row">
          <span className="font-bold uppercase tracking-[0.3em] text-slate-300">
            {settings.siteName}
          </span>
          <span>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
