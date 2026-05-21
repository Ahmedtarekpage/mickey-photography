"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { STAT_ICON_KEYS, StatIcon } from "@/lib/statIcons";
import type { Stat } from "@/lib/types";

export type StatDraft = {
  label: string;
  value: string;
  suffix: string;
  icon: string;
};

const empty: StatDraft = {
  label: "",
  value: "",
  suffix: "",
  icon: "globe",
};

export function StatForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: StatDraft) => void;
  initial?: Stat | null;
}) {
  const [draft, setDraft] = useState<StatDraft>(empty);

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              label: initial.label,
              value: String(initial.value),
              suffix: initial.suffix,
              icon: initial.icon,
            }
          : empty
      );
    }
  }, [open, initial]);

  const set = <K extends keyof StatDraft>(k: K, v: StatDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = draft.label.trim().length > 0 && draft.value.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit stat" : "New stat"}
      subtitle="A headline number for the landing page (e.g. countries, clients)."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            {initial ? "Save changes" : "Create stat"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Live preview */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-gradient-soft p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <StatIcon name={draft.icon} className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black leading-none text-white">
              {draft.value || "0"}
              <span className="text-gradient">{draft.suffix}</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {draft.label || "Label"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Number">
            <Input
              type="number"
              value={draft.value}
              onChange={(e) => set("value", e.target.value)}
              placeholder="e.g. 14"
              autoFocus
            />
          </Field>
          <Field label="Suffix" hint="(optional)">
            <Input
              value={draft.suffix}
              onChange={(e) => set("suffix", e.target.value)}
              placeholder="+ , k, M"
            />
          </Field>
        </div>

        <Field label="Label">
          <Input
            value={draft.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Countries we worked with"
          />
        </Field>

        <Field label="Icon">
          <div className="grid grid-cols-6 gap-2">
            {STAT_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => set("icon", key)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl border transition",
                  draft.icon === key
                    ? "border-brand-fuchsia/50 bg-brand-gradient-soft text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                )}
                aria-label={key}
              >
                <StatIcon name={key} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
