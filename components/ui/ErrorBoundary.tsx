"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches render/runtime errors in its subtree and shows `fallback` instead of
 * letting the error unmount the whole React tree (which would blank the page).
 * Used to isolate risky client-only widgets (e.g. the WebGL globe) so a failure
 * on older/low-memory browsers degrades gracefully.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* swallow — the fallback is the user-facing result */
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
