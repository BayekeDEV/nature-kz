/**
 * Saved destinations, stored in this browser only.
 *
 * Components talk to the `SavedDestinationsStore` interface, never to
 * localStorage directly. A future account system can provide another
 * implementation (e.g. one that calls a PostgreSQL-backed API) with the same
 * methods, and the UI will not need to change.
 */

export const STORAGE_KEY = "nature-kz:saved-destinations:v1";

export interface SavedDestinationsStore {
  /** Current saved ids. Returns the same array instance until something changes. */
  getSnapshot(): readonly string[];
  /** False when the browser blocks storage; saves then last for this page session only. */
  isPersistent(): boolean;
  subscribe(listener: () => void): () => void;
  add(id: string): void;
  remove(id: string): void;
  toggle(id: string): void;
  clear(): void;
  /** Re-reads the underlying source, e.g. after another browser tab changed it. */
  reload(): void;
}

/** The subset of the Web Storage API we rely on — easy to fake in tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const EMPTY: readonly string[] = Object.freeze([]);

/** Accepts only a JSON array of non-empty strings; drops anything else. */
export function parseSavedIds(raw: string | null): string[] {
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    warn("Saved destinations data was not valid JSON and has been reset.");
    return [];
  }
  if (!Array.isArray(parsed)) {
    warn("Saved destinations data had an unexpected shape and has been reset.");
    return [];
  }
  const ids = parsed.filter((value): value is string => typeof value === "string" && value.length > 0 && value.length < 100);
  return Array.from(new Set(ids));
}

function warn(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== "production") console.warn(`[saved-destinations] ${message}`, error ?? "");
}

export function createSavedStore(storage: StorageLike | null): SavedDestinationsStore {
  let persistent = storage !== null;
  let ids: readonly string[] = EMPTY;
  const listeners = new Set<() => void>();

  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const loaded = parseSavedIds(raw);
      ids = loaded.length ? Object.freeze(loaded) : EMPTY;
      // Replace invalid or duplicated data so the problem is reported only once.
      if (raw !== null && raw !== JSON.stringify(loaded)) storage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    } catch (error) {
      persistent = false;
      warn("Browser storage is unavailable; saves will not survive a reload.", error);
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function commit(next: string[]) {
    ids = next.length ? Object.freeze(next) : EMPTY;
    if (storage && persistent) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        persistent = false;
        warn("Could not write to browser storage; saves will not survive a reload.", error);
      }
    }
    emit();
  }

  function add(id: string) {
    if (!ids.includes(id)) commit([...ids, id]);
  }

  function remove(id: string) {
    if (ids.includes(id)) commit(ids.filter((saved) => saved !== id));
  }

  return {
    getSnapshot: () => ids,
    isPersistent: () => persistent,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add,
    remove,
    toggle(id) {
      if (ids.includes(id)) remove(id);
      else add(id);
    },
    clear() {
      if (ids.length) commit([]);
    },
    reload() {
      if (!storage || !persistent) return;
      try {
        const next = parseSavedIds(storage.getItem(STORAGE_KEY));
        if (next.length === ids.length && next.every((id, i) => id === ids[i])) return;
        ids = next.length ? Object.freeze(next) : EMPTY;
        emit();
      } catch (error) {
        warn("Could not re-read browser storage.", error);
      }
    },
  };
}

export const SERVER_SNAPSHOT = EMPTY;
