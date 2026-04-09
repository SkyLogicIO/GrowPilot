"use client";

import { useState, useCallback } from "react";
import {
  Download,
  X,
  Play,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import type { MediaItem } from "@/lib/ai";

interface MediaGalleryProps {
  items: MediaItem[];
  onRemove?: (mediaId: string) => void;
}

// ─── 空态 ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full select-none">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        <ImageIcon size={28} className="text-white/10" />
      </div>
      <p className="text-text-muted text-sm">对话中生成的素材将在此展示</p>
      <p className="text-white/20 text-xs mt-1">支持图片与视频</p>
    </div>
  );
}

// ─── 图片灯箱 ───────────────────────────────────────────────────────

function ImageLightbox({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
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
          <a
            href={url}
            download={`growpilot_${Date.now()}.png`}
            className="h-9 px-4 rounded-lg bg-white/[0.08] border border-white/[0.1] text-text-secondary text-xs font-bold flex items-center gap-2 hover:bg-white/[0.12] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={14} />
            下载
          </a>
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

// ─── 视频播放器 ───────────────────────────────────────────────────────

function VideoPlayerOverlay({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
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

// ─── 媒体卡片 ───────────────────────────────────────────────────────

function MediaCard({
  item,
  onClick,
  onRemove,
}: {
  item: MediaItem;
  onClick: () => void;
  onRemove?: () => void;
}) {
  if (item.type === "video" && !item.dataUrl) {
    // 视频加载中
    return (
      <div className="aspect-video rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="text-accent animate-spin" />
        <span className="text-[11px] text-text-muted text-center px-2">
          {item.status || "视频生成中..."}
        </span>
      </div>
    );
  }

  if (item.type === "video" && item.dataUrl) {
    // 视频完成
    return (
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer group"
        onClick={onClick}
      >
        <video
          src={item.dataUrl}
          className="w-full h-full object-cover"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-accent/80 flex items-center justify-center">
            <Play size={20} className="text-slate-900 ml-0.5" />
          </div>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60"
          >
            <X size={12} className="text-white/70" />
          </button>
        )}
      </div>
    );
  }

  // 图片
  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={item.dataUrl}
        alt="生成的图片"
        className="w-full aspect-square object-cover"
      />
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60"
        >
          <X size={12} className="text-white/70" />
        </button>
      )}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────

export default function MediaGallery({ items, onRemove }: MediaGalleryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleRemove = useCallback(
    (mediaId: string) => onRemove?.(mediaId),
    [onRemove],
  );

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-accent" />
          <span className="text-sm font-bold text-text-secondary">
            工作区素材
          </span>
          <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={() => {
                if (item.type === "image" && item.dataUrl) setLightboxUrl(item.dataUrl);
                else if (item.type === "video" && item.dataUrl) setVideoUrl(item.dataUrl);
              }}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
      {videoUrl && (
        <VideoPlayerOverlay url={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </div>
  );
}
