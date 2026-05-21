"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-[0_8px_24px_-8px_rgba(217,70,239,0.6)] hover:shadow-[0_12px_30px_-8px_rgba(217,70,239,0.75)] hover:-translate-y-0.5",
  ghost: "text-slate-300 hover:bg-white/10 hover:text-white",
  outline:
    "border border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/10 hover:border-white/25",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 hover:text-red-200",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  icon: "h-10 w-10 justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
