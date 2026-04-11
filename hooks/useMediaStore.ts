import { useState, useCallback } from "react";
import type { MediaItem } from "@/lib/ai";

const MAX_ITEMS_PER_THREAD = 20;
const STORAGE_KEY = "growpilot_ecom_media_v1";

// ─── localStorage 持久化 ───────────────────────────────────────────

function readStorage(): Map<string, MediaItem[]> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed: Record<string, MediaItem[]> = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function writeStorage(store: Map<string, MediaItem[]>) {
  if (typeof window === "undefined") return;
  try {
    const obj: Record<string, MediaItem[]> = {};
    store.forEach((items, key) => {
      obj[key] = items;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn("[mediaStore] localStorage write failed:", err);
  }
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useMediaStore() {
  const [store, setStore] = useState<Map<string, MediaItem[]>>(readStorage);

  const getMedia = useCallback(
    (threadId: string) => store.get(threadId) ?? [],
    [store],
  );

  const addMedia = useCallback((threadId: string, items: MediaItem[]) => {
    setStore((prev) => {
      const next = new Map(prev);
      const existing = next.get(threadId) ?? [];
      const updated = [...existing, ...items].slice(-MAX_ITEMS_PER_THREAD);
      next.set(threadId, updated);
      writeStorage(next);
      return next;
    });
  }, []);

  const addVideo = useCallback((threadId: string, item: MediaItem) => {
    setStore((prev) => {
      const next = new Map(prev);
      const existing = next.get(threadId) ?? [];
      next.set(threadId, [...existing, item].slice(-MAX_ITEMS_PER_THREAD));
      writeStorage(next);
      return next;
    });
  }, []);

  const updateVideo = useCallback(
    (threadId: string, mediaId: string, update: Partial<MediaItem>) => {
      setStore((prev) => {
        const next = new Map(prev);
        const existing = next.get(threadId) ?? [];
        next.set(
          threadId,
          existing.map((item) =>
            item.id === mediaId ? { ...item, ...update } : item,
          ),
        );
        writeStorage(next);
        return next;
      });
    },
    [],
  );

  const removeMedia = useCallback((threadId: string, mediaId: string) => {
    setStore((prev) => {
      const next = new Map(prev);
      const existing = next.get(threadId) ?? [];
      next.set(threadId, existing.filter((item) => item.id !== mediaId));
      writeStorage(next);
      return next;
    });
  }, []);

  const clearThread = useCallback((threadId: string) => {
    setStore((prev) => {
      const next = new Map(prev);
      next.delete(threadId);
      writeStorage(next);
      return next;
    });
  }, []);

  return { getMedia, addMedia, addVideo, updateVideo, removeMedia, clearThread };
}
