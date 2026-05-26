"use client";

/**
 * @file <Scene3D> — fixed full-screen starfield behind the landing page.
 *
 * Transparent canvas, so the page's gradient shows through. The camera drifts
 * on scroll and with the pointer, so the stars parallax subtly — a calm "space"
 * backdrop with no 3D objects. Rendered pointer-events:none behind the content
 * and loaded via next/dynamic ssr:false so three.js never runs on the server.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Ref1 = { current: number };
type Pointer = { current: { x: number; y: number } };

/** Camera drifts on scroll and with the pointer, so the starfield parallaxes. */
function ScrollRig({ progress, pointer }: { progress: Ref1; pointer: Pointer }) {
  useFrame((state) => {
    const p = progress.current;
    const tx = Math.sin(p * Math.PI * 2) * 2.4 + pointer.current.x * 0.9;
    const ty = -p * 3 + pointer.current.y * 0.6;
    const tz = 7 - p * 1.5;
    state.camera.position.x = lerp(state.camera.position.x, tx, 0.05);
    state.camera.position.y = lerp(state.camera.position.y, ty, 0.05);
    state.camera.position.z = lerp(state.camera.position.z, tz, 0.05);
    state.camera.lookAt(0, -p * 3, 0);
  });
  return null;
}

export default function Scene3D() {
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Stars radius={70} depth={50} count={1800} factor={4} fade speed={0.6} />
        <ScrollRig progress={progress} pointer={pointer} />
      </Suspense>
    </Canvas>
  );
}
