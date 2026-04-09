"use client";

import { useState } from "react";
import { ArrowUpRight, MessageSquare } from "lucide-react";

const QUICK_TOOLS = [
  { label: "AI商品图", icon: "🎨", isNew: true },
  { label: "AI模特", icon: "👤" },
  { label: "AI主图", icon: "🖼️" },
  { label: "AI详情页", icon: "📄" },
  { label: "场景图设计", icon: "🏞️" },
  { label: "营销海报设计", icon: "📢" },
];

interface GuestOverlayProps {
  onOpenLogin: () => void;
  isSidebarOpen?: boolean;
}

export default function GuestOverlay({ onOpenLogin, isSidebarOpen = true }: GuestOverlayProps) {
  const [draft, setDraft] = useState("");

  const sidebarW = isSidebarOpen ? 256 : 80;
  const headerH = 64;

  return (
    <div
      className="fixed z-30 flex items-center justify-center pointer-events-none"
      style={{ left: sidebarW, top: headerH, right: 0, bottom: 0 }}
    >
      {/* 半透明遮罩 */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto"
        onClick={onOpenLogin}
      />

      {/* 内容区域 */}
      <div className="relative z-10 pointer-events-auto w-full max-w-2xl mx-6 flex flex-col items-center gap-8">
        {/* 标题 */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-text-primary leading-snug">
            Hi 您好，今天想{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple">
              创作
            </span>{" "}
            什么?
          </h2>
        </div>

        {/* 伪输入框 */}
        <div
          className="w-full cursor-pointer"
          onClick={onOpenLogin}
        >
          <div className="brut-card-static flex items-center gap-3 px-5 h-14">
            <MessageSquare size={20} className="text-text-muted shrink-0" />
            <span className="text-text-muted flex-1">
              {draft || "描述你想创作的内容，AI 帮你生成..."}
            </span>
            <span className="brut-btn-primary px-4 py-1.5 text-xs">
              登录后创作
            </span>
          </div>
        </div>

        {/* 快捷工具标签 */}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={onOpenLogin}
              className="brut-btn-pill bg-surface text-text-secondary px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              <span>{tool.icon}</span>
              <span className="font-medium">{tool.label}</span>
              {tool.isNew && (
                <span className="brut-tag bg-purple text-white text-[10px] px-1.5 py-0.5">
                  NEW
                </span>
              )}
              <ArrowUpRight size={13} className="text-text-muted" />
            </button>
          ))}
        </div>

        {/* 登录提示 */}
        <button
          type="button"
          onClick={onOpenLogin}
          className="text-sm text-text-muted hover:text-text-primary transition-colors underline underline-offset-4 decoration-border"
        >
          登录后即可开始创作
        </button>
      </div>
    </div>
  );
}
