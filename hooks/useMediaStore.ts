import { useState, useCallback } from "react";
import type { MediaItem } from "@/lib/ai";

const MAX_ITEMS_PER_THREAD = 20;

export function useMediaStore() {
  const [store, setStore] = useState<Map<string, MediaItem[]>>(new Map());

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
      return next;
    });
  }, []);

  const addVideo = useCallback((threadId: string, item: MediaItem) => {
    setStore((prev) => {
      const next = new Map(prev);
      const existing = next.get(threadId) ?? [];
      next.set(threadId, [...existing, item].slice(-MAX_ITEMS_PER_THREAD));
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
      return next;
    });
  }, []);

  const clearThread = useCallback((threadId: string) => {
    setStore((prev) => {
      const next = new Map(prev);
      next.delete(threadId);
      return next;
    });
  }, []);

  return { getMedia, addMedia, addVideo, updateVideo, removeMedia, clearThread };
}
