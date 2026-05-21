"use client";

import { useState } from "react";
import { Menu, RotateCcw, Search, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { resetData } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-ink-950/70 px-4 py-3 backdrop-blur-xl sm:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search categories, brands, photos…"
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brand-fuchsia/40 focus:bg-white/[0.06]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmReset(true)}
          title="Reset all data to the seed sample"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset data</span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          title="Sign out of the admin"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-sm font-bold text-white shadow-glow">
          AT
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        message="This restores the original sample categories, brands, photos and reels. Anything you added or edited in this browser will be lost."
        confirmLabel="Reset"
        onConfirm={() => {
          resetData();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </header>
  );
}
