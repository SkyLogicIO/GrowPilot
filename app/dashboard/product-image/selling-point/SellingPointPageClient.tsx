"use client";

import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import WorkspacePanel from "@/components/workspace/WorkspacePanel";
import { useEcomChatSession } from "@/hooks/useEcomChatSession";
import type { WorkspaceAsset } from "@/components/workspace/types";
import SellingPointGallery from "./SellingPointGallery";
import type { SellingPointTemplate } from "./SellingPointGallery";

// ─── 模板预览卡片（输入框上方） ───────────────────────────────────────

function TemplatePreviewCard({
  template,
  onChange,
}: {
  template: SellingPointTemplate;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2">
      <img
        src={template.imageUrl}
        alt={template.title}
        className="w-9 h-9 rounded-md object-cover shrink-0 border border-white/[0.08]"
      />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-text-primary truncate">{template.title}</div>
        <div className="text-[10px] text-text-muted truncate">{template.subtitle}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-[11px] font-bold text-accent hover:text-accent/80 transition-colors"
      >
        切换模板
      </button>
    </div>
  );
}

// ─── 折叠模板卡片（工作区右下角悬浮） ────────────────────────────────

function FloatingTemplateCard({
  template,
  onChange,
}: {
  template: SellingPointTemplate;
  onChange: () => void;
}) {
  return (
    <div className="absolute bottom-4 right-4 z-40">
      <button
        type="button"
        onClick={onChange}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/[0.1] backdrop-blur-sm shadow-xl shadow-black/30 hover:bg-slate-800/90 transition-colors group"
      >
        <img
          src={template.imageUrl}
          alt={template.title}
          className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/[0.08]"
        />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[11px] font-bold text-text-primary truncate">{template.title}</div>
        </div>
        <span className="text-[11px] font-bold text-accent flex items-center gap-1">
          切换模板
          <ArrowRight size={11} />
        </span>
      </button>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────

export default function SellingPointPageClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<SellingPointTemplate | null>(null);

  const {
    chatSidebarProps,
    workspace,
    toastMsg,
    handleSendToChat,
    handleAddToProject,
    handleRemoveAsset,
    mediaStore,
    activeThreadId,
  } = useEcomChatSession({ toolKey: "selling-point" });

  // Build imageDataMap for canvas
  const imageDataMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const asset of workspace.assets) {
      if (asset.dataUrl) {
        map[asset.id] = asset.dataUrl;
      }
    }
    return map;
  }, [workspace.assets]);

  // Canvas export handler
  function handleExportCanvas(dataUrl: string, sourceAsset: WorkspaceAsset) {
    const newItem = {
      id: `media_${Date.now()}_canvas_export`,
      type: "image" as const,
      dataUrl,
      prompt: `画布导出 - ${sourceAsset.prompt.slice(0, 40)}`,
      createdAt: Date.now(),
    };
    mediaStore.addMedia(activeThreadId, [newItem]);
    workspace.setSelectedAssetId(newItem.id);
  }

  // 模板预览卡片插槽
  const inputAreaTopSlot = selectedTemplate ? (
    <TemplatePreviewCard
      template={selectedTemplate}
      onChange={() => setSelectedTemplate(null)}
    />
  ) : undefined;

  return (
    <div className="relative h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
      {/* 左侧对话面板 */}
      <ChatSidebar {...chatSidebarProps} inputAreaTopSlot={inputAreaTopSlot} />

      {toastMsg && (
        <div className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg bg-accent/15 border border-accent/20 text-accent text-xs font-bold animate-pulse">
          {toastMsg}
        </div>
      )}

      {/* 右侧区域 */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0 relative">
        {selectedTemplate ? (
          <>
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
            <FloatingTemplateCard
              template={selectedTemplate}
              onChange={() => setSelectedTemplate(null)}
            />
          </>
        ) : (
          <SellingPointGallery onSelect={setSelectedTemplate} />
        )}
      </div>
    </div>
  );
}
