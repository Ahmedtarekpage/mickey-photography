"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Save } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ImageInput } from "@/components/ui/ImageInput";
import { VideoInput } from "@/components/ui/VideoInput";
import type { SiteSettings } from "@/lib/types";

export default function SiteSettingsPage() {
  const { settings, updateSettings, ready } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  // Sync the draft once data has hydrated from storage.
  useEffect(() => {
    if (ready) setDraft(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  };

  const save = () => {
    updateSettings(draft);
    setSaved(true);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Site settings" }]}
        title="Site settings"
        description="Edit what clients see on the public landing page — logo, name, hero reel and intro."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4" /> View site
              </Button>
            </Link>
            <Button onClick={save}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identity */}
        <section className="surface-raised space-y-5 rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Section 1 — Header</h2>
          <Field label="Logo" hint="(full logo — shown as-is in the header)">
            <ImageInput
              value={draft.logo}
              onChange={(v) => set("logo", v)}
              aspect="video"
            />
          </Field>
          <Field label="Website name">
            <Input
              value={draft.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              placeholder="e.g. LUMEN"
            />
          </Field>
          <Field label="Tagline" hint="(optional)">
            <Input
              value={draft.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="A short line under the name"
            />
          </Field>
        </section>

        {/* About / reel */}
        <section className="surface-raised space-y-5 rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Section 2 — Intro</h2>
          <Field label="Reel video" hint="(upload or paste a link)">
            <VideoInput
              value={draft.reelVideoUrl}
              onChange={(v) => set("reelVideoUrl", v)}
              onMeta={(m) => {
                if (m.poster && !draft.reelPoster) set("reelPoster", m.poster);
              }}
            />
          </Field>
          <Field label="Reel poster" hint="(auto-filled from the video)">
            <ImageInput
              value={draft.reelPoster}
              onChange={(v) => set("reelPoster", v)}
              aspect="portrait"
            />
          </Field>
          <Field label="Brief heading">
            <Input
              value={draft.briefHeading}
              onChange={(e) => set("briefHeading", e.target.value)}
              placeholder="A studio built on light & motion."
            />
          </Field>
          <Field label="Brief text">
            <Textarea
              rows={5}
              value={draft.brief}
              onChange={(e) => set("brief", e.target.value)}
              placeholder="Tell clients what you do…"
            />
          </Field>
        </section>

        {/* Brands marquee */}
        <section className="surface-raised space-y-5 rounded-3xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Section 3 — Brands</h2>
          <Field
            label="Auto-slide speed"
            hint={`(${draft.brandsSpeed}/10)`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Slow</span>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={draft.brandsSpeed}
                onChange={(e) => set("brandsSpeed", Number(e.target.value))}
                className="h-1.5 w-full max-w-md cursor-pointer appearance-none rounded-full bg-white/15 accent-brand-fuchsia"
              />
              <span className="text-xs text-slate-400">Fast</span>
            </div>
          </Field>
          <p className="text-xs text-slate-500">
            Controls how fast the brand logos scroll on the landing page. Save to
            apply.
          </p>
        </section>

        {/* Social / footer */}
        <section className="surface-raised space-y-5 rounded-3xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">
            Footer — Contact &amp; social
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <Input
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="hello@studio.com"
              />
            </Field>
            <Field label="Instagram" hint="(@handle or full URL)">
              <Input
                value={draft.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@handle"
              />
            </Field>
            <Field label="LinkedIn" hint="(full profile / page URL)">
              <Input
                value={draft.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/…"
              />
            </Field>
            <Field label="Facebook" hint="(full page URL)">
              <Input
                value={draft.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </Field>
          </div>
          <p className="text-xs text-slate-500">
            Leave a field empty to hide that icon in the footer.
          </p>
        </section>

        {/* Booking — highlighted on the landing page */}
        <section className="surface-raised space-y-5 rounded-3xl p-6 ring-1 ring-brand-fuchsia/30 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              Booking — “Book with us”
            </h2>
            <span className="rounded-full bg-brand-fuchsia/15 px-2.5 py-0.5 text-[11px] font-medium text-brand-fuchsia">
              Highlighted section
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="WhatsApp number"
              hint="(international, e.g. +1 555 010 2030)"
            >
              <Input
                value={draft.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="+1 555 010 2030"
              />
            </Field>
            <Field
              label="Google Calendar booking link"
              hint="(appointment schedule URL)"
            >
              <Input
                value={draft.calendarUrl}
                onChange={(e) => set("calendarUrl", e.target.value)}
                placeholder="https://calendar.app.google/…"
              />
            </Field>
          </div>
          <Field
            label="WhatsApp pre-filled message"
            hint="(optional — what the chat opens with)"
          >
            <Textarea
              rows={2}
              value={draft.whatsappMessage}
              onChange={(e) => set("whatsappMessage", e.target.value)}
              placeholder="Hi! I'd love to book a shoot."
            />
          </Field>
          <p className="text-xs text-slate-500">
            Leave a field empty to hide that button on the landing page.
          </p>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={save}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
