"use client";

import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * Multi-select brands (used to attach brands to a country). Pre-checks the
 * given ids; "Save" reports the new selection.
 */
export function BrandMultiPicker({
  open,
  title,
  subtitle,
  selectedIds,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const { brands } = useStore();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSel(new Set(selectedIds));
      setQuery("");
    }
  }, [open, selectedIds]);

  const q = query.trim().toLowerCase();
  const shown = q
    ? brands.filter((b) => b.name.toLowerCase().includes(q))
    : brands;

  const toggle = (id: string) =>
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(Array.from(sel))}>
            Save ({sel.size})
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands…"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brand-fuchsia/50"
          />
        </div>

        {shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No brands match.
          </p>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-1 gap-2 overflow-y-auto pr-1 scroll-slim sm:grid-cols-2">
            {shown.map((b) => {
              const on = sel.has(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-2.5 text-left transition",
                    on
                      ? "border-brand-fuchsia/50 bg-brand-fuchsia/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-ink-700 ring-1 ring-white/10">
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                    {b.name}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition",
                      on
                        ? "border-brand-fuchsia bg-brand-fuchsia text-white"
                        : "border-white/20 text-transparent"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
