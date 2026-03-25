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
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
  children?: SidebarItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "首页",     href: "/dashboard",                 color: "bg-[#FFD93D]" },
  {
    icon: Folder, label: "我的项目", href: "/dashboard/project", color: "bg-[#74B9FF]",
    children: [
      { icon: Video,     label: "AI 视频工场",  href: "/dashboard/project?create=video",  color: "bg-[#74B9FF]" },
      { icon: ImageIcon, label: "AI 绘画工作室", href: "/dashboard/project?create=image",  color: "bg-[#FFB3C6]" },
      { icon: Camera,    label: "数字人",        href: "/dashboard/project?create=avatar", color: "bg-[#4ECDC4]" },
    ],
  },
  {
    icon: FolderUp, label: "资产", href: "/dashboard/assets/hot", color: "bg-[#6BCB77]",
    children: [
      { icon: FolderUp,   label: "我的视图库", href: "/dashboard/assets/my",    color: "bg-[#6BCB77]" },
      { icon: Mic,        label: "我的声音",   href: "/dashboard/assets/voice", color: "bg-[#FFD93D]" },
      { icon: TrendingUp, label: "当前热门",   href: "/dashboard/assets/hot",   color: "bg-[#FF6B6B]" },
      { icon: Lightbulb,  label: "发现灵感",   href: "/dashboard/ideas",        color: "bg-[#C77DFF]" },
    ],
  },
  { icon: Bot,   label: "AI营销助手", href: "/dashboard/marketing-assistant", color: "bg-[#FF6B6B]" },
  { icon: Wand2, label: "AI创作工具", href: "/dashboard/tools",               color: "bg-[#C77DFF]" },
];

export default function DashboardSidebar({ isOpen }: { isOpen: boolean }) {
  const [buildStamp, setBuildStamp] = useState("未知");

  useEffect(() => {
    setBuildStamp(formatBuildStamp(process.env.NEXT_PUBLIC_BUILD_TIME));
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface border-r-2 border-border transition-all duration-(--duration-medium) z-30 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b-2 border-border relative group">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A] shrink-0">
            <Sprout size={20} className="text-white" />
          </div>
          {isOpen && (
            <span className="text-lg font-black text-text-primary tracking-tight">GrowPilot</span>
          )}
        </div>

        <div className="pointer-events-none absolute left-5 top-[66px] w-[230px] bg-surface border-2 border-border shadow-[4px_4px_0px_#1A1A1A] rounded-xl px-4 py-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50">
          <div className="text-sm font-black text-text-primary">GrowPilot v1.5.11</div>
          <div className="mt-1 text-xs text-text-secondary font-medium">Build: {buildStamp}</div>
          <div className="mt-1 text-xs text-text-muted">© 2025 后起智能</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold text-sm transition-all duration-(--duration-fast) group"
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] shrink-0`}>
                <item.icon size={16} className="text-text-primary" />
              </div>
              {isOpen && <span>{item.label}</span>}
            </Link>

            {isOpen && item.children?.length ? (
              <div className="ml-4 pl-4 border-l-2 border-border-light space-y-0.5 my-0.5">
                {item.children.map((child) => (
                  <Link
                    key={`${item.label}_${child.label}`}
                    href={child.href}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium text-sm transition-colors duration-(--duration-fast) group"
                  >
                    <div className={`w-6 h-6 rounded-md ${child.color} border border-border flex items-center justify-center shrink-0`}>
                      <child.icon size={12} className="text-text-primary" />
                    </div>
                    <span>{child.label}</span>
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
