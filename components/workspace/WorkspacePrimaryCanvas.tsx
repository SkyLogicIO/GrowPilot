"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  X,
  Play,
  Loader2,
  MessageSquare,
  FolderPlus,
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import type { WorkspaceAsset, CurrentBrief } from "./types";
import { useWorkspaceCanvasDocument } from "./canvas/useWorkspaceCanvasDocument";
import WorkspaceEmptyState from "./WorkspaceEmptyState";

// Dynamic import Konva to avoid SSR issues
const KonvaWorkspaceCanvas = dynamic(
  () => import("./canvas/KonvaWorkspaceCanvas").then((m) => m.default),
  { ssr: false, loading: () => <LoadingSkeleton /> },
);

// ─── 动作按钮类型 ─────────────────────────────────────────────────

interface CanvasActions {
  onSendToChat: (asset: WorkspaceAsset) => void;
  onAddToProject: (asset: WorkspaceAsset, brief: CurrentBrief) => void;
}

// ─── 骨架屏加载态 ─────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-full max-w-[360px] aspect-[4/3] rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
      <div className="flex items-center gap-2">
        <Loader2 size={13} className="text-accent animate-spin" />
        <p className="text-[12px] text-text-muted font-medium">加载画布中...</p>
      </div>
    </div>
  );
}

// ─── 图片灯箱 ─────────────────────────────────────────────────────

function ImageLightbox({
  url,
  onClose,
  onDownload,
}: {
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90%] max-h-[90%] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt="预览"
          className="max-h-[70vh] max-w-full object-contain rounded-xl"
        />
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onDownload}
            className="h-9 px-4 rounded-lg bg-white/[0.08] border border-white/[0.1] text-text-secondary text-xs font-bold flex items-center gap-2 hover:bg-white/[0.12] transition-colors"
          >
            <Download size={14} />
            下载
          </button>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-white/[0.08] border border-white/[0.1] text-text-secondary text-xs font-bold flex items-center gap-2 hover:bg-white/[0.12] transition-colors"
          >
            <X size={14} />
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 视频播放器遮罩 ───────────────────────────────────────────────

function VideoPlayerOverlay({
  url,
  onClose,
  onDownload,
}: {
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-[800px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={url}
          controls
          autoPlay
          className="w-full rounded-xl"
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onDownload}
            className="h-9 px-4 rounded-lg bg-white/[0.08] border border-white/[0.1] text-text-secondary text-xs font-bold flex items-center gap-2 hover:bg-white/[0.12] transition-colors"
          >
            <Download size={14} />
            下载
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black/50 border border-white/[0.1] flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X size={14} className="text-white/80" />
        </button>
      </div>
    </div>
  );
}

// ─── 主动作按钮 ───────────────────────────────────────────────────

