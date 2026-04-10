"use client";

import { ImageIcon } from "lucide-react";

export default function WorkspaceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full select-none px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        <ImageIcon size={28} className="text-white/10" />
      </div>
      <p className="text-text-muted text-sm text-center">
        在左侧对话中描述你的需求
      </p>
      <p className="text-white/20 text-xs mt-1 text-center">
        AI 生成的图片与视频素材将在此展示
      </p>
    </div>
  );
}
