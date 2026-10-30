import { afterEach, describe, expect, it, vi } from "vitest";
import { createSavedStore, knownSavedIds, parseSavedIds, STORAGE_KEY, type StorageLike } from "@/lib/saved-store";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("saved destinations store", () => {
  it("starts empty and persists saves across a simulated refresh", () => {
    const storage = memoryStorage();
    const store = createSavedStore(storage);
    expect(store.getSnapshot()).toEqual([]);

    store.add("dst-bozzhyra");
    store.add("dst-kaindy-lake");
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual(["dst-bozzhyra", "dst-kaindy-lake"]);

    const afterRefresh = createSavedStore(storage);
    expect(afterRefresh.getSnapshot()).toEqual(["dst-bozzhyra", "dst-kaindy-lake"]);
    expect(afterRefresh.isPersistent()).toBe(true);
  });

  it("toggles, removes and ignores duplicates", () => {
    const store = createSavedStore(memoryStorage());
    store.toggle("dst-charyn-canyon");
    store.add("dst-charyn-canyon");
    expect(store.getSnapshot()).toEqual(["dst-charyn-canyon"]);
    store.toggle("dst-charyn-canyon");
    expect(store.getSnapshot()).toEqual([]);
    store.add("a");
    store.add("b");
    store.remove("a");
    expect(store.getSnapshot()).toEqual(["b"]);
  });

  it("keeps the same snapshot reference until something changes", () => {
    const store = createSavedStore(memoryStorage());
    const first = store.getSnapshot();
    store.remove("not-saved");
    expect(store.getSnapshot()).toBe(first);
    store.add("x");
    expect(store.getSnapshot()).not.toBe(first);
  });

  it("notifies subscribers and stops after unsubscribe", () => {
    const store = createSavedStore(memoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.add("x");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.add("y");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("recovers from malformed stored data", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(createSavedStore(memoryStorage({ [STORAGE_KEY]: "{not json" })).getSnapshot()).toEqual([]);
    expect(createSavedStore(memoryStorage({ [STORAGE_KEY]: '{"a":1}' })).getSnapshot()).toEqual([]);
    expect(parseSavedIds('["a", 3, null, "", "a", "b"]')).toEqual(["a", "b"]);
  });

  it("keeps working in memory when storage cannot be read", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const blocked: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
    };
    const store = createSavedStore(blocked);
    expect(store.isPersistent()).toBe(false);
    store.add("x");
    expect(store.getSnapshot()).toEqual(["x"]);
  });

  it("reports when writes start failing (e.g. quota exceeded)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    const store = createSavedStore(storage);
    store.add("x");
    expect(store.getSnapshot()).toEqual(["x"]);
    expect(store.isPersistent()).toBe(false);
  });

  it("works without any storage (server or locked-down browser)", () => {
    const store = createSavedStore(null);
    expect(store.isPersistent()).toBe(false);
    store.add("x");
    expect(store.getSnapshot()).toEqual(["x"]);
  });

  it("reloads changes written by another tab", () => {
    const storage = memoryStorage();
    const store = createSavedStore(storage);
    storage.data[STORAGE_KEY] = JSON.stringify(["from-other-tab"]);
    store.reload();
    expect(store.getSnapshot()).toEqual(["from-other-tab"]);
  });
});

describe("malformed data cleanup", () => {
  it("rewrites invalid stored data once so it is not re-reported", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const storage = memoryStorage({ [STORAGE_KEY]: '["a","a",5]' });
    createSavedStore(storage);
    expect(storage.data[STORAGE_KEY]).toBe('["a"]');
  });
});

describe("compatibility with saves from older versions", () => {
  it("counts only ids that still belong to a destination, keeping their order", () => {
    const stored = ["dst-kaindy-lake", "dst-retired-place", "dst-markakol-lake"];
    expect(knownSavedIds(stored, ["dst-markakol-lake", "dst-kaindy-lake", "dst-bozzhyra"])).toEqual(["dst-kaindy-lake", "dst-markakol-lake"]);
  });

  it("loads a seven-destination era list unchanged", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(["dst-bozzhyra", "dst-big-almaty-lake"]) });
    expect(createSavedStore(storage).getSnapshot()).toEqual(["dst-bozzhyra", "dst-big-almaty-lake"]);
  });
});