function ActionButtons({
  asset,
  brief,
  actions,
}: {
  asset: WorkspaceAsset;
  brief: CurrentBrief;
  actions: CanvasActions;
}) {
  const buttons = [
    {
      icon: <MessageSquare size={13} />,
      label: "发送回对话",
      onClick: () => actions.onSendToChat(asset),
    },
    {
      icon: <FolderPlus size={13} />,
      label: "加入项目",
      onClick: () => actions.onAddToProject(asset, brief),
    },
  ];

  return (
    <div className="flex items-center gap-2 mt-3">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.onClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold text-text-secondary hover:bg-white/[0.08] hover:text-text-primary transition-colors"
        >
          {btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ─── Prompt 文本（可展开/收起） ─────────────────────────────────

function PromptText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div className="mt-3 max-w-[400px] w-full px-4">
      <p
        ref={textRef}
        className={`text-[11px] text-text-muted text-center leading-relaxed transition-all ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {text}
      </p>
      {isOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="block mx-auto mt-1 text-[10px] text-accent/70 hover:text-accent transition-colors"
        >
          {expanded ? "收起" : "展开"}
        </button>
      )}
    </div>
  );
}

// ─── 加载态（保留原版） ──────────────────────────────────────────

function AssetLoadingSkeleton({
  type,
  prompt,
  statusText,
}: {
  type?: "image" | "video";
  prompt?: string;
  statusText?: string;
}) {
  const isVideo = type === "video";
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div
        className={`relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse ${
          isVideo
            ? "w-full max-w-[480px] aspect-video"
            : "w-full max-w-[360px] aspect-square"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center">
              <Play size={22} className="text-accent/50 fill-current" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center">
              <ImageIcon size={22} className="text-accent/50" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          <Loader2 size={13} className="text-accent animate-spin" />
          <p className="text-[12px] text-text-muted font-medium">
            {statusText || (isVideo ? "视频生成中..." : "图片生成中...")}
          </p>
        </div>
        {prompt && (
          <p className="text-[11px] text-white/20 text-center px-4 line-clamp-2 max-w-[300px]">
            {prompt}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── 画板动作栏 ───────────────────────────────────────────────────

function CanvasToolbar({
  onReset,
  onExport,
  doc,
}: {
  onReset: () => void;
  onExport: () => void;
  doc: { width: number; height: number };
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06]">
      <span className="text-[10px] text-text-muted/60">
        {doc.width} x {doc.height}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold text-text-secondary hover:bg-white/[0.08] hover:text-text-primary transition-colors"
        >
          <RotateCcw size={12} />
          重置
        </button>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/20 text-[11px] font-bold text-accent hover:bg-accent/25 transition-colors"
        >
          <Download size={12} />
          导出新素材
        </button>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────

interface WorkspacePrimaryCanvasProps {
  asset: WorkspaceAsset | null;
  brief: CurrentBrief;
  actions: CanvasActions;
  threadId: string;
  imageDataMap: Record<string, string>;
  onExport: (dataUrl: string, sourceAsset: WorkspaceAsset) => void;
}

export default function WorkspacePrimaryCanvas({
  asset,
  brief,
  actions,
  threadId,
  imageDataMap,
  onExport,
}: WorkspacePrimaryCanvasProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Canvas document hook for image assets
  const canvas = useWorkspaceCanvasDocument({
    threadId,
    assetId: asset?.type === "image" && asset?.status === "ready" ? asset.id : null,
    assetDataUrl:
      asset?.type === "image" && asset?.status === "ready" ? asset.dataUrl : null,
  });

  function handleCanvasExport() {
    const stage = canvas.stageRef.current;
    if (!stage || !asset || !canvas.document) return;
    const doc = canvas.document;

    // 暂存当前视口状态
    const origW = stage.width();
    const origH = stage.height();
    const origSX = stage.scaleX();
    const origSY = stage.scaleY();

    // 临时切到文档原始尺寸导出（1:1，无缩放留白）
    stage.width(doc.width);
    stage.height(doc.height);
    stage.scaleX(1);
    stage.scaleY(1);
    stage.batchDraw();

    const dataUrl = stage.toDataURL({ pixelRatio: 2 });

    // 还原视口
    stage.width(origW);
    stage.height(origH);
    stage.scaleX(origSX);
    stage.scaleY(origSY);
    stage.batchDraw();

    onExport(dataUrl, asset);
  }

  // 空态
  if (!asset) return <WorkspaceEmptyState />;

  // 加载态
  if (asset.status === "loading")
    return (
      <AssetLoadingSkeleton
        type={asset.type}
        prompt={asset.prompt}
        statusText={asset.statusText}
      />
    );

  // 失败态
  if (asset.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ImageIcon size={20} className="text-red-400" />
        </div>
        <p className="text-[12px] text-red-400/80">素材生成失败</p>
        <p className="text-[11px] text-text-muted truncate max-w-[200px]">
          {asset.prompt}
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = asset.dataUrl;
    a.download = `growpilot_${asset.type}_${Date.now()}.${asset.type === "video" ? "mp4" : "png"}`;
    a.click();
  };

  // Video → existing preview
  if (asset.type === "video") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 max-h-full">
          <div
            className="relative w-full max-w-[480px] aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer group"
            onClick={() => setVideoUrl(asset.dataUrl)}
          >
            <video
              src={asset.dataUrl}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-accent/80 flex items-center justify-center">
                <Play size={20} className="text-slate-900 ml-0.5 fill-current" />
              </div>
            </div>
          </div>
          <PromptText text={asset.prompt} />
          <ActionButtons asset={asset} brief={brief} actions={actions} />
        </div>
        {videoUrl && (
          <VideoPlayerOverlay
            url={videoUrl}
            onClose={() => setVideoUrl(null)}
            onDownload={handleDownload}
          />
        )}
      </div>
    );
  }

  // Image ready → Konva canvas
  if (asset.type === "image" && asset.status === "ready" && canvas.document) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Konva canvas area */}
        <div className="flex-1 min-h-0">
          <KonvaWorkspaceCanvas
            document={canvas.document}
            imageDataMap={imageDataMap}
            onUpdateNode={canvas.updateNode}
            onSelectNode={canvas.selectNode}
            stageRef={canvas.stageRef}
          />
        </div>

        {/* Prompt text */}
        <PromptText text={asset.prompt} />

        {/* Canvas toolbar */}
        <CanvasToolbar
          onReset={canvas.resetDocument}
          onExport={handleCanvasExport}
          doc={canvas.document}
        />

        {/* Action buttons */}
        <div className="px-4 pb-2">
          <ActionButtons asset={asset} brief={brief} actions={actions} />
        </div>

        {/* Lightbox fallback */}
        {lightboxUrl && (
          <ImageLightbox
            url={lightboxUrl}
            onClose={() => setLightboxUrl(null)}
            onDownload={handleDownload}
          />
        )}
      </div>
    );
  }

  // Image ready but canvas not yet loaded — show simple preview
  if (asset.type === "image" && asset.status === "ready") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 max-h-full">
          <div
            className="relative w-full max-w-[360px] cursor-pointer group"
            onClick={() => setLightboxUrl(asset.dataUrl)}
          >
            <img
              src={asset.dataUrl}
              alt={asset.prompt}
              className="w-full rounded-xl"
            />
          </div>
          <PromptText text={asset.prompt} />
          <ActionButtons asset={asset} brief={brief} actions={actions} />
        </div>
        {lightboxUrl && (
          <ImageLightbox
            url={lightboxUrl}
            onClose={() => setLightboxUrl(null)}
            onDownload={handleDownload}
          />
        )}
      </div>
    );
  }

  return null;
}
