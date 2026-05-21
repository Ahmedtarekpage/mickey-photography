"use client";

import { CalendarCheck, ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

/** WhatsApp brand glyph (lucide has no WhatsApp icon). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.087zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

/**
 * The "Book with us" call-to-action — the most important conversion point for a
 * photographer. Two highlighted routes: an instant WhatsApp chat (number set in
 * admin) and a Google Calendar booking link. Buttons whose source field is
 * empty are hidden, and the whole section disappears if neither is set.
 */
export function BookSection({ settings }: { settings: SiteSettings }) {
  const waDigits = (settings.whatsapp || "").replace(/[^\d]/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}${
        settings.whatsappMessage
          ? `?text=${encodeURIComponent(settings.whatsappMessage)}`
          : ""
      }`
    : "";
  const calHref = (settings.calendarUrl || "").trim();

  if (!waHref && !calHref) return null;

  return (
    <section id="book" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl sm:p-12">
        {/* glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-fuchsia/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-96 rounded-full bg-brand-cyan/15 blur-[120px]" />

        <div className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-cyan">
            Booking
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Book your <span className="text-gradient">shoot</span> with us.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Message us on WhatsApp for a fast quote, or grab a slot on the
            calendar — whichever&apos;s easier for you.
          </p>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-start gap-4 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 transition hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-emerald-500/15"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)]">
                <WhatsAppIcon className="h-7 w-7" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
                  Chat on WhatsApp
                  <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {settings.whatsapp} · instant reply
                </p>
              </div>
            </a>
          )}

          {calHref && (
            <a
              href={calHref}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-brand-gradient-soft p-6 transition hover:-translate-y-1 hover:border-white/30"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_10px_30px_-8px_rgba(217,70,239,0.7)]">
                <CalendarCheck className="h-7 w-7" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
                  Book a call
                  <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Pick a time on Google Calendar
                </p>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
