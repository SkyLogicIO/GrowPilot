"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, FolderUp, ArrowRight, Bot } from "lucide-react";
import { getMe } from "@/lib/api/auth";

export default function DashboardHomePage() {
  const [userName, setUserName] = useState("创作者");

  useEffect(() => {
    // 尝试从本地缓存获取
    try {
      const raw = localStorage.getItem("growpilot_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user.username) setUserName(user.username);
        else if (user.email) setUserName(user.email);
      }
    } catch {}

    // 从后端拉取最新数据
    getMe().then((user) => {
      if (user.username) setUserName(user.username);
      else if (user.email) setUserName(user.email);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── 欢迎区 ── */}
      <div className="flex items-start justify-between gap-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">
            欢迎回来，{userName}
          </h1>
          <p className="text-text-secondary font-medium">今天准备创作什么内容？</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/ideas" className="px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 brut-btn-primary transition-colors">
            <Sparkles size={14} /> 收藏的灵感
          </Link>
          <Link href="/dashboard/assets/hot" className="brut-btn text-text-primary px-4 py-2 text-sm inline-flex items-center gap-2">
            <FolderUp size={14} /> 打开资产
          </Link>
        </div>
      </div>

      {/* ── 功能入口卡片 ── */}
      <Link
        href="/dashboard/ecom-agent"
        className="animate-fade-up delay-1 block rounded-2xl border border-white/[0.08] bg-gradient-to-r from-accent/15 via-accent/8 to-transparent p-6 hover:border-accent/20 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Bot size={22} className="text-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary mb-0.5">电商智能体</h3>
              <p className="text-sm text-text-muted">AI 对话驱动的营销创作，支持文案、卖点分析、图片与视频生成</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-bold flex items-center gap-1.5 group-hover:bg-accent/20 transition-colors">
            立即使用 <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </div>
  );
}
