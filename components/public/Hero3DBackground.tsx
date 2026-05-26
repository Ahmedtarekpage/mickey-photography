"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { shutterClick } from "@/lib/sfx";

// Real WebGL scene — client only, behind the page, never blocks server render.
const Scene3D = dynamic(() => import("./scene3d"), {
  ssr: false,
  loading: () => null,
});

/**
 * Full-screen 3D backdrop for the landing page. The canvas is transparent so
 * the page's gradient shows through, sits behind the content (-z-10) and never
 * intercepts clicks. If WebGL is unavailable the ErrorBoundary drops it and the
 * page keeps its normal gradient background.
 */
export function Hero3DBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <ErrorBoundary fallback={null}>
        <Scene3D />
      </ErrorBoundary>
    </div>
  );
}

/**
 * "Take a photo" interaction: tapping the hero area plays a camera-shutter
 * sound, flashes the screen, and pulses the 3D orb (via a `mickey:snap` event).
 * Ignores clicks on real controls and anything below the hero, and stays quiet
 * while a modal is open.
 */
export function ShutterFlash() {
  const [flash, setFlash] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem("mk_snap_hint")) {
        setHint(true);
        sessionStorage.setItem("mk_snap_hint", "1");
        window.setTimeout(() => setHint(false), 5000);
      }
    } catch {
      /* sessionStorage may be unavailable */
    }

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        !t ||
        t.closest("a,button,input,textarea,select,video,label,[role=button]")
      )
        return;
      // Only in the hero region, and never over an open modal/lightbox.
      if (window.scrollY > window.innerHeight * 0.85) return;
      if (document.body.style.overflow === "hidden") return;

      shutterClick();
      window.dispatchEvent(new Event("mickey:snap"));
      setFlash(true);
      window.setTimeout(() => setFlash(false), 180);
      setHint(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[90] bg-white transition-opacity duration-150 ${
          flash ? "opacity-50" : "opacity-0"
        }`}
      />
      {hint && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-[70] flex justify-center px-4">
          <span className="rounded-full border border-white/15 bg-ink-900/70 px-4 py-1.5 text-xs font-medium text-slate-200 backdrop-blur animate-fade-in">
            📸 Tap the hero to snap a photo
          </span>
        </div>
      )}
    </>
  );
}
