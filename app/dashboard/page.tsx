"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderUp,
  Sparkles,
  Video,
  Zap,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { demoProjects, formatProjectTime } from "@/lib/demoProjects";
import useGeneratedProjects from "@/lib/storage/useGeneratedProjects";
import type { GeneratedProject } from "@/lib/storage";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
  bg: string;
};

type DisplayProject = {
  id: string;
  name: string;
  cover: string;
  updatedAt: string;
  statusText?: string;
  resultType?: string;
};

function isThisWeek(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80";

function toDisplayProject(p: GeneratedProject): DisplayProject {
  return {
    id: p.id,
    name: p.name,
    cover: p.thumbnailUrl || p.resultUrl || DEFAULT_COVER,
    updatedAt: p.createdAt,
    resultType: p.resultType,
  };
}

function demoToDisplayProject(p: { id: number; name: string; updatedAt: string; cover: string; statusText?: string }): DisplayProject {
  return {
    id: String(p.id),
    name: p.name,
    cover: p.cover,
    updatedAt: p.updatedAt,
    statusText: p.statusText,
  };
}

export default function DashboardHomePage() {
  const { projects, usage } = useGeneratedProjects();
  const [userName, setUserName] = useState("创作者");

  // 读取用户名
  useEffect(() => {
    try {
      const raw = localStorage.getItem("growpilot_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user.name) setUserName(user.name);
      }
    } catch {}
  }, []);

  // 统计卡片 — 有真实数据的用真实值，没有的保持 mock
  const weekCount = useMemo(
    () => projects.filter((p) => isThisWeek(p.createdAt)).length,
    [projects]
  );

  const STATS: StatItem[] = [
    { icon: Video,    label: "本周创作", value: String(weekCount),       trend: weekCount > 0 ? `+${weekCount}` : "0", positive: weekCount > 0, bg: "bg-[#FFD93D]" },
    { icon: FolderUp, label: "资产容量", value: formatBytes(usage.used), trend: "",                                 positive: false,              bg: "bg-[#4ECDC4]" },
    { icon: Sparkles, label: "获得积分", value: "1,250",                trend: "+150",                             positive: true,               bg: "bg-[#FFB3C6]" },
    { icon: Zap,      label: "算力消耗", value: String(usage.count),     trend: `共 ${usage.count} 次`,            positive: false,              bg: "bg-[#74B9FF]" },
  ];

  // 最近项目 — 有真实数据用真实的，没有则 fallback demo
  const recentProjects: DisplayProject[] = useMemo(() => {
    if (projects.length > 0) {
      return projects.slice(0, 8).map(toDisplayProject);
    }
    return demoProjects.slice(0, 8).map(demoToDisplayProject);
  }, [projects]);


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
            {stat.trend && (
              <span className={`text-xs font-bold mt-1 inline-block ${stat.positive ? "text-[#6BCB77]" : "text-text-muted"}`}>
                {stat.trend}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── 最近项目 ── */}
      <div className="brut-card p-6 animate-fade-up delay-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-text-primary">最近项目</h2>
            <span className="brut-tag bg-[#6BCB77] text-white">
              {recentProjects.length} 个
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
              href={
                project.resultType === "video"
                  ? "/dashboard/video-factory"
                  : project.resultType === "image"
                    ? "/dashboard/art-studio"
                    : "/dashboard/project"
              }
              className={`animate-fade-up delay-${Math.min(i + 1, 6)} group brut-card overflow-hidden p-0`}
            >
              <div className="relative w-full aspect-16/10 overflow-hidden">
                <img
                  src={project.cover}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER;
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                {project.statusText ? (
                  <div className="absolute left-3 top-3">
                    <span className="brut-tag bg-[#FFD93D] text-black">{project.statusText}</span>
                  </div>
                ) : project.resultType ? (
                  <div className="absolute left-3 top-3">
                    <span className={`brut-tag ${project.resultType === "video" ? "bg-[#74B9FF] text-white" : "bg-[#C77DFF] text-white"}`}>
                      {project.resultType === "video" ? "视频" : project.resultType === "image" ? "图片" : "文本"}
                    </span>
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
