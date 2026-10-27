"use client";

import { useSyncExternalStore } from "react";
import { createSavedStore, SERVER_SNAPSHOT, STORAGE_KEY, type SavedDestinationsStore } from "@/lib/saved-store";

let browserStore: SavedDestinationsStore | null = null;

function getStore(): SavedDestinationsStore {
  if (browserStore) return browserStore;
  let storage: Storage | null = null;
  try {
    // Accessing localStorage can throw when the browser blocks site data.
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  const store = createSavedStore(storage);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) store.reload();
  });
  browserStore = store;
  return store;
}

const subscribe = (listener: () => void) => getStore().subscribe(listener);
const getSnapshot = () => getStore().getSnapshot();
const getServerSnapshot = () => SERVER_SNAPSHOT;

const noopSubscribe = () => () => {};

/** False during server rendering and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Saved destination ids for this browser. The server snapshot is always empty,
 * so the first client render matches the HTML and there is no hydration error;
 * real values appear immediately after hydration.
 */
export function useSavedDestinations() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useHydrated();
  return {
    ids,
    hydrated,
    persistent: hydrated ? getStore().isPersistent() : true,
    isSaved: (id: string) => ids.includes(id),
    toggle: (id: string) => getStore().toggle(id),
    remove: (id: string) => getStore().remove(id),
  };
}
