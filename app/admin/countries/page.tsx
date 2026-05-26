"use client";

import { useState } from "react";
import { Globe, Plus, X, Aperture, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountryPicker } from "@/components/admin/CountryPicker";
import { BrandMultiPicker } from "@/components/admin/BrandMultiPicker";
import { flagUrl } from "@/lib/countries";
import type { Country } from "@/lib/types";

export default function CountriesPage() {
  const { countries, brands, addCountry, updateCountry, deleteCountry } =
    useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [managing, setManaging] = useState<Country | null>(null);

  const brandsOf = (c: Country) =>
    (c.brandIds ?? [])
      .map((id) => brands.find((b) => b.id === id))
      .filter((b): b is NonNullable<typeof b> => !!b);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Countries" }]}
        title="Countries"
        description="Flags shown in the 'around the world' section. Add countries and the brands you worked with there — clicking a country on the globe shows its brands."
        actions={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" /> Add countries
          </Button>
        }
      />

      {countries.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No countries yet"
          description="Add the countries you've worked in — their flags appear on the landing page."
          action={
            <Button onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4" /> Add countries
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            {countries.length} countr{countries.length === 1 ? "y" : "ies"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => {
              const linked = brandsOf(c);
              return (
                <div
                  key={c.id}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flagUrl(c.code, 80)}
                      alt={c.name}
                      className="h-8 w-12 shrink-0 rounded object-cover ring-1 ring-white/10"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                      {c.name}
                    </span>
                    <button
                      onClick={() => deleteCountry(c.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100"
                      aria-label={`Remove ${c.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] p-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {linked.length > 0 ? (
                        <div className="flex -space-x-2">
                          {linked.slice(0, 4).map((b) => (
                            <span
                              key={b.id}
                              className="h-7 w-7 overflow-hidden rounded-full bg-ink-700 ring-2 ring-ink-900"
                              title={b.name}
                            >
                              {b.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={b.logo}
                                  alt={b.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                                  {b.name.charAt(0)}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Aperture className="h-3.5 w-3.5" /> No brands
                        </span>
                      )}
                      {linked.length > 0 && (
                        <span className="text-xs text-slate-400">
                          {linked.length} brand{linked.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setManaging(c)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Brands
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CountryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingCodes={countries.map((c) => c.code)}
        onAdd={(code, name) => addCountry({ code, name })}
      />

      <BrandMultiPicker
        open={!!managing}
        title={managing ? `Brands in ${managing.name}` : "Brands"}
        subtitle="Pick the brands you worked with here. They show when this country is clicked on the globe."
        selectedIds={managing?.brandIds ?? []}
        onClose={() => setManaging(null)}
        onSave={(ids) => {
          if (managing) updateCountry(managing.id, { brandIds: ids });
          setManaging(null);
        }}
      />
    </div>
  );
}
