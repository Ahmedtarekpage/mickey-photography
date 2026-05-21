"use client";

import { useEffect, useState } from "react";
import { getBlob, isIdbRef } from "./mediaStore";

/**
 * Resolves a media reference to a usable src. Plain URLs pass through; `idb:`
 * references are loaded from IndexedDB and turned into a temporary object URL
 * (revoked automatically when the value changes or the component unmounts).
 */
export function useMediaSrc(value: string | undefined): string {
  const [resolved, setResolved] = useState(isIdbRef(value) ? "" : value ?? "");

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    if (isIdbRef(value)) {
      setResolved("");
      getBlob(value).then((blob) => {
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setResolved(objectUrl);
      });
    } else {
      setResolved(value ?? "");
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  return resolved;
}
