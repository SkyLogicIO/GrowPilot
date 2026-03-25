"use client";

import Link from "next/link";
import {
  FolderUp,
  Plus,
  Sparkles,
  Video,
  Wand2,
  Zap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { demoProjects, formatProjectTime } from "@/lib/demoProjects";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
  bg: string;
};

const STATS: StatItem[] = [
  { icon: Video,    label: "本周创作", value: "12",     trend: "+20%", positive: true,  bg: "bg-[#FFD93D]" },
  { icon: FolderUp, label: "资产容量", value: "2.4 GB", trend: "75%",  positive: false, bg: "bg-[#4ECDC4]" },
  { icon: Sparkles, label: "获得积分", value: "1,250",  trend: "+150", positive: true,  bg: "bg-[#FFB3C6]" },
  { icon: Zap,      label: "算力消耗", value: "45",     trend: "-15%", positive: false, bg: "bg-[#74B9FF]" },
];

export default function DashboardHomePage() {
  const recentProjects = demoProjects.slice(0, 8);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── 欢迎区 ── */}
      <div className="flex items-start justify-between gap-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">
            欢迎回来，Anna 👋
          </h1>
          <p className="text-text-secondary font-medium">今天准备创作什么内容？</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/ideas" className="brut-btn bg-[#FFD93D] text-text-primary px-4 py-2 text-sm inline-flex items-center gap-2">
            <Sparkles size={14} /> 收藏的灵感
          </Link>
          <Link href="/dashboard/assets/hot" className="brut-btn bg-surface text-text-primary px-4 py-2 text-sm inline-flex items-center gap-2">
            <FolderUp size={14} /> 打开资产
          </Link>
        </div>
      </div>

      {/* ── 统计卡片 ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-up delay-1">
        {STATS.map((stat, i) => (
          <div key={i} className={`delay-${i + 1} brut-card p-5`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-text-secondary">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]`}>
                <stat.icon size={16} className="text-text-primary" />
              </div>
            </div>
            <div className="text-3xl font-black text-text-primary tabular-nums">
              {stat.value}
            </div>
            <span className={`text-xs font-bold mt-1 inline-block ${stat.positive ? "text-[#6BCB77]" : "text-text-muted"}`}>
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      {/* ── 快捷入口 ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-up delay-2">
        {[
          { icon: Plus,     title: "新建项目",    desc: "进入项目列表并快速创建", href: "/dashboard/project",              bg: "bg-[#FF6B6B]",  textColor: "text-white" },
          { icon: FolderUp, title: "添加素材",    desc: "上传/收藏你的创作素材",  href: "/dashboard/assets",               bg: "bg-[#4ECDC4]",  textColor: "text-white" },
          { icon: Video,    title: "AI 视频工场", desc: "一键生成短视频",         href: "/dashboard/project?create=video", bg: "bg-[#C77DFF]",  textColor: "text-white" },
          { icon: Wand2,    title: "AI创作工具",  desc: "写文案、处理图片",       href: "/dashboard/tools",                bg: "bg-[#FFD93D]",  textColor: "text-black" },
        ].map((item, i) => (
          <Link
            key={item.title}
            href={item.href}
            className={`delay-${i + 1} group brut-card ${item.bg} flex items-center gap-4 p-5`}
          >
            <item.icon size={22} className={item.textColor} />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-black ${item.textColor} truncate`}>{item.title}</div>
              <div className={`text-xs truncate mt-0.5 ${item.textColor} opacity-70 font-medium`}>{item.desc}</div>
            </div>
            <ArrowRight size={16} className={`${item.textColor} shrink-0 transition-transform duration-150 group-hover:translate-x-0.5`} />
          </Link>
        ))}
      </div>

      {/* ── 最近项目 ── */}
      <div className="brut-card p-6 animate-fade-up delay-3">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-text-primary">最近项目</h2>
            <span className="brut-tag bg-[#6BCB77] text-white">
              {demoProjects.slice(0, 8).length} 个
            </span>
          </div>
          <Link href="/dashboard/project" className="brut-btn bg-surface text-text-primary px-4 py-1.5 text-sm inline-flex items-center gap-1.5">
            查看全部 <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentProjects.map((project, i) => (
            <Link
              key={project.id}
              href="/dashboard/project"
              className={`animate-fade-up delay-${Math.min(i + 1, 6)} group brut-card overflow-hidden p-0`}
            >
              <div className="relative w-full aspect-16/10 overflow-hidden">
                <img
                  src={project.cover}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                {project.statusText ? (
                  <div className="absolute left-3 top-3">
                    <span className="brut-tag bg-[#FFD93D] text-black">{project.statusText}</span>
                  </div>
                ) : null}
              </div>

              <div className="p-4">
                <div className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
                  {project.name}
                </div>
                <div className="mt-2 text-xs text-text-muted font-medium">
                  更新于 {formatProjectTime(project.updatedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
