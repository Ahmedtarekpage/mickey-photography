"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "./cn";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string; emoji?: string };

interface ToastApi {
  show: (message: string, type?: ToastType, emoji?: string) => void;
  success: (message: string, emoji?: string) => void;
  error: (message: string, emoji?: string) => void;
  info: (message: string, emoji?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// One shared AudioContext, created lazily on the first toast (a user gesture,
// so autoplay restrictions are satisfied). A short synthesized chime — no asset.
let audioCtx: AudioContext | null = null;
function playChime(type: ToastType) {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    // success rises, info is a single note, error drops.
    const notes =
      type === "success" ? [660, 990] : type === "error" ? [320, 220] : [760];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.085;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  } catch {
    /* audio unavailable — toast still shows */
  }
}

const styles: Record<ToastType, { icon: typeof Check; chip: string }> = {
  success: { icon: Check, chip: "bg-emerald-500/20 text-emerald-300" },
  error: { icon: AlertTriangle, chip: "bg-red-500/20 text-red-300" },
  info: { icon: Info, chip: "bg-brand-cyan/20 text-brand-cyan" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "success", emoji?: string) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, type, message, emoji }]);
      playChime(type);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, emoji) => show(m, "success", emoji),
      error: (m, emoji) => show(m, "error", emoji),
      info: (m, emoji) => show(m, "info", emoji),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5">
            {toasts.map((t) => {
              const { icon: Icon, chip } = styles[t.type];
              return (
                <div
                  key={t.id}
                  className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-3 pr-2.5 shadow-3d backdrop-blur-xl"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      chip
                    )}
                  >
                    {t.emoji ? (
                      <span className="animate-emoji-pop text-2xl leading-none">
                        {t.emoji}
                      </span>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </span>
                  <p className="flex-1 text-sm font-medium text-white">
                    {t.message}
                  </p>
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
