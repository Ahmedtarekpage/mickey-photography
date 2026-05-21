"use client";

import { useState } from "react";
import { BarChart3, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardMenu } from "@/components/ui/CardMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatForm, type StatDraft } from "@/components/admin/StatForm";
import { StatIcon } from "@/lib/statIcons";
import type { Stat } from "@/lib/types";

export default function StatsPage() {
  const { stats, addStat, updateStat, deleteStat } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [deleting, setDeleting] = useState<Stat | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Stat) => {
    setEditing(s);
    setFormOpen(true);
  };

  const handleSubmit = (draft: StatDraft) => {
    const payload = {
      label: draft.label,
      value: Number(draft.value) || 0,
      suffix: draft.suffix,
      icon: draft.icon,
    };
    if (editing) updateStat(editing.id, payload);
    else addStat(payload);
    setFormOpen(false);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Stats" }]}
        title="Stats"
        description="Headline numbers shown in the 'by the numbers' band above the portfolio."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New stat
          </Button>
        }
      />

      {stats.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No stats yet"
          description="Add numbers like countries worked with, clients, or projects delivered."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New stat
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="card-3d group relative p-6">
              <div className="absolute right-3 top-3">
                <CardMenu
                  onEdit={() => openEdit(s)}
                  onDelete={() => setDeleting(s)}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-3d">
                <StatIcon name={s.icon} className="h-6 w-6" />
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-white">
                {s.value}
                <span className="text-gradient">{s.suffix}</span>
              </p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <StatForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete stat?"
        message={`"${deleting?.label}" will be permanently removed.`}
        onConfirm={() => {
          if (deleting) deleteStat(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
