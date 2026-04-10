"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { MediaItem } from "@/lib/ai";
import type { EcomChatMessage } from "@/lib/storage/ecom-chat";
import type {
  CurrentBrief,
  WorkspaceJob,
  WorkspaceAsset,
  SelectedAssetId,
} from "./types";

function deriveJobStatus(item: MediaItem): WorkspaceJob["status"] {
  if (item.type === "video" && !item.dataUrl) {
    if (item.status?.startsWith("失败")) return "failed";
    return "generating";
  }
  if (item.dataUrl) return "completed";
  return "pending";
}

function deriveAssetStatus(item: MediaItem): WorkspaceAsset["status"] {
  if (item.type === "video" && !item.dataUrl) {
    return item.status?.startsWith("失败") ? "failed" : "loading";
  }
  if (item.dataUrl) return "ready";
  return "loading";
}

function findSourceMessageId(
  mediaId: string,
  messages: EcomChatMessage[],
): string {
  for (const msg of messages) {
    if (msg.mediaRefs?.includes(mediaId)) return msg.id;
  }
  return "";
}

function isUploadedItem(item: MediaItem): boolean {
  return !!item.status && item.status === "已上传";
}

export function useWorkspaceState(params: {
  activeThreadId: string;
  threadTitle: string;
  chatMode: string;
  filterPlatform: string;
  filterIntent: string;
  filterLang: string;
  mediaItems: MediaItem[];
  messages: EcomChatMessage[];
}) {
  const { activeThreadId, threadTitle, chatMode, filterPlatform, filterIntent, filterLang, mediaItems, messages } = params;

  const [selectedAssetId, setSelectedAssetId] = useState<SelectedAssetId>(null);
  const prevThreadIdRef = useRef(activeThreadId);

  // ── 切换线程时重置选中态 ──
  useEffect(() => {
    if (prevThreadIdRef.current !== activeThreadId) {
      prevThreadIdRef.current = activeThreadId;
      setSelectedAssetId(null);
    }
  }, [activeThreadId]);

  // ── CurrentBrief ──
  const brief: CurrentBrief = useMemo(
    () => ({
      threadId: activeThreadId,
      threadTitle,
      mode: chatMode,
      platform: filterPlatform,
      intent: filterIntent,
      language: filterLang,
      assetCount: mediaItems.length,
    }),
    [activeThreadId, threadTitle, chatMode, filterPlatform, filterIntent, filterLang, mediaItems.length],
  );

  // ── WorkspaceAsset[] ──
  const assets: WorkspaceAsset[] = useMemo(
    () =>
      mediaItems.map((item) => ({
        id: item.id,
        type: item.type,
        status: deriveAssetStatus(item),
        dataUrl: item.dataUrl,
        prompt: item.prompt,
        sourceMessageId: findSourceMessageId(item.id, messages),
        createdAt: item.createdAt,
        isUploaded: isUploadedItem(item),
        statusText: item.status || undefined,
      })),
    [mediaItems, messages],
  );

  // ── WorkspaceJob[] ──
  const jobs: WorkspaceJob[] = useMemo(
    () =>
      mediaItems
        .map((item) => ({
          id: item.id,
          type: item.type,
          status: deriveJobStatus(item),
          label: item.prompt.length > 30 ? item.prompt.slice(0, 30) + "..." : item.prompt,
          sourceMessageId: findSourceMessageId(item.id, messages),
          linkedAssetId: item.dataUrl ? item.id : undefined,
          createdAt: item.createdAt,
          errorMessage: item.status?.startsWith("失败") ? item.status : undefined,
        }))
        .filter((j) => j.type === "video" || j.status !== "completed"),
    [mediaItems, messages],
  );

  // ── 选中态自动回退 ──
  // 优先 ready → 其次 loading（生成中展示骨架屏）→ 无则 null
  const selectedAsset = useMemo(() => {
    if (selectedAssetId) {
      const found = assets.find((a) => a.id === selectedAssetId);
      if (found) return found;
    }
    return [...assets].reverse().find((a) => a.status === "ready")
      ?? [...assets].reverse().find((a) => a.status === "loading")
      ?? null;
  }, [selectedAssetId, assets]);

  // ── assets 变化时自动选中 ──
  // 1. 新出现 loading 资产且当前选中的不是 loading → 自动切换到最新 loading
  // 2. 没有选中态时 → 优先 ready，其次 loading
  useEffect(() => {
    const latestLoading = [...assets].reverse().find((a) => a.status === "loading");
    const currentSelected = selectedAssetId
      ? assets.find((a) => a.id === selectedAssetId)
      : null;

    if (latestLoading) {
      // 当前无选中，或选中的不是 loading → 切换到最新 loading（展示生成进度）
      if (!selectedAssetId || !currentSelected || currentSelected.status !== "loading") {
        setSelectedAssetId(latestLoading.id);
      }
    } else if (!selectedAssetId && assets.length > 0) {
      // 无 loading 且无选中 → 优先 ready
      const latest = [...assets].reverse().find((a) => a.status === "ready");
      if (latest) setSelectedAssetId(latest.id);
    }
  }, [assets, selectedAssetId]);

  // ── 视频/资产从 loading → ready 时，如果它是当前选中或没有选中，自动选中 ──
  useEffect(() => {
    const latestReady = [...assets].reverse().find((a) => a.status === "ready");
    // 如果没有选中态，或选中的还是 loading 状态，切换到最新 ready
    if (latestReady) {
      const currentSelected = selectedAssetId
        ? assets.find((a) => a.id === selectedAssetId)
        : null;
      if (!selectedAssetId || (currentSelected && currentSelected.status !== "ready")) {
        setSelectedAssetId(latestReady.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  // ── 删除资产后的回退 ──
  const handleAssetRemoved = useCallback(
    (removedId: string) => {
      setSelectedAssetId((prev) => {
        if (prev !== removedId) return prev;
        const remaining = assets.filter((a) => a.id !== removedId);
        if (remaining.length === 0) return null;
        const idx = assets.findIndex((a) => a.id === removedId);
        const fallbackIdx = idx > 0 ? idx - 1 : 0;
        return remaining[Math.min(fallbackIdx, remaining.length - 1)].id;
      });
    },
    [assets],
  );

  const resetSelection = useCallback(() => {
    setSelectedAssetId(null);
  }, []);

  return {
    brief,
    jobs,
    assets,
    selectedAsset,
    selectedAssetId,
    setSelectedAssetId,
    handleAssetRemoved,
    resetSelection,
  };
}
