"use client";

import { useState } from "react";
import { Globe, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountryPicker } from "@/components/admin/CountryPicker";
import { flagUrl } from "@/lib/countries";

export default function CountriesPage() {
  const { countries, addCountry, deleteCountry } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Countries" }]}
        title="Countries"
        description="Flags shown in the 'around the world' section. Add the countries you've worked in."
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => (
              <div
                key={c.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
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
            ))}
          </div>
        </>
      )}

      <CountryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingCodes={countries.map((c) => c.code)}
        onAdd={(code, name) => addCountry({ code, name })}
      />
    </div>
  );
}
