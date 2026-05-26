import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08060f",
          900: "#0d0a1a",
          850: "#120e24",
          800: "#181232",
          700: "#231a45",
          600: "#332663",
        },
        brand: {
          violet: "#7c3aed",
          fuchsia: "#d946ef",
          pink: "#ec4899",
          cyan: "#22d3ee",
          lime: "#a3e635",
          amber: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "3d": "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 18px 40px -12px rgba(124,58,237,0.45), 0 8px 16px -8px rgba(0,0,0,0.6)",
        "3d-hover":
          "0 1px 0 0 rgba(255,255,255,0.14) inset, 0 28px 60px -10px rgba(217,70,239,0.55), 0 12px 24px -8px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(168,85,247,0.35), 0 0 28px -4px rgba(168,85,247,0.55)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.35), 0 0 28px -4px rgba(34,211,238,0.55)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #7c3aed 0%, #d946ef 45%, #ec4899 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(217,70,239,0.12) 50%, rgba(236,72,153,0.10) 100%)",
        "mesh":
          "radial-gradient(at 18% 12%, rgba(124,58,237,0.35) 0px, transparent 45%), radial-gradient(at 82% 18%, rgba(34,211,238,0.22) 0px, transparent 40%), radial-gradient(at 60% 88%, rgba(236,72,153,0.28) 0px, transparent 45%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(24px) scale(0.96)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "emoji-pop": {
          "0%": { transform: "scale(0) rotate(-25deg)", opacity: "0" },
          "55%": { transform: "scale(1.3) rotate(10deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        /* Lightbox photo entrance — slides in from the swipe direction. */
        "img-in": {
          from: { opacity: "0", transform: "translateX(28px) scale(0.98)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "img-in-left": {
          from: { opacity: "0", transform: "translateX(-28px) scale(0.98)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        /* Before/after teaser: the "before" image is wiped away to reveal
           the "after" beneath, then back again. */
        "ba-clip": {
          "0%, 8%, 100%": { clipPath: "inset(0 72% 0 0)" },
          "50%, 58%": { clipPath: "inset(0 18% 0 0)" },
        },
        /* The divider/handle sweeps in lockstep with the clip above. */
        "ba-handle": {
          "0%, 8%, 100%": { left: "28%" },
          "50%, 58%": { left: "82%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "toast-in": "toast-in 0.32s cubic-bezier(0.22,1,0.36,1) both",
        "emoji-pop": "emoji-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "img-in": "img-in 0.32s cubic-bezier(0.22,1,0.36,1) both",
        "img-in-left": "img-in-left 0.32s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "ba-clip": "ba-clip 4s ease-in-out infinite",
        "ba-handle": "ba-handle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
