/**
 * Tiny IndexedDB-backed blob store for uploaded videos.
 *
 * Videos are far too large for localStorage, so the file is stored here and the
 * media item only keeps a lightweight reference like `idb:abc123`. Use
 * `useMediaSrc` to turn that reference back into a playable object URL.
 */

const DB_NAME = "lumen-media";
const STORE = "blobs";
const PREFIX = "idb:";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isIdbRef(value: string | undefined): value is string {
  return !!value && value.startsWith(PREFIX);
}

/** Store a blob and return its `idb:` reference. */
export async function putBlob(blob: Blob): Promise<string> {
  const ref = `${PREFIX}${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, ref);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  return ref;
}

export async function getBlob(ref: string): Promise<Blob | null> {
  if (!isIdbRef(ref)) return null;
  const db = await openDb();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(ref);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteBlob(ref: string | undefined): Promise<void> {
  if (!isIdbRef(ref)) return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(ref);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}
