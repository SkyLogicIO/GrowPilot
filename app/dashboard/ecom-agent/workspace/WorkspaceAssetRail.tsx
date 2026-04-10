"use client";

import { ImageIcon, Play, X, Loader2 } from "lucide-react";
import type { WorkspaceAsset } from "./types";

export default function WorkspaceAssetRail({
  assets,
  selectedAssetId,
  onSelect,
  onRemove,
}: {
  assets: WorkspaceAsset[];
  selectedAssetId: string | null;
  onSelect: (assetId: string) => void;
  onRemove: (assetId: string) => void;
}) {
  if (assets.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-white/[0.06] shrink-0">
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {assets.map((asset) => {
          const isSelected = asset.id === selectedAssetId;
          const isFailed = asset.status === "failed";

          return (
            <div
              key={asset.id}
              className={`relative shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden cursor-pointer transition-all group ${
                isSelected
                  ? "ring-2 ring-accent ring-offset-1 ring-offset-[#0a0f1e]"
                  : "border border-white/[0.06] hover:border-white/[0.15]"
              } ${isFailed ? "opacity-60" : ""}`}
              onClick={() => onSelect(asset.id)}
            >
              {asset.type === "video" && asset.dataUrl ? (
                <>
                  <video
                    src={asset.dataUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={14} className="text-white/80 fill-current" />
                  </div>
                </>
              ) : asset.dataUrl ? (
                <img
                  src={asset.dataUrl}
                  alt={asset.prompt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                  <Loader2 size={16} className="text-text-muted animate-spin" />
                </div>
              )}

              {/* 类型角标 */}
              <div className="absolute top-1 left-1">
                {asset.type === "video" ? (
                  <div className="w-4 h-4 rounded bg-black/50 flex items-center justify-center">
                    <Play size={8} className="text-white/80 fill-current" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded bg-black/50 flex items-center justify-center">
                    <ImageIcon size={8} className="text-white/80" />
                  </div>
                )}
              </div>

              {/* 删除按钮 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(asset.id);
                }}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-black/50 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex hover:bg-black/70"
              >
                <X size={10} className="text-white/70" />
              </button>

              {/* 选中指示点 */}
              {isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
