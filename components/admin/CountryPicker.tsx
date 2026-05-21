"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { COUNTRY_LIST, flagUrl } from "@/lib/countries";

export function CountryPicker({
  open,
  onClose,
  existingCodes,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  existingCodes: string[];
  onAdd: (code: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const has = useMemo(() => new Set(existingCodes), [existingCodes]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRY_LIST.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [query]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add countries"
      subtitle="Search and tap a country to add its flag."
      footer={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries…"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brand-fuchsia/40"
          />
        </div>

        <div className="max-h-[50vh] space-y-1 overflow-y-auto scroll-slim pr-1">
          {results.map((c) => {
            const added = has.has(c.code);
            return (
              <button
                key={c.code}
                disabled={added}
                onClick={() => onAdd(c.code, c.name)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                  added
                    ? "border-brand-lime/30 bg-brand-lime/10"
                    : "border-white/10 bg-white/[0.03] hover:border-brand-fuchsia/30 hover:bg-white/[0.06]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagUrl(c.code, 80)}
                  alt={c.name}
                  className="h-6 w-9 shrink-0 rounded object-cover ring-1 ring-white/10"
                />
                <span className="flex-1 text-sm font-medium text-white">
                  {c.name}
                </span>
                {added ? (
                  <Check className="h-4 w-4 text-brand-lime" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-400" />
                )}
              </button>
            );
          })}
          {results.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No countries match “{query}”.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
