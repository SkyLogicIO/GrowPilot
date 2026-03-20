"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Camera,
  Folder,
  FolderUp,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  Mic,
  type LucideIcon,
  Sprout,
  TrendingUp,
  Video,
  Wand2,
} from "lucide-react";

const formatBuildStamp = (value: string | undefined) => {
  if (!value) return "未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知";

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: SidebarItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "首页", href: "/dashboard" },
  {
    icon: Folder,
    label: "我的项目",
    href: "/dashboard/project",
    children: [
      { icon: Video, label: "AI 视频工场", href: "/dashboard/project?create=video" },
      { icon: ImageIcon, label: "AI 绘画工作室", href: "/dashboard/project?create=image" },
      { icon: Camera, label: "数字人", href: "/dashboard/project?create=avatar" },
    ],
  },
  {
    icon: FolderUp,
    label: "资产",
    href: "/dashboard/assets/hot",
    children: [
      { icon: FolderUp, label: "我的视图库", href: "/dashboard/assets/my" },
      { icon: Mic, label: "我的声音", href: "/dashboard/assets/voice" },
      { icon: TrendingUp, label: "当前热门", href: "/dashboard/assets/hot" },
      { icon: Lightbulb, label: "发现灵感", href: "/dashboard/ideas" },
    ],
  },
  { icon: Bot, label: "AI营销助手", href: "/dashboard/marketing-assistant" },
  { icon: Wand2, label: "AI创作工具", href: "/dashboard/tools" },
];

export default function DashboardSidebar({ isOpen }: { isOpen: boolean }) {
  const appVersion = "1.5.11";
  const [buildStamp, setBuildStamp] = useState("未知");
  const copyrightText = "Copyright © 2025 后起智能";

  useEffect(() => {
    setBuildStamp(formatBuildStamp(process.env.NEXT_PUBLIC_BUILD_TIME));
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0F1115] border-r border-white/5 transition-all duration-300 z-30 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-6 mb-8 relative group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sprout size={18} className="text-white/95" />
          </div>
          {isOpen && (
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              GrowPilot
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute left-6 top-[66px] w-[260px] rounded-xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 px-4 py-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="text-sm font-semibold text-white">GrowPilot v{appVersion}</div>
          <div className="mt-1 text-xs text-white">Last Build: {buildStamp}</div>
          <div className="mt-1 text-xs text-white">{copyrightText}</div>
        </div>
      </div>

      <nav className="px-3 space-y-2">
        {SIDEBAR_ITEMS.map((item) => (
          <div key={item.label} className="space-y-1">
            <Link
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <item.icon size={22} className="group-hover:text-blue-400 transition-colors" />
              {isOpen && <span>{item.label}</span>}
            </Link>

            {isOpen && item.children?.length ? (
              <div className="space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={`${item.label}_${child.label}`}
                    href={child.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors group ml-6"
                  >
                    <child.icon size={18} className="group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{child.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  );
}
