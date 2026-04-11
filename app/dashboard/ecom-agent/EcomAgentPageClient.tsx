"use client";

import { useMemo } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import WorkspacePanel from "@/components/workspace/WorkspacePanel";
import { useEcomChatSession } from "@/hooks/useEcomChatSession";
import type { WorkspaceAsset } from "@/components/workspace/types";

export default function EcomAgentPageClient() {
  const {
    chatSidebarProps,
    workspace,
    toastMsg,
    handleSendToChat,
    handleAddToProject,
    handleRemoveAsset,
    mediaStore,
    activeThreadId,
  } = useEcomChatSession({ toolKey: "ecom" });

  // Build imageDataMap: assetId → dataUrl
  const imageDataMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const asset of workspace.assets) {
      if (asset.dataUrl) {
        map[asset.id] = asset.dataUrl;
      }
    }
    return map;
  }, [workspace.assets]);

  // Export canvas as new media item
  function handleExportCanvas(dataUrl: string, sourceAsset: WorkspaceAsset) {
    const newItem = {
      id: `media_${Date.now()}_canvas_export`,
      type: "image" as const,
      dataUrl,
      prompt: `画布导出 - ${sourceAsset.prompt.slice(0, 40)}`,
      createdAt: Date.now(),
    };

    mediaStore.addMedia(activeThreadId, [newItem]);

    // Auto-select the newly exported asset
    workspace.setSelectedAssetId(newItem.id);
  }

  return (
    <div className="relative h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
      <ChatSidebar {...chatSidebarProps} />

      {toastMsg && (
        <div className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg bg-accent/15 border border-accent/20 text-accent text-xs font-bold animate-pulse">
          {toastMsg}
        </div>
      )}

      <div className="hidden lg:flex flex-1 flex-col min-w-0">
        <WorkspacePanel
          brief={workspace.brief}
          jobs={workspace.jobs}
          assets={workspace.assets}
          selectedAsset={workspace.selectedAsset}
          selectedAssetId={workspace.selectedAssetId}
          onSelectAsset={workspace.setSelectedAssetId}
          onRemoveAsset={handleRemoveAsset}
          actions={{
            onSendToChat: handleSendToChat,
            onAddToProject: handleAddToProject,
          }}
          threadId={activeThreadId}
          imageDataMap={imageDataMap}
          onExportCanvas={handleExportCanvas}
        />
      </div>
    </div>
  );
}
