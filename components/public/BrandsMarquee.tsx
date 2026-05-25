"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/types";

/** chip width (w-28 = 112px) + right margin (mr-10 = 40px) */
const ITEM_W = 152;

function BrandChip({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/work/${brand.categoryIds[0] ?? ""}/${brand.id}`}
      className="group mr-10 flex w-28 shrink-0 flex-col items-center gap-3"
    >
      <span className="relative">
        <span className="absolute -inset-1 rounded-full bg-brand-gradient opacity-0 blur-md transition group-hover:opacity-70" />
        <span className="relative block h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/10 transition group-hover:ring-white/30">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-ink-700 text-xl font-bold text-white">
              {brand.name.charAt(0)}
            </span>
          )}
        </span>
      </span>
      <span className="w-full truncate text-center text-xs font-medium text-slate-400 transition group-hover:text-white">
        {brand.name}
      </span>
    </Link>
  );
}

export function BrandsMarquee({
  brands,
  speed = 7,
}: {
  brands: Brand[];
  speed?: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(1440);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportW(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (brands.length === 0) return null;

  // Repeat the brands enough that one "set" is wider than the viewport — this
  // guarantees the looping row is always full (no empty gap).
  const passW = brands.length * ITEM_W;
  const copies = Math.max(2, Math.ceil((viewportW + ITEM_W) / passW));
  const set = Array.from({ length: copies }, () => brands).flat();
  const setW = set.length * ITEM_W;

  // Speed slider 1 (slow) … 10 (fast) → pixels/second, then derive duration so
  // the perceived speed is constant regardless of how many brands there are.
  const clamped = Math.min(10, Math.max(1, speed));
  const pxPerSec = 30 + (clamped - 1) * 30; // 30 … 300 px/s
  const duration = `${(setW / pxPerSec).toFixed(1)}s`;

  return (
    <section id="brands" className="overflow-hidden py-16">
      <div className="mx-auto mb-8 max-w-7xl px-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-cyan">
          Trusted by
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Brands we&apos;ve created for
        </h2>
      </div>

      <div
        ref={viewportRef}
        className="group/marquee relative flex"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="flex shrink-0 animate-marquee [animation-play-state:running] group-hover/marquee:[animation-play-state:paused]">
          {[...set, ...set].map((b, i) => (
            <BrandChip key={`${b.id}-${i}`} brand={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
