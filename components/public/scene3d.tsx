"use client";

/**
 * @file <Scene3D> — fixed full-screen React Three Fiber scene that lives behind
 * the landing page (transparent canvas, so the page's gradient shows through).
 *
 * A glowing distorted "lens orb" with tumbling aperture rings is the
 * centerpiece; photography gear floats and orbits around it — a DSLR camera, a
 * lens, a film canister, and a couple of floating photos. The camera arcs as
 * the visitor scrolls and drifts gently with the pointer, and the orb pulses
 * whenever the page fires a "mickey:snap" event (the shutter tap).
 *
 * Colours follow the site's brand palette (tailwind.config.ts). Rendered with
 * pointer-events:none behind the content and loaded via next/dynamic ssr:false
 * so three.js never runs on the server.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, Torus } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Brand palette (tailwind.config.ts) ───
const VIOLET = "#7c3aed";
const FUCHSIA = "#d946ef";
const PINK = "#ec4899";
const CYAN = "#22d3ee";
const AMBER = "#fbbf24";
const STEEL = "#94a3b8";
const WHITE = "#f8fafc";
const DARK = "#0b0a14";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Ref1 = { current: number };
type Pointer = { current: { x: number; y: number } };

/** Camera arcs through the scene on scroll and drifts with the pointer. */
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

/* ─── Centerpiece: glowing distorted lens orb + tumbling aperture rings ─── */
function LensOrb({ progress, pulse }: { progress: Ref1; pulse: Ref1 }) {
  const core = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    if (pulse.current > 0) pulse.current = Math.max(0, pulse.current - 0.035);
    const pl = pulse.current;
    if (core.current) {
      core.current.rotation.y = t * 0.3 + p * Math.PI * 2;
      core.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      core.current.scale.setScalar(1 + p * 0.3 + pl * 0.25);
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.2;
      wire.current.scale.setScalar(1.1 + p * 0.35 + pl * 0.3);
    }
    if (rings.current) {
      rings.current.rotation.z = t * 0.15;
      rings.current.rotation.x = Math.sin(t * 0.3) * 0.35 + 0.4;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <Sphere ref={core} args={[1.25, 96, 96]}>
        <MeshDistortMaterial
          color={VIOLET}
          emissive={FUCHSIA}
          emissiveIntensity={0.5}
          distort={0.4}
          speed={2}
          roughness={0.12}
          metalness={0.9}
        />
      </Sphere>
      <Sphere ref={wire} args={[1.3, 48, 48]}>
        <meshBasicMaterial color={CYAN} transparent opacity={0.1} wireframe />
      </Sphere>
      {/* aperture / lens rings */}
      <group ref={rings}>
        {[1.7, 1.95, 2.2].map((r, i) => (
          <Torus key={i} args={[r, 0.02, 12, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={i % 2 ? CYAN : VIOLET}
              emissive={i % 2 ? CYAN : FUCHSIA}
              emissiveIntensity={0.7}
              metalness={0.6}
              roughness={0.3}
            />
          </Torus>
        ))}
      </group>
    </Float>
  );
}

/* ─── DSLR camera ─── */
function CameraBody() {
  return (
    <group scale={0.6} rotation={[0.1, 0.5, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} emissive={VIOLET} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.42, 0.26, 0.42]} />
        <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.5, 32]} />
        <meshStandardMaterial color="#070610" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.07, 32]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} metalness={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0.42, 0.46, 0.06]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color={FUCHSIA} emissive={FUCHSIA} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.34, 0.5, 0.12]}>
        <boxGeometry args={[0.22, 0.12, 0.08]} />
        <meshStandardMaterial color={WHITE} emissive={WHITE} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Stand-alone lens ─── */
function Lens() {
  return (
    <group scale={0.85} rotation={[Math.PI / 2, 0, 0.3]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.45, 0.7, 40]} />
        <meshStandardMaterial color="#070610" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.12, 0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 0.06, 40]} />
          <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 40]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.8} metalness={0.4} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ─── Film canister ─── */
function Film() {
  return (
    <group scale={0.7} rotation={[0.2, 0, 0.1]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.22} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.33, -0.12, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.12, 0.42, 0.012]} />
        <meshStandardMaterial color="#0d0a1a" metalness={0.3} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── Floating photo (polaroid) ─── */
function Polaroid({ color }: { color: string }) {
  return (
    <group scale={0.9}>
      <mesh>
        <boxGeometry args={[0.7, 0.84, 0.04]} />
        <meshStandardMaterial color={WHITE} metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 0.03]}>
        <boxGeometry args={[0.56, 0.56, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── The orbiting gear ─── */
function Orbiters({ progress }: { progress: Ref1 }) {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    const p = progress.current;
    if (group.current) {
      group.current.rotation.y = s.clock.elapsedTime * 0.22 + p * Math.PI * 3;
      group.current.rotation.x = p * Math.PI * 0.4;
    }
  });
  return (
    <group ref={group}>
      <Float speed={1.5} floatIntensity={1.6} rotationIntensity={0.7}>
        <group position={[2.8, 0.7, 0]}>
          <CameraBody />
        </group>
      </Float>
      <Float speed={1.3} floatIntensity={1.5} rotationIntensity={0.6}>
        <group position={[-2.8, -0.5, 0.4]}>
          <Lens />
        </group>
      </Float>
      <Float speed={1.7} floatIntensity={1.7} rotationIntensity={0.8}>
        <group position={[0.5, -2.4, 0.7]}>
          <Film />
        </group>
      </Float>
      <Float speed={1.2} floatIntensity={1.4} rotationIntensity={0.5}>
        <group position={[2.2, -1.7, -0.5]}>
          <Polaroid color={CYAN} />
        </group>
      </Float>
      <Float speed={1.6} floatIntensity={1.6} rotationIntensity={0.7}>
        <group position={[-2.3, 1.6, -0.3]}>
          <Polaroid color={PINK} />
        </group>
      </Float>
    </group>
  );
}

export default function Scene3D() {
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const pulse = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onSnap = () => {
      pulse.current = 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mickey:snap", onSnap);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mickey:snap", onSnap);
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.4} color={CYAN} />
        <pointLight position={[-10, -8, -4]} intensity={1.1} color={FUCHSIA} />
        <pointLight position={[0, 6, 6]} intensity={0.8} color={VIOLET} />
        <Stars radius={70} depth={50} count={1800} factor={4} fade speed={0.6} />
        <ScrollRig progress={progress} pointer={pointer} />
        <LensOrb progress={progress} pulse={pulse} />
        <Orbiters progress={progress} />
      </Suspense>
    </Canvas>
  );
}
