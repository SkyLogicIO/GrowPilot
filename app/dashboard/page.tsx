"use client";

import Link from "next/link";
import { FolderUp, Plus, Sparkles, Video, Wand2, Zap, type LucideIcon } from "lucide-react";
import { demoProjects, formatProjectTime } from "@/lib/demoProjects";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendClass: string;
  iconClassName?: string;
  iconWrapClassName?: string;
};

const STATS: StatItem[] = [
  {
    icon: Video,
    label: "本周创作",
    value: "12",
    trend: "+20%",
    trendClass: "text-green-400",
    iconClassName: "text-purple-300",
    iconWrapClassName: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: FolderUp,
    label: "资产容量",
    value: "2.4 GB",
    trend: "75% used",
    trendClass: "text-gray-400",
    iconClassName: "text-emerald-300",
    iconWrapClassName: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Sparkles,
    label: "获得积分",
    value: "1,250",
    trend: "+150",
    trendClass: "text-green-400",
    iconClassName: "text-amber-300",
    iconWrapClassName: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Zap,
    label: "算力消耗",
    value: "45",
    trend: "-15%",
    trendClass: "text-red-400",
    iconClassName: "text-blue-300",
  },
];

export default function DashboardHomePage() {
  const recentProjects = demoProjects.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold text-white">欢迎回来，Anna</h1>
            <div className="text-sm font-semibold text-gray-400">今天准备创作什么内容？</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ideas"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-bold transition-colors"
          >
            <Sparkles size={16} />
            打开收藏的灵感
          </Link>
          <Link
            href="/dashboard/assets/hot"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-bold transition-colors"
          >
            <FolderUp size={16} />
            打开资产
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="p-6 bg-[#0F1115] border border-white/5 rounded-2xl">
            <div className="flex items-stretch gap-4">
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center ${
                  stat.iconWrapClassName ?? "bg-white/5 border-white/10"
                }`}
              >
                <stat.icon size={32} className={stat.iconClassName ?? "text-blue-300"} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-gray-400 text-sm mb-2">
                  <span>{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-white flex items-end gap-2">
                    <span>{stat.value}</span>
                  </div>
                  <span className={`text-sm ${stat.trendClass}`}>{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: Plus,
            title: "新建项目",
            desc: "进入项目列表并快速创建",
            href: "/dashboard/project",
          },
          {
            icon: FolderUp,
            title: "添加素材",
            desc: "上传/收藏你的创作素材",
            href: "/dashboard/assets",
          },
          {
            icon: Video,
            title: "AI 视频工场",
            desc: "一键生成短视频",
            href: "/dashboard/project?create=video",
          },
          {
            icon: Wand2,
            title: "AI创作工具",
            desc: "写文案、处理图片",
            href: "/dashboard/tools",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-stretch gap-4 p-6 rounded-2xl bg-[#0F1115] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors"
          >
            <div className="shrink-0 w-16 h-16 rounded-2xl border bg-white/5 border-white/10 flex items-center justify-center">
              <item.icon size={32} className="text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{item.title}</div>
              <div className="text-xs text-gray-400 truncate">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-lg font-bold text-white">最近项目</div>
            <div className="mt-1 text-sm text-gray-400">继续你上次的创作，或查看生成进度</div>
          </div>
          <Link href="/dashboard/project" className="text-sm font-bold text-blue-300 hover:text-blue-200 transition-colors">
            查看全部
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              href="/dashboard/project"
              className="group relative rounded-2xl border border-white/5 overflow-hidden bg-white/5 hover:border-white/10 transition-colors"
            >
              <div className="relative w-full aspect-[16/10]">
                <img
                  src={project.cover}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                {project.statusText ? (
                  <div className="absolute left-3 top-3 px-3 h-8 rounded-full bg-black/35 border border-white/10 backdrop-blur-md flex items-center text-xs font-bold text-white">
                    {project.statusText}
                  </div>
                ) : null}
              </div>

              <div className="p-4">
                <div className="text-white font-bold leading-snug line-clamp-2">{project.name}</div>
                <div className="mt-2 text-xs text-gray-400">更新于 {formatProjectTime(project.updatedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
