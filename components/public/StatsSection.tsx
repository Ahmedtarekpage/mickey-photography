"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { StatIcon } from "@/lib/statIcons";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CountryBrandsModal } from "@/components/public/CountryBrandsModal";
import type { Country, Stat } from "@/lib/types";

// Real WebGL globe — load only on the client.
const EarthGlobe = dynamic(
  () => import("./EarthGlobe").then((m) => m.EarthGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto aspect-square w-full max-w-[440px] animate-pulse rounded-full bg-white/[0.04]" />
    ),
  }
);

/** Animates a number from 0 → value once it scrolls into view. */
function CountUp({ value, duration = 1500 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function StatsSection({
  stats,
  countries,
}: {
  stats: Stat[];
  countries: Country[];
}) {
  const [openCode, setOpenCode] = useState<string | null>(null);
  const openCountry = countries.find((c) => c.code === openCode) ?? null;

  if (stats.length === 0 && countries.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute right-0 top-1/2 h-[40rem] w-[40rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-cyan/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-amber">
            Around the world
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A track record that travels
          </h2>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* LEFT — numbers */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {stats.map((s) => (
              <div
                key={s.id}
                className="card-3d group flex flex-col items-start p-4 sm:p-6"
              >
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-3d transition group-hover:scale-110 sm:mb-3 sm:h-11 sm:w-11">
                  <StatIcon name={s.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="flex items-baseline whitespace-nowrap text-2xl font-black leading-none tracking-tight text-white tabular-nums sm:text-4xl">
                  <CountUp value={s.value} />
                  <span className="text-gradient">{s.suffix}</span>
                </p>
                <p className="mt-1.5 text-xs leading-snug text-slate-400 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT — interactive 3D earth with flags at real locations */}
          {countries.length > 0 && (
            <div className="flex flex-col items-center">
              {/* Isolated — if WebGL/three.js fails (old or low-memory devices),
                  the globe is dropped instead of blanking the page. */}
              <ErrorBoundary fallback={null}>
                <EarthGlobe countries={countries} onSelect={setOpenCode} />
              </ErrorBoundary>
              <p className="mt-3 text-sm text-slate-400">
                <span className="font-semibold text-white">
                  {countries.length}
                </span>{" "}
                countries · drag to spin · tap a flag to see its brands
              </p>
            </div>
          )}
        </div>
      </div>

      <CountryBrandsModal
        country={openCountry}
        onClose={() => setOpenCode(null)}
      />
    </section>
  );
}
