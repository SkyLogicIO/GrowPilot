"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bot,
  Camera,
  ChevronDown,
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
  { icon: LayoutDashboard, label: "首页",     href: "/dashboard",                 color: "bg-accent" },
  { icon: Sparkles,         label: "电商智能体", href: "/dashboard/ecom-agent",      color: "bg-indigo-500" },
  {
    icon: Folder, label: "我的项目", href: "/dashboard/project", color: "bg-cyan-500", hidden: true,
    children: [
      { icon: Video,     label: "AI 视频工场",  href: "/dashboard/video-factory",  color: "bg-cyan-500" },
      { icon: ImageIcon, label: "AI 绘画工作室", href: "/dashboard/art-studio",  color: "bg-violet-500" },
      { icon: Camera,    label: "数字人",        href: "/dashboard/project?create=avatar", color: "bg-teal-500", hidden: true },
    ],
  },
  {
    icon: FolderUp, label: "资产", href: "/dashboard/assets/hot", color: "bg-emerald-500", hidden: true,
    children: [
      { icon: FolderUp,   label: "我的视图库", href: "/dashboard/assets/my",    color: "bg-emerald-500" },
      { icon: Mic,        label: "我的声音",   href: "/dashboard/assets/voice", color: "bg-sky-400" },
      { icon: TrendingUp, label: "当前热门",   href: "/dashboard/assets/hot",   color: "bg-rose-500" },
      { icon: Lightbulb,  label: "发现灵感",   href: "/dashboard/ideas",        color: "bg-purple-500" },
    ],
  },
  {
    icon: Camera, label: "商品图设计", href: "/dashboard/product-image", color: "bg-pink-500", disabled: true,
    children: [
      { icon: Sparkles,    label: "卖点图设计",   href: "/dashboard/product-image/selling-point", color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "白底图设计",   href: "/dashboard/product-image/white-bg",     color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "主图设计",     href: "/dashboard/product-image/main",         color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "尺寸图设计",   href: "/dashboard/product-image/size",         color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "细节图设计",   href: "/dashboard/product-image/detail",       color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "场景渲染图",   href: "/dashboard/product-image/scene-render", color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "使用场景图",   href: "/dashboard/product-image/scene-use",    color: "bg-pink-500", disabled: true },
      { icon: ImageIcon,   label: "营销海报",     href: "/dashboard/product-image/poster",       color: "bg-pink-500", disabled: true },
      { icon: ArrowLeftRight,    label: "场景替换",     href: "/dashboard/product-image/scene-swap",   color: "bg-pink-500", disabled: true },
      { icon: ArrowLeftRight,    label: "产品替换",     href: "/dashboard/product-image/product-swap", color: "bg-pink-500", disabled: true },
    ],
  },
  {
    icon: UserCircle, label: "产品模特", href: "/dashboard/model", color: "bg-teal-500", disabled: true,
    children: [
      { icon: User,      label: "AI 模特",    href: "/dashboard/model/ai-model",      color: "bg-teal-500", disabled: true, badge: "HOT" },
      { icon: User,      label: "姿势裂变",    href: "/dashboard/model/pose",          color: "bg-teal-500", disabled: true, badge: "HOT" },
      { icon: User,      label: "产品数字人",  href: "/dashboard/model/digital-human",  color: "bg-teal-500", disabled: true },
      { icon: ArrowLeftRight,  label: "角色替换",    href: "/dashboard/model/role-swap",      color: "bg-teal-500", disabled: true },
      { icon: ArrowLeftRight,  label: "产品替换",    href: "/dashboard/model/product-swap",   color: "bg-teal-500", disabled: true },
      { icon: ArrowLeftRight,  label: "场景替换",    href: "/dashboard/model/scene-swap",     color: "bg-teal-500", disabled: true },
    ],
  },
  { icon: Bot,   label: "AI营销助手", href: "/dashboard/marketing-assistant", color: "bg-indigo-500", hidden: true },
  { icon: Wand2, label: "AI创作工具", href: "/dashboard/tools",               color: "bg-violet-500" },
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
      className={`fixed left-0 top-0 h-screen bg-[#030710] border-r border-accent/[0.08] transition-all duration-(--duration-medium) z-30 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06] relative group">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <Sprout size={20} className="text-white drop-shadow-sm" />
          </div>
          {isOpen && (
            <span className="text-lg font-black text-text-primary tracking-tight">GrowPilot</span>
          )}
        </div>

        <div className="pointer-events-none absolute left-5 top-[66px] w-[230px] bg-slate-900 border border-white/[0.08] rounded-xl px-4 py-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 shadow-xl shadow-black/40">
          <div className="text-sm font-black text-text-primary">GrowPilot v1.5.11</div>
          <div className="mt-1 text-xs text-text-secondary font-medium">Build: {buildStamp}</div>
          <div className="mt-1 text-xs text-text-muted">© 2026 后起智能</div>
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
              ? "bg-accent/10 text-text-primary"
              : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
          }`;

          // 有子菜单的一级项：点击切换折叠
          const parentContent = (
            <>
              <div className={`w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0 transition-all duration-(--duration-fast) ${
                parentActive ? "bg-accent/15 border-blue-500/25" : ""
              }`}>
                <item.icon size={16} className={parentActive ? "text-accent" : "text-text-muted"} />
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
                <div className="ml-4 pl-4 border-l border-white/[0.06] space-y-0.5 my-0.5">
                  {item.children!.filter((c) => !c.hidden).map((child) => {
                    const childActive = matchActive(pathname, child.href);
                    if (child.disabled) {
                      return (
                        <div
                          key={`${item.label}_${child.label}`}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg font-medium text-sm opacity-35 cursor-not-allowed text-slate-400"
                        >
                          <div className={`w-6 h-6 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0`}>
                            <child.icon size={12} className="text-text-muted" />
                          </div>
                          <span>{child.label}</span>
                          {child.badge && (
                            <span className="ml-auto text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
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
                            ? "bg-accent/12 text-white font-bold"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all border ${
                          childActive
                            ? "bg-accent/20 border-accent/30"
                            : "bg-white/[0.04] border-white/[0.08] group-hover:border-white/[0.12]"
                        }`}>
                          <child.icon size={12} className={childActive ? "text-accent" : "text-slate-400"} />
                        </div>
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="ml-auto text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
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
