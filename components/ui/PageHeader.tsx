import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
}: {
  crumbs?: Crumb[];
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 animate-fade-in">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-400">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link
                  href={c.href}
                  className="rounded-md px-1 transition hover:text-white"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="px-1 text-slate-200">{c.label}</span>
              )}
              {i < crumbs.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
