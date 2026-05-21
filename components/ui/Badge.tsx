import { cn } from "@/lib/cn";

type Tone = "violet" | "cyan" | "lime" | "amber" | "pink" | "slate";

const tones: Record<Tone, string> = {
  violet: "bg-brand-violet/15 text-violet-300 border-violet-400/20",
  cyan: "bg-brand-cyan/15 text-cyan-300 border-cyan-400/20",
  lime: "bg-brand-lime/15 text-lime-300 border-lime-400/20",
  amber: "bg-brand-amber/15 text-amber-300 border-amber-400/20",
  pink: "bg-brand-pink/15 text-pink-300 border-pink-400/20",
  slate: "bg-white/5 text-slate-300 border-white/10",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
