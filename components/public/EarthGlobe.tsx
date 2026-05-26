"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { flagUrl, COUNTRY_COORDS } from "@/lib/countries";
import type { Country } from "@/lib/types";

type Marker = { lat: number; lng: number; code: string; name: string };

/**
 * Interactive 3D earth (drag to rotate, scroll to zoom) with each country's
 * flag pinned at its real coordinates. Client-only — relies on WebGL.
 */
export function EarthGlobe({
  countries,
  onSelect,
}: {
  countries: Country[];
  /** Called with a country code when its marker is clicked. */
  onSelect?: (code: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(440);
  // Hold the latest callback so the imperatively-built markers always call it.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize(Math.min(el.offsetWidth, 540));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: 20, lng: 12, altitude: 2.4 }, 0);
    const c = g.controls();
    c.autoRotate = true;
    c.autoRotateSpeed = 0.55;
    c.enableZoom = true;
    c.minDistance = 160;
    c.maxDistance = 520;
  }, [size]);

  const markers: Marker[] = countries
    .map((c) => {
      const co = COUNTRY_COORDS[c.code];
      return co ? { lat: co[0], lng: co[1], code: c.code, name: c.name } : null;
    })
    .filter((m): m is Marker => m !== null);

  const makeEl = (d: object) => {
    const m = d as Marker;
    const el = document.createElement("div");
    el.title = m.name;
    el.style.cssText =
      "transform:translate(-50%,-50%);cursor:pointer;transition:transform .2s ease;will-change:transform;";
    el.innerHTML = `<img src="${flagUrl(
      m.code,
      80
    )}" alt="${m.name}" style="width:24px;height:24px;border-radius:9999px;object-fit:cover;display:block;box-shadow:0 0 0 2px rgba(255,255,255,.7),0 4px 12px rgba(0,0,0,.6);" />`;
    el.onmouseenter = () => {
      el.style.transform = "translate(-50%,-50%) scale(1.4)";
      el.style.zIndex = "10";
    };
    el.onmouseleave = () => {
      el.style.transform = "translate(-50%,-50%) scale(1)";
      el.style.zIndex = "";
    };
    el.onclick = () => onSelectRef.current?.(m.code);
    return el;
  };

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[540px]">
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#a855f7"
        atmosphereAltitude={0.18}
        htmlElementsData={markers}
        htmlElement={makeEl}
        htmlElementVisibilityModifier={(el: HTMLElement, isVisible: boolean) => {
          el.style.opacity = isVisible ? "1" : "0";
          el.style.pointerEvents = isVisible ? "auto" : "none";
        }}
      />
    </div>
  );
}
