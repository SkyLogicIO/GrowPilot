"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bot,
  Camera,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderUp,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  Mic,
  Sparkles,
  type LucideIcon,
  Sprout,
  TrendingUp,
  User,
  UserCircle,
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
  disabled?: boolean;
  hidden?: boolean;
  badge?: string;
  children?: SidebarItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "首页",     href: "/dashboard",                 color: "bg-[#FFD93D]" },
  { icon: Sparkles,         label: "电商智能体", href: "/dashboard/ecom-agent",      color: "bg-[#FF6B6B]" },
  {
    icon: Folder, label: "我的项目", href: "/dashboard/project", color: "bg-[#74B9FF]",
    children: [
      { icon: Video,     label: "AI 视频工场",  href: "/dashboard/video-factory",  color: "bg-[#74B9FF]" },
      { icon: ImageIcon, label: "AI 绘画工作室", href: "/dashboard/art-studio",  color: "bg-[#FFB3C6]" },
      { icon: Camera,    label: "数字人",        href: "/dashboard/project?create=avatar", color: "bg-[#4ECDC4]", hidden: true },
    ],
  },
  {
    icon: FolderUp, label: "资产", href: "/dashboard/assets/hot", color: "bg-[#6BCB77]", hidden: true,
    children: [
      { icon: FolderUp,   label: "我的视图库", href: "/dashboard/assets/my",    color: "bg-[#6BCB77]" },
      { icon: Mic,        label: "我的声音",   href: "/dashboard/assets/voice", color: "bg-[#FFD93D]" },
      { icon: TrendingUp, label: "当前热门",   href: "/dashboard/assets/hot",   color: "bg-[#FF6B6B]" },
      { icon: Lightbulb,  label: "发现灵感",   href: "/dashboard/ideas",        color: "bg-[#C77DFF]" },
    ],
  },
  {
    icon: Camera, label: "商品图设计", href: "/dashboard/product-image", color: "bg-[#FFB3C6]", disabled: true,
    children: [
      { icon: Sparkles,    label: "卖点图设计",   href: "/dashboard/product-image/selling-point", color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "白底图设计",   href: "/dashboard/product-image/white-bg",     color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "主图设计",     href: "/dashboard/product-image/main",         color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "尺寸图设计",   href: "/dashboard/product-image/size",         color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "细节图设计",   href: "/dashboard/product-image/detail",       color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "场景渲染图",   href: "/dashboard/product-image/scene-render", color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "使用场景图",   href: "/dashboard/product-image/scene-use",    color: "bg-[#FFB3C6]", disabled: true },
      { icon: ImageIcon,   label: "营销海报",     href: "/dashboard/product-image/poster",       color: "bg-[#FFB3C6]", disabled: true },
      { icon: ArrowLeftRight,    label: "场景替换",     href: "/dashboard/product-image/scene-swap",   color: "bg-[#FFB3C6]", disabled: true },
      { icon: ArrowLeftRight,    label: "产品替换",     href: "/dashboard/product-image/product-swap", color: "bg-[#FFB3C6]", disabled: true },
    ],
  },
  {
    icon: UserCircle, label: "产品模特", href: "/dashboard/model", color: "bg-[#4ECDC4]", disabled: true,
    children: [
      { icon: User,      label: "AI 模特",    href: "/dashboard/model/ai-model",      color: "bg-[#4ECDC4]", disabled: true, badge: "HOT" },
      { icon: User,      label: "姿势裂变",    href: "/dashboard/model/pose",          color: "bg-[#4ECDC4]", disabled: true, badge: "HOT" },
      { icon: User,      label: "产品数字人",  href: "/dashboard/model/digital-human",  color: "bg-[#4ECDC4]", disabled: true },
      { icon: ArrowLeftRight,  label: "角色替换",    href: "/dashboard/model/role-swap",      color: "bg-[#4ECDC4]", disabled: true },
      { icon: ArrowLeftRight,  label: "产品替换",    href: "/dashboard/model/product-swap",   color: "bg-[#4ECDC4]", disabled: true },
      { icon: ArrowLeftRight,  label: "场景替换",    href: "/dashboard/model/scene-swap",     color: "bg-[#4ECDC4]", disabled: true },
    ],
  },
  { icon: Bot,   label: "AI营销助手", href: "/dashboard/marketing-assistant", color: "bg-[#FF6B6B]" },
  { icon: Wand2, label: "AI创作工具", href: "/dashboard/tools",               color: "bg-[#C77DFF]" },
];

