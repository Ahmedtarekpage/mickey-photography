"use client";

/**
 * Route-level backstop. If something throws while rendering on the client
 * (e.g. an API quirk on an older browser), show a recover screen instead of a
 * blank page, with a button to try again.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="max-w-md text-sm text-slate-400">
        The page hit an unexpected error. Reloading usually fixes it.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-2xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