/** 判断 href 是否匹配当前路径（只比较 pathname，忽略 query） */
function matchActive(pathname: string, href: string): boolean {
  const itemPath = href.split("?")[0];
  if (pathname === itemPath) return true;
  // 首页精确匹配：/dashboard 不匹配 /dashboard/xxx
  if (itemPath === "/dashboard") return false;
  return pathname.startsWith(itemPath + "/");
}

/** 判断父级菜单是否应该高亮（自身或任一子项命中） */
function isGroupActive(pathname: string, item: SidebarItem): boolean {
  if (matchActive(pathname, item.href)) return true;
  return item.children?.some((child) => matchActive(pathname, child.href)) ?? false;
}

export default function DashboardSidebar({ isOpen }: { isOpen: boolean }) {
  const [buildStamp, setBuildStamp] = useState("未知");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // 默认展开有子菜单的项
    const defaults = new Set<string>();
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.children?.length) defaults.add(item.label);
    });
    return defaults;
  });
  const pathname = usePathname();

  useEffect(() => {
    setBuildStamp(formatBuildStamp(process.env.NEXT_PUBLIC_BUILD_TIME));
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

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
        {SIDEBAR_ITEMS.filter((item) => !item.hidden).map((item) => {
          const parentActive = isGroupActive(pathname, item);
          const visibleChildren = item.children?.filter((c) => !c.hidden) ?? [];
          const hasChildren = visibleChildren.length > 0;
          const isExpanded = expandedItems.has(item.label);
          const parentClasses = `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-(--duration-fast) group ${
            parentActive
              ? "bg-surface-hover text-text-primary"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`;

          // 有子菜单的一级项：点击切换折叠
          const parentContent = (
            <>
              <div className={`w-8 h-8 rounded-lg ${item.color} border-2 border-border flex items-center justify-center shrink-0 transition-transform duration-(--duration-fast) ${
                parentActive ? "scale-110" : ""
              } ${hasChildren ? "shadow-[2px_2px_0px_#1A1A1A]" : ""}`}>
                <item.icon size={16} className="text-text-primary" />
              </div>
              {isOpen && <span className="flex-1">{item.label}</span>}
              {isOpen && hasChildren && (
                <span className={`shrink-0 transition-transform duration-(--duration-fast) ${isExpanded ? "rotate-0" : "-rotate-90"}`}>
                  <ChevronDown size={14} className="text-text-muted" />
                </span>
              )}
            </>
          );

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.label)}
                  className={`w-full ${parentClasses} text-left cursor-pointer`}
                >
                  {parentContent}
                </button>
              ) : item.disabled ? (
                <div className={parentClasses}>
                  {parentContent}
                </div>
              ) : (
                <Link href={item.href} className={parentClasses}>
                  {parentContent}
                </Link>
              )}

              {isOpen && hasChildren && isExpanded ? (
                <div className="ml-4 pl-4 border-l-2 border-border-light space-y-0.5 my-0.5">
                  {item.children!.filter((c) => !c.hidden).map((child) => {
                    const childActive = matchActive(pathname, child.href);
                    if (child.disabled) {
                      return (
                        <div
                          key={`${item.label}_${child.label}`}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg font-medium text-sm opacity-40 cursor-not-allowed text-text-muted"
                        >
                          <div className={`w-6 h-6 rounded-md ${child.color} border border-border flex items-center justify-center shrink-0 opacity-60`}>
                            <child.icon size={12} className="text-text-primary" />
                          </div>
                          <span>{child.label}</span>
                          {child.badge && (
                            <span className="ml-auto text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FF6B6B] to-[#FFB3C6] text-white">
                              {child.badge}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={`${item.label}_${child.label}`}
                        href={child.href}
                        className={`flex items-center gap-2.5 px-2 py-2 rounded-lg font-medium text-sm transition-colors duration-(--duration-fast) ${
                          childActive
                            ? "bg-accent/15 text-text-primary font-bold"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md ${child.color} border border-border flex items-center justify-center shrink-0 transition-all ${
                          childActive ? "ring-2 ring-accent/50 scale-110" : ""
                        }`}>
                          <child.icon size={12} className="text-text-primary" />
                        </div>
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="ml-auto text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FF6B6B] to-[#FFB3C6] text-white">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
